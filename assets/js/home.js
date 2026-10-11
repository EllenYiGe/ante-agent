window.renderHome = function(main) {
  var A = window.ANTE, E = A.tto_episodes, I = "img/icons/", absS = A.abstract.split(/(?<=[.!?])\s+(?=[A-Z])/), anteSent = absS.filter(function(x) {
    return x.indexOf("We present ANTE") === 0;
  })[0] || "", cut = A.title.indexOf(" \u2013 "), t1 = A.title.slice(0, cut), t2 = A.title.slice(cut + 3);
  function taskCard(k) {
    var e = E[k];
    return '<button type="button" class="taskcard" data-replay="' + k + '" title="Replay this run"><img src="' + I + e.icon + '.png" alt=""><span class="tc-body"><span class="tc-h">' + esc(e.task[0]) + "</span>" + (e.task[1] ? '<code class="tc-s">' + esc(e.task[1]) + "</code>" : "") + '<span class="tc-f">' + esc(e.title) + " \xB7 " + esc(e.steps_label.toLowerCase()) + " <b>Replay \u25B6</b></span></span></button>";
  }
  var ideas = [
    ["lilac", "Internal Belief", "It writes down what it expects.", "Before each action, the policy writes a belief state: a brief state summary, an outcome prediction, and a decision to trust or abstain.", "#belief"],
    ["mint", "BAPO", "Every verified forecast earns credit.", "Belief-Anchored Policy Optimization (BAPO) compares steps across rollouts that predict the same outcome, so each step earns credit from its verified forecast and trust decision, beyond the final task reward.", "#bapo"],
    ["peach", "ANTE-TTO", "Foresight guides test-time optimization.", "When the policy abstains or predicts failure, ANTE-TTO samples alternative actions, ranks them by their own forecasts, and executes the best one, with no external scorer.", "#tto"]
  ];
  var host = document.createElement("div");
  host.innerHTML = '<div class="hero"><h1 class="hero-title"><span class="t1"><img class="tlogo" src="' + I + 'policy_agent_1.png" alt=""><span class="ante">' + esc(t1.slice(0, 4)) + "</span>" + esc(t1.slice(4)) + '</span><span class="tdash"> \u2013 </span><span class="t2">' + esc(t2) + '</span></h1><p class="hero-slogan">Coding agents, now with <span class="hl">foresight</span>.</p><div class="meta big"><div>' + authorsHTML() + '</div><div class="btns"><button type="button" class="btn primary soon" data-soon="arXiv">arXiv <small>soon</small></button><button type="button" class="btn soon" data-soon="PDF">PDF <small>soon</small></button><button type="button" class="btn soon" data-soon="Code">Code <small>soon</small></button><button type="button" class="btn" onclick="copyBib(this)">Copy BibTeX</button></div><p class="soon-note" aria-live="polite" hidden>Link coming soon.</p></div>' + (anteSent ? '<p class="hero-sub">' + anteSent.replace("ANTE (Anticipate, Then Execute)", '<b class="an">ANTE</b>') + "</p>" : "") + '<div class="hero-art" id="hero-art"></div></div><div class="statband"><div id="statband"></div></div><div class="ideas"><h2>What makes it work</h2><div class="idea-grid">' + ideas.map(function(x) {
    return '<a class="idea ' + x[0] + '" href="' + x[4] + '"><span class="idea-l"><span class="idea-k">' + x[1] + '</span><span class="idea-t">' + x[2] + '</span></span><span class="idea-r"><span class="idea-d">' + x[3] + '</span><span class="idea-more">See how \u2193</span></span></a>';
  }).join("") + '</div></div><section id="demo" class="part"><h2 data-toc="Highlight" class="h2-sub">ANTE: Demo</h2><p class="lead lead-left">Each step shows the belief state the policy writes before acting, the action, and what execution returns. When the policy abstains or predicts failure, ANTE-TTO ranks alternative actions by their own forecasts and executes the best one.</p><div class="taskstrip">' + taskCard("swe") + taskCard("term") + '</div><div id="replay" class="sub-part"><div class="panel-soft"><div id="foresight"></div></div><div class="sub-part"><h3>Before and After RL Training: What the World Model Learned</h3><div id="learned"></div></div></div></section>';
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
    var t = e.target.closest("[data-replay]");
    if (t) {
      var tab = document.querySelector('#foresight .fs-tabs button[data-key="' + t.dataset.replay + '"]');
      if (tab) tab.click();
      var play = document.querySelector("#foresight [data-act=play]");
      if (play && play.textContent === "Play") play.click();
      var r = document.getElementById("replay");
      if (r && r.scrollIntoView) r.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  renderHeroArt(document.getElementById("hero-art"));
  renderForesight(document.getElementById("foresight"));
  renderLearned(document.getElementById("learned"));
};
