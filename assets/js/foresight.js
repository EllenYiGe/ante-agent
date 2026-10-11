(function() {
  var A = window.ANTE, E = A.tto_episodes, I = "img/icons/";
  function frames(key) {
    var e = E[key], out = [];
    e.items.forEach(function(it) {
      if (it.kind === "fold") {
        var m = it.text.match(/Steps (\d+)–(\d+)/);
        if (e.beliefs && m) {
          for (var n = +m[1]; n <= +m[2]; n++) out.push({ kind: "step", n, belief: e.beliefs[n] });
        } else out.push({ kind: "fold", text: it.text.replace(/^…\s*/, ""), label: m ? m[1] + "\u2013" + m[2] : "\u2026" });
      } else if (it.kind === "trigger") {
        var k = +it.title.match(/\d+/)[0];
        out.push({ kind: "trigger", n: k, trig: it, belief: e.beliefs && e.beliefs[k] });
      } else out.push({ kind: "step", n: it.n, narr: it.narr, cmd: it.cmd, out: it.out, belief: e.beliefs && e.beliefs[it.n] });
    });
    out.push({ kind: "settle", lines: e.settle });
    return out;
  }
  function chipTT(v) {
    return '<span class="fs-chip ' + (v === "PASS" ? "pass" : v === "FAIL" ? "fail" : "na") + '">target_test = ' + esc(v) + "</span>";
  }
  function chipEX(v) {
    return '<span class="fs-chip ' + (v ? "pass" : "fail") + '">exit_ok = ' + (v ? "true" : "false") + "</span>";
  }
  function chipD(d) {
    return '<span class="fs-chip dec ' + esc(d) + '">decision: ' + esc(d) + "</span>";
  }
  function beliefPanel(b) {
    return '<div class="fs-col fs-belief"><div class="fs-lab">Belief state, written before the action</div><p class="fs-sum">' + esc(b.summary) + '</p><div class="fs-chips">' + chipTT(b.target_test) + chipEX(b.exit_ok) + chipD(b.decision) + "</div></div>";
  }
  function verdict(f) {
    var b = f.belief;
    if (!b) return "";
    if (b.target_test === "NA") return '<div class="fs-status">No check runs at this step, so the test field of the forecast is NA; the policy ' + (b.decision === "trust" ? "trusts" : "abstains on") + " its forecast.</div>";
    var o = f.out && f.out[0] || "";
    var res = /^PASS/.test(o) ? "PASS" : /FAIL/.test(o) ? "FAIL" : null;
    if (res) return '<div class="fs-status ' + (res === b.target_test ? "hit" : "miss") + '">Forecast ' + esc(b.target_test) + ", " + (b.decision === "abstain" ? "abstained" : "trusted") + "; the executed check returns " + esc(res) + ": the forecast is " + (res === b.target_test ? "confirmed" : "refuted") + ".</div>";
    return "";
  }
  function mark(f) {
    if (f.kind === "trigger") return "tto";
    if (f.kind !== "step" || !f.belief) return "";
    var b = f.belief;
    if (b.target_test === "NA") return "na";
    var o = f.out && f.out[0] || "";
    var res = /^PASS/.test(o) ? "PASS" : /FAIL/.test(o) ? "FAIL" : null;
    return res ? res === b.target_test ? "hit" : "miss" : "";
  }
  var MARKS = { tto: "ANTE-TTO trigger", na: "no check at this step (forecast NA)", hit: "forecast confirmed by execution", miss: "forecast refuted by execution" };
  function stepFrame(f) {
    var b = f.belief, cmd = f.cmd || b && b.call || "", outs = f.out || (b && b.obs ? [b.obs] : []);
    return '<div class="fs-head"><span class="fs-pill">Step ' + f.n + "</span>" + (f.narr ? '<span class="fs-narr">' + esc(f.narr) + "</span>" : "") + '</div><div class="fs-cols' + (b ? "" : " two") + '">' + (b ? beliefPanel(b) : "") + '<div class="fs-col fs-action"><div class="fs-lab">Action</div>' + (cmd ? '<code class="fs-cmd">' + esc(cmd) + "</code>" : '<span class="fs-muted">no command</span>') + '</div><div class="fs-col fs-exec' + (b && outs.length ? " gated" : "") + '"><div class="fs-lab">Execution</div>' + (b && outs.length ? '<button type="button" class="fs-run" data-act="run">Run the Action \u25B6</button>' : "") + '<div class="fs-exec-body">' + (outs.length ? outs.map(function(o) {
      return '<code class="fs-out' + (/^\+/.test(o) ? " add" : /^-/.test(o) ? " del" : /Error|Traceback/.test(o) ? " err" : /^PASS|^OK|RESOLVED/.test(o) ? " ok" : "") + '">' + esc(o) + "</code>";
    }).join("") : '<span class="fs-muted">no output shown</span>') + '</div></div></div><div class="fs-verdict' + (b && outs.length ? " gated" : "") + '">' + verdict(f) + "</div>";
  }
  function triggerFrame(f, key) {
    var t = f.trig, rows = t.rows, rule = rows.filter(function(r) {
      return /Score =/.test(r);
    })[0] || "", belief = [];
    rows.filter(function(r) {
      return !/Score =/.test(r);
    }).forEach(function(r) {
      if (/^(state_summary|predicted): /.test(r) || !belief.length) belief.push(r);
      else belief[belief.length - 1] += " " + r;
    });
    var picked = t.cands.filter(function(c) {
      return c.picked;
    })[0];
    var after = key === "swe" ? E.swe.intro.split(/(?<=\.)\s+/).filter(function(s) {
      return /executed check/.test(s);
    })[0] : "";
    return '<div class="fs-head"><span class="fs-pill tto"><img src="' + I + 'oracle_agent_1.png" alt="">' + esc(t.title) + '</span><span class="fs-narr">' + esc(t.tag) + '</span></div><div class="fs-trig"><div class="fs-col fs-belief"><div class="fs-lab">Belief state, written before the action</div>' + belief.map(function(r) {
      return '<p class="fs-sum mono">' + esc(r).replace(/^(state_summary|predicted): /, "<b>$1</b> ") + "</p>";
    }).join("") + '</div><div class="fs-rule"><div class="fs-lab">Candidates ranked by their own beliefs</div><code class="fs-cmd">' + esc(rule.replace(/^→\s*/, "")) + '</code></div><div class="fs-cands">' + t.cands.map(function(c, i) {
      return '<div class="fs-cand' + (c.picked ? " picked" : "") + '" style="animation-delay:' + (0.25 + i * 0.35) + 's"><div class="fs-cand-name">' + esc(c.name) + (c.picked ? '<span class="fs-picked">Picked</span>' : "") + "</div><code>" + c.lines.map(esc).join("\n") + '</code><div class="fs-score">' + esc(c.score) + "</div></div>";
    }).join("") + '</div><div class="fs-status tto">' + esc(siteEdit(A.tto_execute_sentence || "")) + (after ? " " + esc(siteEdit(after)) : "") + "</div></div>";
  }
  function foldFrame(f) {
    return '<div class="fs-head"><span class="fs-pill">Steps ' + esc(f.label) + '</span><span class="fs-narr">' + esc(f.text) + '</span></div><div class="fs-fold">\u2026</div>';
  }
  function settleFrame(f) {
    return '<div class="fs-settle"><div class="fs-check">\u2713</div><div><div class="fs-settle-h">' + esc(f.lines[0]) + '</div><div class="fs-settle-s">' + esc(f.lines[1]) + "</div></div></div>";
  }
  window.renderForesight = function(el) {
    var key = "swe", F = frames(key), i = 0, timer = null, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.className = "fs";
    function tabs() {
      return '<div class="fs-tabs">' + ["swe", "term"].map(function(k) {
        return '<button type="button" data-key="' + k + '" aria-pressed="' + (k === key) + '"><img src="' + I + E[k].icon + '.png" alt="">' + esc(E[k].title) + "<small>" + esc(E[k].steps_label) + "</small></button>";
      }).join("") + "</div>";
    }
    function stepper() {
      return '<div class="fs-stepper">' + F.map(function(f, k) {
        var lab = f.kind === "settle" ? "\u2713" : f.kind === "fold" ? f.label : String(f.n);
        var mk = mark(f);
        return '<button type="button" data-i="' + k + '" class="' + (k === i ? "on" : k < i ? "done" : "") + (f.kind === "trigger" ? " tto" : "") + '" title="' + (MARKS[mk] || "") + '">' + lab + (mk ? '<i class="mk ' + mk + '"></i>' : "") + "</button>";
      }).join("") + '<span class="fs-key"><i class="mk hit"></i>Forecast confirmed <i class="mk miss"></i>Refuted <i class="mk na"></i>No check <i class="mk tto"></i>ANTE-TTO</span></div>';
    }
    function paint() {
      var f = F[i], e = E[key];
      el.innerHTML = tabs() + '<div class="fs-task"><img src="' + I + e.icon + '.png" alt=""><div>' + e.task.map(function(t, k) {
        return '<div class="' + (k ? "fs-task-s" : "fs-task-h") + '">' + esc(t) + "</div>";
      }).join("") + '</div></div><div class="fs-ctl">' + stepper() + '<div class="fs-btns"><button type="button" data-act="prev" ' + (i === 0 ? "disabled" : "") + '>\u25C0 Previous</button><button type="button" data-act="play">' + (timer ? "Pause" : "Play") + '</button><button type="button" data-act="next" ' + (i === F.length - 1 ? "disabled" : "") + '>Next \u25B6</button></div></div><div class="fs-stage ' + f.kind + '">' + (f.kind === "step" ? stepFrame(f) : f.kind === "trigger" ? triggerFrame(f, key) : f.kind === "fold" ? foldFrame(f) : settleFrame(f)) + "</div>";
      if (window.inlineAssets) window.inlineAssets();
    }
    function reveal() {
      el.querySelectorAll(".gated").forEach(function(x) {
        x.classList.add("open");
      });
    }
    function stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (revealTimer) {
        clearTimeout(revealTimer);
        revealTimer = null;
      }
    }
    var revealTimer = null;
    function schedule() {
      stop();
      if (i >= F.length - 1) return;
      var gated = !!el.querySelector(".gated");
      var d = F[i].kind === "trigger" ? 6500 : gated ? 3600 : 2600;
      if (gated) revealTimer = setTimeout(reveal, 1400);
      timer = setTimeout(function() {
        i++;
        paint();
        schedule();
      }, d);
    }
    el.addEventListener("click", function(e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.key) {
        key = b.dataset.key;
        F = frames(key);
        i = 0;
        paint();
        if (!reduce) schedule();
        return;
      }
      if (b.dataset.i !== void 0) {
        stop();
        i = +b.dataset.i;
        paint();
        return;
      }
      if (b.dataset.act === "run") {
        reveal();
        return;
      }
      if (b.dataset.act === "prev") {
        stop();
        i = Math.max(0, i - 1);
        paint();
      } else if (b.dataset.act === "next") {
        stop();
        i = Math.min(F.length - 1, i + 1);
        paint();
      } else if (b.dataset.act === "play") {
        if (timer) {
          stop();
          paint();
        } else {
          if (i >= F.length - 1) i = 0;
          paint();
          schedule();
          paint();
        }
      }
    });
    el.addEventListener("keydown", function(e) {
      if (e.key === "ArrowRight") {
        stop();
        i = Math.min(F.length - 1, i + 1);
        paint();
      }
      if (e.key === "ArrowLeft") {
        stop();
        i = Math.max(0, i - 1);
        paint();
      }
    });
    el.tabIndex = 0;
    if (window.STATIC) {
      i = F.length - 1;
    }
    paint();
    if (!reduce && !window.STATIC) schedule();
    if (!reduce && !window.STATIC && "IntersectionObserver" in window && window.matchMedia("(max-width:640px)").matches) {
      var held = false;
      el.addEventListener("click", function() {
        held = false;
      }, true);
      new IntersectionObserver(function(es) {
        es.forEach(function(x) {
          if (!x.isIntersecting && timer) {
            stop();
            paint();
            held = true;
          } else if (x.isIntersecting && held) {
            held = false;
            if (i < F.length - 1) schedule();
          }
        });
      }, { threshold: 0.15 }).observe(el);
    }
  };
})();
