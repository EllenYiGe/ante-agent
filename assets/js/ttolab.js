(function() {
  var I = "img/icons/";
  window.renderTtoLab = function(el) {
    var A = window.ANTE, E = A.tto_episodes, key = "swe", st;
    function trig() {
      return E[key].items.filter(function(x) {
        return x.kind === "trigger";
      })[0];
    }
    function reset(stage) {
      st = { res: stage !== "start", sc: {}, done: stage === "done", fresh: false };
      if (stage === "done") trig().cands.forEach(function(c, k) {
        st.sc[k] = 1;
      });
    }
    function belief(t) {
      var out = [];
      t.rows.filter(function(r) {
        return !/^(→\s*)?(Resample.*)?Score =/.test(r);
      }).forEach(function(r) {
        if (/^(state_summary|predicted): /.test(r) || !out.length) out.push(r);
        else out[out.length - 1] += " " + r;
      });
      return out;
    }
    function tiles(lit) {
      var T = trig().weights;
      return '<div class="rule-tiles">' + [["PASS", "pass"], ["NA", "na"], ["FAIL", "fail"]].map(function(x) {
        return '<div class="tile ' + x[1] + (lit && lit.tt === x[0] ? " lit" : "") + '"><b>' + x[0] + "</b><span>\u03C6 = " + T[x[0]] + "</span></div>";
      }).join("") + '<div class="tile exit' + (lit && lit.exit_ok ? " lit" : "") + '"><b>exit_ok</b><span>+ ' + T.exit_ok + "</span></div></div>";
    }
    function card(c, k) {
      if (k > 0 && !st.res) return "";
      var t = trig(), W = t.weights, scored = !!st.sc[k], enter = st.fresh && k > 0, best = Math.max.apply(null, t.cands.map(function(x) {
        return x.s;
      }));
      var cls = "tl-cand" + (enter ? " in" : "") + (scored ? " scored" : "") + (st.done && c.picked ? " picked" : "") + (st.done && !c.picked ? " lost" : "");
      return '<div class="' + cls + '" data-k="' + k + '"' + (enter ? ' style="--i:' + (k - 1) + '"' : "") + '><div class="tl-name">' + esc(c.name) + (st.done && c.picked ? '<span class="fs-picked">Picked</span>' : "") + "</div><code>" + c.lines.map(esc).join("\n") + "</code>" + (scored ? '<div class="fs-chips"><span class="fs-chip ' + (c.tt === "PASS" ? "pass" : c.tt === "FAIL" ? "fail" : "na") + '">target_test = ' + c.tt + '</span><span class="fs-chip ' + (c.exit_ok ? "pass" : "fail") + '">exit_ok = ' + c.exit_ok + '</span></div><div class="tl-sum">\u03C6(' + c.tt + ") + exit_ok = " + W[c.tt] + " + " + (c.exit_ok ? W.exit_ok : 0) + " = <b>" + c.s + "</b>" + (st.done && c.s === best ? ' <span class="tl-max">highest</span>' : "") + "</div>" : '<button type="button" class="tl-score" data-score="' + k + '">Score this candidate</button>') + "</div>";
    }
    function paint(lit) {
      var t = trig(), all = t.cands.every(function(c, k) {
        return st.sc[k];
      });
      el.innerHTML = '<div class="fs-tabs">' + ["swe", "term"].map(function(k) {
        var tr = E[k].items.filter(function(x) {
          return x.kind === "trigger";
        })[0];
        return '<button type="button" data-key="' + k + '" aria-pressed="' + (k === key) + '"><img src="' + I + E[k].icon + '.png" alt="">' + esc(E[k].title) + "<small>" + esc(tr.title.split(" \xB7 ")[0]) + "</small></button>";
      }).join("") + '</div><div class="tl-grid"><div class="tl-left"><div class="fs-col fs-belief"><div class="fs-lab">Belief state, written before the action</div>' + belief(t).map(function(r) {
        return '<p class="fs-sum mono">' + esc(r).replace(/^(state_summary|predicted): /, "<b>$1</b> ") + "</p>";
      }).join("") + '</div><div class="tl-trig"><img src="' + I + 'oracle_agent_1.png" alt="">' + esc(t.title) + " \xB7 " + esc(t.tag) + "</div>" + tiles(lit) + '</div><div class="tl-right"><div class="tl-cands">' + t.cands.map(card).join("") + '</div><div class="tl-btns"><button type="button" data-act="res" class="' + (st.res ? "done" : "go") + '" ' + (st.res ? "disabled" : "") + ">" + (st.res ? "\u2713 " : "") + "Resample " + (t.cands.length - 1) + ' Candidates</button><button type="button" data-act="all" class="' + (st.res && !all ? "go" : "") + '" ' + (!st.res || all ? "disabled" : "") + '>Score All</button><button type="button" data-act="run" class="' + (all && !st.done ? "go" : "") + '" ' + (!all || st.done ? "disabled" : "") + '>Execute the Winner \u25B6</button><button type="button" data-act="reset">Reset</button></div>' + (st.done ? '<p class="tl-out">' + esc(siteEdit(A.tto_execute_sentence)) + ' <a href="#replay" data-act="watch">Watch this run step by step \u2191</a></p>' : "") + "</div></div>";
      if (window.inlineAssets) window.inlineAssets();
    }
    el.className = "tl";
    el.addEventListener("click", function(e) {
      var b = e.target.closest("button,a[data-act],.tl-cand");
      if (!b || !el.contains(b)) return;
      var t = trig();
      if (b.dataset.key) {
        key = b.dataset.key;
        reset("rest");
        paint();
        return;
      }
      if (b.dataset.act === "watch") {
        var tab = document.querySelector('#foresight .fs-tabs button[data-key="' + key + '"]');
        if (tab) tab.click();
        return;
      }
      if (b.dataset.act === "res") {
        st.res = true;
        st.fresh = true;
        paint();
        st.fresh = false;
        return;
      }
      if (b.dataset.act === "all") {
        t.cands.forEach(function(c, k2) {
          st.sc[k2] = 1;
        });
        paint();
        return;
      }
      if (b.dataset.act === "run") {
        st.done = true;
        paint();
        return;
      }
      if (b.dataset.act === "reset") {
        reset("start");
        paint();
        return;
      }
      var k = b.dataset.score !== void 0 ? +b.dataset.score : b.classList.contains("tl-cand") ? +b.dataset.k : null;
      if (k !== null && !st.sc[k]) {
        st.sc[k] = 1;
        paint(t.cands[k]);
      }
    });
    reset(window.STATIC ? "done" : "rest");
    paint();
  };
})();
