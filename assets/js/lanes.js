(function() {
  var I = "img/icons/", MASCOT = { Reactive: "reactive_agent_1.png", Retrospective: "retro_agent_1.png", ANTE: "policy_agent_1.png" };
  var CHIP = { pass: "pass", fail: "fail", na: "na", trust: "dec trust", abstain: "dec abstain" };
  function mark(m) {
    return m === "check" ? '<span class="ln-mark ok" aria-label="resolved">\u2713</span>' : m === "fail" ? '<span class="ln-mark bad" aria-label="failed">\u2717</span>' : "";
  }
  function block(b) {
    if (b.k === "pre") return '<p class="ln-pre">\u2026 ' + esc(b.text) + "</p>";
    if (b.k === "q") return '<p class="ln-q">' + esc(b.lines.join(" ")) + "</p>";
    if (b.k === "obs") return '<div class="ln-obs">' + b.lines.map(function(l) {
      return '<code class="' + l.role + (l.bold ? " b" : "") + '">' + esc(l.text) + "</code>";
    }).join("") + "</div>";
    if (b.k === "state") return '<div class="ln-state ' + (b.label === "Memory State" ? "mem" : "bel") + '"><span class="ln-slab">' + esc(b.label) + "</span><p>" + esc(b.lines.join(" ")) + "</p></div>";
    if (b.k === "chips") return b.rows.map(function(r) {
      return '<div class="ln-chips"><span class="ln-clab">' + esc(r.label) + "</span>" + r.chips.map(function(c) {
        return '<span class="fs-chip ' + CHIP[c.cls] + '">' + esc(c.text) + "</span>";
      }).join("") + (r.trail ? '<span class="ln-trail">' + esc(r.trail) + "</span>" : "") + "</div>";
    }).join("");
    if (b.k === "note") return '<p class="ln-note">' + esc(b.text) + "</p>";
    return "";
  }
  window.renderLanes = function(el) {
    var F = window.ANTE.fig6_case, n = F.beats.length, b = window.STATIC ? n : 0, timer = null, started = false, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lead = F.par.split(/(?<=\.)\s+(?=[A-Z])/).filter(function(s) {
      return !/^(follows one issue|shows how the three models)/.test(s);
    }).join(" ");
    var head = '<div class="ln-task"><img src="' + I + 'repo_task_1.png" alt=""><div><div class="ln-title">' + esc(F.title) + '</div><div class="ln-head">' + F.header.map(function(h) {
      return h.role === "muted" ? esc(h.text) : '<code class="' + h.role + '">' + esc(h.text) + "</code>";
    }).join("") + "</div></div></div>";
    function ctl() {
      return '<div class="ln-beats">' + F.beats.map(function(t, k) {
        return '<button type="button" data-b="' + k + '" class="' + (b === n ? "done" : k === b ? "on" : k < b ? "done" : "") + '"><span>' + (k + 1) + "</span>" + esc(t) + "</button>";
      }).join("") + '<button type="button" data-b="' + n + '" class="out' + (b === n ? " on" : "") + '"><span>\u2713</span>Outcome</button></div>';
    }
    function grid() {
      return '<div class="ln-grid">' + F.lanes.map(function(L) {
        return '<div class="ln-row ' + L.lane.toLowerCase() + '"><div class="ln-rail"><img src="' + I + MASCOT[L.lane] + '" alt=""><b class="ln-name">' + esc(L.name) + '</b><span class="ln-steps">' + esc(L.steps) + '</span><div class="ln-verdict' + (b === n ? " open" : "") + '">' + mark(L.mark) + '<span class="ln-vtext ' + (L.mark === "check" ? "ok" : "bad") + '">' + esc(L.verdict) + '</span><span class="ln-detail">' + esc(L.detail) + "</span></div></div>" + L.beats.map(function(B, k) {
          var st = b === n ? "all" : k === b ? "on" : k < b ? "past" : "future";
          return '<div class="ln-card ' + st + '" data-b="' + k + '"><div class="ln-chead"><span class="fs-pill">' + esc(B.step) + "</span>" + mark(B.mark) + "</div>" + B.blocks.map(block).join("") + "</div>";
        }).join("") + "</div>";
      }).join("") + "</div>";
    }
    function btns() {
      return '<div class="fs-btns ln-btns"><button type="button" data-act="prev" ' + (b === 0 ? "disabled" : "") + '>\u25C0 Previous</button><button type="button" data-act="play">' + (timer ? "Pause" : "Play") + '</button><button type="button" data-act="next" ' + (b === n ? "disabled" : "") + ">Next \u25B6</button></div>";
    }
    function paint() {
      el.innerHTML = '<p class="sub ln-lead">' + siteEdit(lead) + "</p>" + head + ctl() + grid() + btns() + '<p class="caption ln-cap">' + caption2(siteEdit(F.caption)) + "</p>";
      if (window.inlineAssets) window.inlineAssets();
    }
    function stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    function schedule() {
      stop();
      if (b >= n) {
        paint();
        return;
      }
      timer = setTimeout(function() {
        b++;
        paint();
        schedule();
      }, 3400);
      paint();
    }
    el.addEventListener("click", function(e) {
      var t = e.target.closest("[data-b],[data-act]");
      if (!t || !el.contains(t)) return;
      started = true;
      if (t.dataset.act === "play") {
        if (timer) {
          stop();
          paint();
        } else {
          if (b >= n) b = 0;
          schedule();
        }
        return;
      }
      stop();
      if (t.dataset.act === "prev") b = Math.max(0, b - 1);
      else if (t.dataset.act === "next") b = Math.min(n, b + 1);
      else if (t.dataset.b !== void 0) b = +t.dataset.b;
      paint();
    });
    paint();
    if (!window.STATIC && !reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(es) {
        es.forEach(function(x) {
          if (x.isIntersecting && !started) {
            started = true;
            schedule();
          } else if (!x.isIntersecting && timer) {
            stop();
            paint();
          }
        });
      }, { threshold: 0.35 });
      io.observe(el);
    }
  };
})();
