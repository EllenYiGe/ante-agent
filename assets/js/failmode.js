(function() {
  var I = "img/icons/";
  function inRange(tag, x) {
    var m = String(tag).match(/(\d+)(?:–(\d+))?/);
    if (!m) return false;
    var a = +m[1], z = m[2] ? +m[2] : a;
    return x >= a && x <= z;
  }
  window.renderFailure = function(el, fm) {
    var S = fm.steps, n = S.length, i = window.STATIC ? n : 0, timer = null, started = false, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var parts = siteEdit(fm.text).split(/(?<=[.!?])\s+(?=[A-Z<])/), remedy = parts.pop(), intro = parts.join(" ");
    var cov = (fm.verdict.note.match(/covers steps ([\d, and]+)/) || [])[1], nums = cov ? cov.match(/\d+/g).map(Number) : [];
    function cred(tag) {
      return nums.some(function(x) {
        return inRange(tag, x);
      });
    }
    function obsCls(o) {
      return /error|fatal|No module|failed|fails/i.test(o) ? " err" : /PASS|pass/.test(o) ? " ok" : "";
    }
    function track() {
      return '<div class="fm-track">' + S.map(function(s, k) {
        return '<button type="button" data-i="' + k + '" class="' + (k === i ? "on" : k < i ? "done" : "") + (i === n && cred(s.tag) ? " cred" : "") + '">' + esc(s.tag) + "</button>";
      }).join('<i class="fm-arrow">\u2192</i>') + '<i class="fm-arrow">\u2192</i><button type="button" data-i="' + n + '" class="end ' + (fm.verdict.ok ? "ok" : "bad") + (i === n ? " on" : "") + '">' + esc(fm.verdict.text) + "</button></div>";
    }
    function stage() {
      if (i === n) return '<div class="fm-end ' + (fm.verdict.ok ? "ok" : "bad") + '"><div class="fm-v"><span class="ln-mark ' + (fm.verdict.ok ? "ok" : "bad") + '">' + (fm.verdict.ok ? "\u2713" : "\u2717") + "</span><b>" + esc(fm.verdict.text) + "</b><span>" + esc(fm.verdict.note) + '</span></div><div class="fm-remedy"><img src="' + I + 'policy_agent_1.png" alt=""><p>' + remedy + "</p></div></div>";
      var s = S[i];
      return '<div class="fm-step"><div class="fs-head"><span class="fs-pill">' + esc(s.tag) + '</span><span class="fs-narr">' + esc(s.text) + "</span></div>" + (s.code ? '<code class="fs-cmd">' + esc(s.code) + "</code>" : "") + (s.obs ? '<code class="fs-out' + obsCls(s.obs) + '">\u2192 ' + esc(s.obs) + "</code>" : "") + "</div>";
    }
    function paint() {
      el.innerHTML = '<div class="fm"><div class="fm-arm"><code>' + esc(fm.task) + "</code> \xB7 " + esc(fm.arm) + '</div><p class="fm-intro">' + caption2(intro) + "</p>" + track() + '<div class="fm-stage">' + stage() + '</div><div class="fs-btns fm-btns"><button type="button" data-act="prev" ' + (i === 0 ? "disabled" : "") + '>\u25C0 Previous</button><button type="button" data-act="play">' + (timer ? "Pause" : "Play") + '</button><button type="button" data-act="next" ' + (i === n ? "disabled" : "") + ">Next \u25B6</button></div></div>";
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
      if (i >= n) {
        paint();
        return;
      }
      timer = setTimeout(function() {
        i++;
        paint();
        schedule();
      }, 2800);
      paint();
    }
    el.addEventListener("click", function(e) {
      var t = e.target.closest("[data-i],[data-act]");
      if (!t || !el.contains(t)) return;
      started = true;
      if (t.dataset.act === "play") {
        if (timer) {
          stop();
          paint();
        } else {
          if (i >= n) i = 0;
          schedule();
        }
        return;
      }
      stop();
      if (t.dataset.act === "prev") i = Math.max(0, i - 1);
      else if (t.dataset.act === "next") i = Math.min(n, i + 1);
      else if (t.dataset.i !== void 0) i = +t.dataset.i;
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
