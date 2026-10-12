window.initScreens = function() {
  if (window.STATIC) return;
  var root = document.documentElement, nav = document.querySelector("header.nav"), reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var snaps = [].slice.call(document.querySelectorAll(".hero, .statband, .ideas, section.part, section.part > .sub-part:not(h2.sr-only + .sub-part), footer .cite-panel"));
  var blocks = [].slice.call(document.querySelectorAll(".hero, .statband, .ideas, section.part > :not(.sr-only), footer .cite-panel")), pending = false;
  blocks.forEach(function(el) {
    el.classList.add("screen");
  });
  function update() {
    pending = false;
    var on = !(reduce && reduce.matches);
    root.classList.toggle("screens", on);
    if (!on) return;
    var top = nav ? nav.getBoundingClientRect().bottom : 0, H = window.innerHeight, avail = H - top;
    if (nav) root.style.scrollPaddingTop = nav.offsetHeight + "px";
    blocks.forEach(function(el) {
      var r = el.getBoundingClientRect();
      if (!r.height) return;
      var vis = Math.max(0, Math.min(1, (Math.min(r.bottom, H) - Math.max(r.top, top)) / Math.min(r.height, avail)));
      var p = Math.max(0, Math.min(1, (vis - 0.05) / 0.6)), e = p * p * (3 - 2 * p);
      el.style.setProperty("--screen-opacity", (0.25 + 0.75 * e).toFixed(3));
    });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
  if (reduce && reduce.addEventListener) reduce.addEventListener("change", schedule);
  update();
  var parts = [].slice.call(document.querySelectorAll("section.part, footer .cite-panel")), gest = null, lastWheel = 0, holdT = null, touching = false, user = false, lastY = window.scrollY, dir = 0, alignT = null;
  function begin() {
    gest = { y: window.scrollY, held: false, stop: 0 };
    user = true;
  }
  function align() {
    if (!user || touching || gest && gest.held || !dir) return;
    user = false;
    var top = nav ? nav.getBoundingClientRect().bottom : 0, R = Math.min(180, window.innerHeight * 0.2), best = null;
    snaps.forEach(function(el) {
      var d = el.getBoundingClientRect().top - top;
      if ((dir > 0 ? d > 2 && d <= R : d < -2 && d >= -R) && (best === null || Math.abs(d) < Math.abs(best))) best = d;
    });
    if (best !== null) window.scrollBy({ top: best, behavior: reduce && reduce.matches ? "auto" : "smooth" });
  }
  function release(ms) {
    clearTimeout(holdT);
    holdT = setTimeout(function() {
      if (touching) return;
      var stop = gest && gest.held ? gest.stop : null;
      root.style.overflow = "";
      gest = null;
      user = false;
      if (stop !== null) settle(stop, 0);
    }, ms);
  }
  function settle(stop, n) {
    setTimeout(function() {
      if (gest) return;
      if (window.scrollY > stop + 8) window.scrollTo({ top: stop, behavior: "smooth" });
      else if (n < 2) settle(stop, n + 1);
    }, 220);
  }
  window.addEventListener("wheel", function(e) {
    var now = Date.now();
    if (!gest || !gest.held && now - lastWheel > 300) begin();
    lastWheel = now;
    user = true;
    if (gest.held) release(300);
  }, { passive: true });
  window.addEventListener("touchstart", function() {
    touching = true;
    if (!gest || !gest.held) begin();
  }, { passive: true });
  window.addEventListener("touchend", function() {
    touching = false;
    if (gest && gest.held) release(350);
  }, { passive: true });
  window.addEventListener("keydown", function(e) {
    if (/^(PageDown| |ArrowDown)$/.test(e.key) && !e.target.closest("input,textarea,select,button,a,summary,[contenteditable]")) begin();
  });
  document.addEventListener("click", function() {
    if (gest && !gest.held) gest = null;
    user = false;
  }, true);
  window.addEventListener("scroll", function() {
    var y = window.scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    clearTimeout(alignT);
    alignT = setTimeout(function() {
      if (gest && !gest.held && !touching) gest = null;
      align();
    }, 150);
    if (!gest || gest.held) return;
    var top = nav ? nav.getBoundingClientRect().bottom : 0;
    for (var i = 0; i < parts.length; i++) {
      var d = parts[i].getBoundingClientRect().top - top, y = window.scrollY + d;
      if (d < -2 && y > gest.y + 2) {
        gest.held = true;
        gest.stop = y;
        root.style.overflow = "hidden";
        window.scrollTo({ top: y, behavior: "instant" });
        release(400);
        return;
      }
    }
  }, { passive: true });
};
