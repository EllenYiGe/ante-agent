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
  el.innerHTML = '<div class="ha-top"><span class="ha-label"><b>django/django #14349</b> from SWE-bench Verified</span><span class="ha-dots">' + frames.map(function(f, i) {
    return '<button type="button" class="ha-dot" data-f="' + i + '" aria-label="Show step ' + f.step + '"></button>';
  }).join("") + '</span></div><div class="ha-row"><div class="ha-card" data-p="0"><div class="ha-k">Anticipate</div><div class="ha-s">Forecast, written before the action</div><div class="ha-think"></div><div class="ha-chips"></div></div><div class="ha-arrow" data-p="1"><i></i></div><div class="ha-card" data-p="1"><div class="ha-k">Execute</div><div class="ha-s">The action runs in the repository</div><code class="ha-run"></code></div><div class="ha-arrow" data-p="2"><i></i></div><div class="ha-card" data-p="2"><div class="ha-k">Verify</div><div class="ha-s">Execution checks the forecast</div><span class="ha-verdict"></span><span class="ha-vsub"></span></div></div><p class="ha-foot"></p>';
  var cards = [].slice.call(el.querySelectorAll(".ha-card")), arrows = [].slice.call(el.querySelectorAll(".ha-arrow")), dots = [].slice.call(el.querySelectorAll(".ha-dot"));
  var still = window.STATIC || window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, cur = 0, phase = 2, timer = 0, visible = true, holdUntil = 0;
  function show(i) {
    var f = frames[i];
    cur = i;
    el.querySelector(".ha-think").textContent = "\u201C" + f.think + "\u201D";
    el.querySelector(".ha-chips").innerHTML = f.chips.map(function(c) {
      return "<span>" + esc(c) + "</span>";
    }).join("");
    el.querySelector(".ha-run").textContent = f.run;
    var v = el.querySelector(".ha-verdict");
    v.className = "ha-verdict " + f.v;
    v.textContent = (f.v === "ok" ? "\u2713 " : "\u2717 ") + f.vt;
    el.querySelector(".ha-vsub").textContent = f.vs;
    el.querySelector(".ha-foot").textContent = f.foot;
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
