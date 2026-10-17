var MARK = { pdf: '<path fill-rule="evenodd" d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V9h5.5L13 3.5zM8 12h8v1.6H8zm0 3.5h8v1.6H8z"/>', x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>', youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>', copy: '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>' };
function mark(k) {
  if (!k) return "";
  if (k === "huggingface") return '<span class="emo" aria-hidden="true">\u{1F917}</span>';
  return '<svg class="bi" viewBox="0 0 24 24" aria-hidden="true">' + MARK[k] + "</svg>";
}
function heroLinks() {
  var A = window.ANTE, L = A.links || {};
  function out(k, href, label, cls, title) {
    return '<a class="btn' + (cls ? " " + cls : "") + '" href="' + href + '" target="_blank" rel="noopener"' + (title ? ' title="' + title + '" aria-label="' + title + '"' : "") + ">" + mark(k) + '<span class="lbl">' + label + "</span></a>";
  }
  return out("", A.arxiv.abs, "arXiv", "primary") + out("pdf", A.arxiv.pdf, "PDF") + out("huggingface", L.huggingface, "Hugging Face", "", "The paper page on Hugging Face") + out("x", L.x, "Post", "", "The launch post on X") + out("youtube", L.youtube, "YouTube", "", "The video on YouTube") + '<button type="button" class="btn" onclick="copyBib(this)">' + mark("copy") + '<span class="lbl">Copy BibTeX</span></button>';
}
window.renderHome = function(main) {
  var A = window.ANTE, I = "img/icons/", cut = A.title.indexOf(" \u2013 "), t1 = A.title.slice(0, cut), t2 = A.title.slice(cut + 3);
  var ideas = [
    ["lilac", "Internal Belief", "It writes down what it expects.", "#belief"],
    ["mint", "BAPO", "Every verified forecast earns credit.", "#bapo"],
    ["peach", "ANTE-TTO", "Foresight guides test-time optimization.", "#tto"]
  ];
  var host = document.createElement("div");
  host.innerHTML = '<div class="hero"><h1 class="hero-title"><span class="t1"><img class="tlogo" src="' + I + 'policy_agent_1.png" alt=""><span class="ante">' + esc(t1.slice(0, 4)) + "</span>" + esc(t1.slice(4)) + '</span><span class="tdash"> \u2013 </span><span class="t2">' + esc(t2) + '</span></h1><div class="meta big"><div>' + authorsHTML() + '</div><div class="btns">' + heroLinks() + `</div></div><div class="hero-duo"><div class="hero-intro"><p class="hero-slogan">Coding agents, now with <span class="hl">foresight</span>.</p><p class="hero-sub"><b class="an">ANTE</b>, an agentic RL framework that verifies the policy's <span class="nw">pre-action</span> predictions.</p></div><div class="hero-art" id="hero-art"></div></div></div><div class="statband"><div id="statband"></div></div><div class="ideas"><h2>What makes it work</h2><div class="idea-grid">` + ideas.map(function(x) {
    return '<a class="idea ' + x[0] + '" href="' + x[3] + '"><span class="idea-l"><span class="idea-k">' + x[1] + '</span><span class="idea-t">' + x[2] + '</span></span><span class="idea-r"><span class="idea-more">See how \u2193</span></span></a>';
  }).join("") + '</div></div><section id="demo" class="part"><h2 data-toc="Highlight" class="h2-sub">ANTE: Demo</h2><p class="lead lead-left">Each step shows the belief state the policy writes before acting, the action, and what execution returns. When the policy abstains or predicts failure, ANTE-TTO ranks alternative actions by their own forecasts and executes the best one.</p><div id="replay" class="sub-part"><div class="panel-soft"><div id="foresight"></div></div></div><div class="sub-part"><h3>Before and After RL Training: What the World Model Learned</h3><div id="learned"></div></div></section>';
  main.appendChild(host);
  renderHeroArt(document.getElementById("hero-art"));
  renderForesight(document.getElementById("foresight"));
  renderLearned(document.getElementById("learned"));
};
