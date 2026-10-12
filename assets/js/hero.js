window.renderHeroArt = function(el) {
  if (!el) return;
  var ep = window.ANTE.tto_episodes.swe, B = ep.beliefs, b7 = B["7"], b9 = B["9"];
  var s9 = ep.items.filter(function(x) {
    return x.kind === "step" && x.n === 9;
  })[0] || {};
  function clause(s, cut) {
    var i = s.indexOf(cut);
    var t = i >= 0 ? s.slice(i + cut.length) : s;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  var frames = [
    { step: 7, think: clause(b7.summary, "so "), chips: ["target_test = " + b7.target_test, "decision: " + b7.decision], run: "$ python3 reproduce_issue.py", v: "bad", vt: "Refuted", vs: "The check exposes the issue.", foot: "At step 7, the agent does not trust its forecast, so ANTE-TTO runs the check first. Execution refutes the forecast and exposes the bug." },
    { step: 9, think: clause(b9.summary, "; "), chips: ["target_test = " + b9.target_test, "exit_ok = " + b9.exit_ok], run: s9.cmd || "$ python3 reproduce_issue.py", v: "ok", vt: "Confirmed", vs: s9.out && s9.out[0] || "", foot: "At step 9, after the fix, the same check confirms the forecast." }
  ];
  function swap(tag, cls, html) {
    return "<" + tag + ' class="ha-swap' + (cls ? " " + cls : "") + '">' + frames.map(function(f, i) {
      return '<span class="ha-fr" data-fr="' + i + '">' + html(f) + "</span>";
    }).join("") + "</" + tag + ">";
  }
  el.innerHTML = '<div class="ha-top"><span class="ha-label"><b>django/django #14349</b> from SWE-bench Verified</span><span class="ha-dots">' + frames.map(function(f, i) {
    return '<button type="button" class="ha-dot" data-f="' + i + '" aria-label="Show step ' + f.step + '"></button>';
  }).join("") + '</span></div><div class="ha-row"><div class="ha-card" data-p="0"><div class="ha-k">Anticipate</div><div class="ha-s">Forecast, written before the action</div>' + swap("div", "", function(f) {
    return '<span class="ha-think">\u201C' + esc(f.think) + '\u201D</span><span class="ha-chips">' + f.chips.map(function(c) {
      return "<span>" + esc(c) + "</span>";
    }).join("") + "</span>";
  }) + '</div><div class="ha-arrow" data-p="1"><i></i></div><div class="ha-card" data-p="1"><div class="ha-k">Execute</div><div class="ha-s">The action runs in the repository</div>' + swap("div", "", function(f) {
    return '<code class="ha-run">' + esc(f.run) + "</code>";
  }) + '</div><div class="ha-arrow" data-p="2"><i></i></div><div class="ha-card" data-p="2"><div class="ha-k">Verify</div><div class="ha-s">Execution checks the forecast</div>' + swap("div", "", function(f) {
    return '<span class="ha-verdict ' + f.v + '">' + (f.v === "ok" ? "\u2713 " : "\u2717 ") + esc(f.vt) + '</span><span class="ha-vsub">' + esc(f.vs) + "</span>";
  }) + "</div></div>" + swap("p", "ha-foot", function(f) {
    return esc(f.foot);
  });
  var cards = [].slice.call(el.querySelectorAll(".ha-card")), arrows = [].slice.call(el.querySelectorAll(".ha-arrow")), dots = [].slice.call(el.querySelectorAll(".ha-dot")), frs = [].slice.call(el.querySelectorAll(".ha-fr"));
  var still = window.STATIC || window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, cur = 0, phase = 2, timer = 0, visible = true, holdUntil = 0;
  function show(i) {
    cur = i;
    frs.forEach(function(x) {
      x.classList.toggle("off", +x.dataset.fr !== i);
    });
    dots.forEach(function(d, k) {
      d.setAttribute("aria-pressed", String(k === i));
    });
  }
  function setPhase(p) {
    phase = p;
    cards.forEach(function(c, k) {
      c.classList.toggle("dim", k > p);
      c.classList.toggle("now", k === p);
    });
    arrows.forEach(function(a, k) {
      a.classList.toggle("lit", k + 1 <= p);
      a.classList.remove("go");
      if (k + 1 === p && !still) {
        void a.offsetWidth;
        a.classList.add("go");
      }
    });
  }
  function tick() {
    timer = 0;
    if (still || !visible) return;
    if (Date.now() < holdUntil) {
      timer = setTimeout(tick, 500);
      return;
    }
    if (phase < 2) {
      setPhase(phase + 1);
      timer = setTimeout(tick, phase === 2 ? 3400 : 1300);
    } else {
      show((cur + 1) % frames.length);
      setPhase(0);
      timer = setTimeout(tick, 1300);
    }
  }
  el.addEventListener("click", function(e) {
    var d = e.target.closest(".ha-dot");
    if (!d) return;
    show(+d.dataset.f);
    setPhase(2);
    holdUntil = Date.now() + 9e3;
    if (!timer && !still) timer = setTimeout(tick, 500);
  });
  if ("IntersectionObserver" in window) new IntersectionObserver(function(es) {
    visible = es[0].isIntersecting;
    if (visible && !timer && !still) timer = setTimeout(tick, 900);
  }, { threshold: 0.25 }).observe(el);
  show(0);
  setPhase(2);
  if (!still) timer = setTimeout(tick, 2600);
};
