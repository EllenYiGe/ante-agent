window.renderHome = function(main) {
  var A = window.ANTE;
  var sent = A.intro_we_introduce;
  function find(s) {
    return sent.filter(function(x) {
      return x.indexOf(s) >= 0;
    })[0] || "";
  }
  var bel = find("belief state"), bapo = find("Belief-Anchored Policy Optimization"), tto = find("ANTE-TTO");
  var absSent = A.abstract.split(/(?<=[.!?])\s+(?=[A-Z<])/), absPick = ["We present ANTE", "With an internal belief stated before each action", "To turn the trained forecasts into better actions", "ANTE raises Qwen3-32B"].map(function(k) {
    return absSent.filter(function(x) {
      return x.indexOf(k) === 0;
    })[0];
  });
  var abShort = absPick.every(Boolean) ? absPick.join(" ") : A.abstract;
  var tagline = (A.abstract.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(function(x) {
    return x.indexOf("In summary, we aim to build ") === 0;
  })[0] || "").replace(/^In summary, we aim to build (a )?/, function(m, g) {
    return g ? "A " : "";
  });
  var ttoSent = A.tto_par.split(/(?<=\.)\s+(?=[A-Z<\\])/), ttoLead = ttoSent.slice(0, 3).join(" ");
  var contribs = A.contributions.replace(/^Our main contributions are:\s*/, "").split(/(?=[❶❷❸❹])/).map(function(s) {
    return s.trim();
  }).filter(Boolean);
  var E = A.tto_episodes, I = "img/icons/";
  var absS = A.abstract.split(/(?<=[.!?])\s+(?=[A-Z])/);
  var anteSent = absS.filter(function(x) {
    return x.indexOf("We present ANTE") === 0;
  })[0] || "";
  function taskCard(k) {
    var e = E[k];
    return '<button type="button" class="taskcard" data-replay="' + k + '" title="Replay this run"><img src="' + I + e.icon + '.png" alt=""><span class="tc-body"><span class="tc-h">' + esc(e.task[0]) + "</span>" + (e.task[1] ? '<code class="tc-s">' + esc(e.task[1]) + "</code>" : "") + '<span class="tc-f">' + esc(e.title) + " \xB7 " + esc(e.steps_label.toLowerCase()) + " <b>Replay \u25B6</b></span></span></button>";
  }
  var host = document.createElement("div");
  host.innerHTML = '<div class="titleband"><div class="titlerow"><img class="biglogo" src="img/icons/policy_agent_1.png" alt=""><div><h1>' + esc(A.title.split(" \u2013 ")[0]) + "<small>" + esc(A.title.split(" \u2013 ")[1] || "") + "</small></h1>" + (tagline ? '<p class="tagline">' + tagline + "</p>" : "") + '</div></div><div class="meta big"><div>' + authorsHTML() + '</div><div class="btns"><button type="button" class="btn primary soon" data-soon="arXiv">arXiv <small>soon</small></button><button type="button" class="btn soon" data-soon="PDF">PDF <small>soon</small></button><button type="button" class="btn soon" data-soon="Code">Code <small>soon</small></button><button type="button" class="btn" onclick="copyBib(this)">Copy BibTeX</button></div><p class="soon-note" aria-live="polite" hidden>Link coming soon.</p></div></div><section id="demo" class="part"><h2>ANTE Demo</h2><div class="loop"><div class="loop-row"><div class="ln"><img src="' + I + 'repo_task_1.png" alt=""><b>Task</b><span>an issue, or a task.md</span></div><div class="la"><i>history h<sub>t</sub></i><span class="arw">\u2192</span></div><div class="ln agent"><img src="' + I + 'policy_agent_1.png" alt=""><b>Coding Agent</b><span>reasons, then one tool call a<sub>t</sub></span></div><div class="la"><span class="arw">\u2192</span><i>action a<sub>t</sub></i></div><div class="ln"><img src="' + I + 'environment_1.png" alt=""><b>Container</b><span>repository and tests; answers only in text</span></div><div class="la"><span class="arw">\u2192</span><i>at the end</i></div><div class="ln end"><img src="' + I + 'parser_2.png" alt=""><b>Terminal Outcome</b><span>R \u2208 {0, 1}, once per rollout</span></div></div><div class="loop-back"><span>observation o<sub>t+1</sub>: the textual output, back to the agent, for T steps</span></div></div><p class="sub" style="margin-top:12px">Solve a repository issue, or a terminal task.</p><div class="taskstrip">' + taskCard("swe") + taskCard("term") + '</div><div id="replay" class="sub-part"><p class="sub">' + anteSent + '</p><div id="foresight" style="margin-top:14px"></div><p class="caption" style="margin-top:14px">' + caption2("Across two harnesses, each step shows the belief state written before the action, the action itself, and the execution result. At a trigger step, where the policy abstains or predicts FAIL, ANTE-TTO ranks the drafted action and three alternatives by their own beliefs and executes the winner.") + '</p><div class="sub-part"><h3>Before and After Training: What the World Model Learned</h3><div id="learned"></div></div></div></section>';
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
  renderForesight(document.getElementById("foresight"));
  renderLearned(document.getElementById("learned"));
};
