window.renderHome = function(main) {
  var A = window.ANTE, I = "img/icons/", cut = A.title.indexOf(" \u2013 "), t1 = A.title.slice(0, cut), t2 = A.title.slice(cut + 3);
  var ideas = [
    ["lilac", "Internal Belief", "It writes down what it expects.", "#belief"],
    ["mint", "BAPO", "Every verified forecast earns credit.", "#bapo"],
    ["peach", "ANTE-TTO", "Foresight guides test-time optimization.", "#tto"]
  ];
  var host = document.createElement("div");
  host.innerHTML = '<div class="hero"><h1 class="hero-title"><span class="t1"><img class="tlogo" src="' + I + 'policy_agent_1.png" alt=""><span class="ante">' + esc(t1.slice(0, 4)) + "</span>" + esc(t1.slice(4)) + '</span><span class="tdash"> \u2013 </span><span class="t2">' + esc(t2) + '</span></h1><div class="meta big"><div>' + authorsHTML() + '</div><div class="btns"><button type="button" class="btn primary soon" data-soon="arXiv">arXiv <small>soon</small></button><button type="button" class="btn soon" data-soon="PDF">PDF <small>soon</small></button><button type="button" class="btn soon" data-soon="Code">Code <small>soon</small></button><button type="button" class="btn" onclick="copyBib(this)">Copy BibTeX</button></div><p class="soon-note" aria-live="polite" hidden>Link coming soon.</p></div>' + '<div class="hero-duo"><div class="hero-intro"><p class="hero-slogan">Coding agents, now with <span class="hl">foresight</span>.</p><p class="hero-sub"><b class="an">ANTE</b>, an agentic RL framework that verifies the policy\'s <span class="nw">pre-action</span> predictions.</p></div>' + '<div class="hero-art" id="hero-art"></div></div></div><div class="statband"><div id="statband"></div></div><div class="ideas"><h2>What makes it work</h2><div class="idea-grid">' + ideas.map(function(x) {
    return '<a class="idea ' + x[0] + '" href="' + x[3] + '"><span class="idea-l"><span class="idea-k">' + x[1] + '</span><span class="idea-t">' + x[2] + '</span></span><span class="idea-r"><span class="idea-more">See how \u2193</span></span></a>';
  }).join("") + '</div></div><section id="demo" class="part"><h2 data-toc="Highlight" class="h2-sub">ANTE: Demo</h2><p class="lead lead-left">Each step shows the belief state the policy writes before acting, the action, and what execution returns. When the policy abstains or predicts failure, ANTE-TTO ranks alternative actions by their own forecasts and executes the best one.</p><div id="replay" class="sub-part"><div class="panel-soft"><div id="foresight"></div></div></div><div class="sub-part"><h3>Before and After RL Training: What the World Model Learned</h3><div id="learned"></div></div></section>';
  main.appendChild(host);
  host.addEventListener("click", function(e) {
    var s = e.target.closest("[data-soon]");
    if (s) {
      var n = host.querySelector(".soon-note");
      n.hidden = false;
      n.textContent = s.dataset.soon + " link coming soon.";
      n.classList.remove("flash");
      void n.offsetWidth;
      n.classList.add("flash");
      return;
    }
  });
  renderHeroArt(document.getElementById("hero-art"));
  renderForesight(document.getElementById("foresight"));
  renderLearned(document.getElementById("learned"));
};
