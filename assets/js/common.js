(function() {
  var A = window.ANTE;
  window.STATIC = /[?&]ante-static=1(?:&|$)/.test(location.search);
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  window.esc = esc;
  window.src = function(label) {
    return "";
  };
  try {
    localStorage.removeItem("ante-theme");
  } catch (e) {
  }
  window.renderNav = function() {
    var links = [["#demo", "Highlight"], ["#results", "Results"], ["#method", "Approach"], ["#cases", "Case Studies"], ["#cite", "Cite"]];
    var el = document.createElement("header");
    el.className = "nav";
    el.innerHTML = '<div class="wrap"><a class="brand" href="#top" aria-label="ANTE"><img src="img/icons/policy_agent_1.png" alt=""><span class="bt">ANTE</span></a><nav class="menu">' + links.map(function(l) {
      return '<a href="' + l[0] + '">' + l[1] + "</a>";
    }).join("") + "</nav></div>";
    document.body.prepend(el);
    var top = document.createElement("a");
    top.id = "top";
    document.body.prepend(top);
  };
  window.renderToc = function() {
    if (document.documentElement.getAttribute("data-variant") !== "b") return;
    var hs = Array.from(document.querySelectorAll("main section.part > h2, main section.part > .part-head > h2"));
    if (hs.length < 2) return;
    var COL = { "Highlight": ["#E08A3C", "var(--butter)"], "Results": ["#6B6FD6", "var(--lilac)"], "Approach": ["#3E9C7A", "var(--mint)"], "Case Studies": ["#D9707D", "var(--blush)"], "Cite": ["#6B7A99", "var(--mist)"] };
    var items = hs.map(function(h, i) {
      var sec = h.closest("section");
      if (!sec.id) sec.id = "s" + i;
      return [sec.id, (h.dataset.toc || h.textContent).replace(/\s*(§[\d.]+|App\. [A-Z][\d.]*)\s*$/, "").replace(/\s+[a-z_]+__[a-z_]+-\d+.*$/, "")];
    });
    if (document.getElementById("cite")) items.push(["cite", "Cite"]);
    hs.forEach(function(h) {
      var k = h.dataset.toc;
      if (!k || h.previousElementSibling && h.previousElementSibling.classList.contains("sec-chip")) return;
      var c = document.createElement("p");
      c.className = "sec-chip";
      c.style.setProperty("--dot", (COL[k] || ["#8A90A0"])[0]);
      c.innerHTML = "<i></i>" + esc(k);
      h.parentNode.insertBefore(c, h);
    });
    hs.forEach(function(h) {
      var k = h.dataset.toc;
      if (k) h.closest("section").style.setProperty("--sec", (COL[k] || ["#8A90A0"])[0]);
    });
    var toc = document.createElement("nav");
    toc.className = "toc";
    toc.setAttribute("aria-label", "On this page");
    toc.innerHTML = '<div class="toc-line" aria-hidden="true"><i class="toc-fill"></i></div>' + items.map(function(x) {
      var c = COL[x[1]] || ["#8A90A0", "var(--mist)"];
      return '<a href="#' + x[0] + '" data-label="' + esc(x[1]) + '" style="--dot:' + c[0] + '"><i class="toc-node"></i><span class="toc-lab">' + esc(x[1]) + "</span></a>";
    }).join("");
    document.body.appendChild(toc);
    var links = Array.from(toc.querySelectorAll("a")), secs = links.map(function(a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    }), line = toc.querySelector(".toc-line"), fill = toc.querySelector(".toc-fill"), menu = Array.from(document.querySelectorAll("nav.menu a"));
    function place() {
      var n0 = links[0].querySelector(".toc-node"), n1 = links[links.length - 1].querySelector(".toc-node");
      var y0 = links[0].offsetTop + n0.offsetTop + n0.offsetHeight / 2, y1 = links[links.length - 1].offsetTop + n1.offsetTop + n1.offsetHeight / 2;
      line.style.top = y0 + "px";
      line.style.height = Math.max(0, y1 - y0) + "px";
    }
    function mark() {
      var k = 0, mid = window.innerHeight * 0.35;
      secs.forEach(function(s, i) {
        if (s && s.getBoundingClientRect().top <= 160) k = i;
      });
      var atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atEnd) k = secs.length - 1;
      links.forEach(function(a, i) {
        a.classList.toggle("on", i === k);
        a.classList.toggle("past", i < k);
      });
      var cur = secs[k] && (atEnd || secs[k].getBoundingClientRect().top <= 160) ? "#" + secs[k].id : "";
      menu.forEach(function(a) {
        if (a.getAttribute("href") !== cur) return a.removeAttribute("aria-current");
        if (a.getAttribute("aria-current")) return;
        a.setAttribute("aria-current", "location");
        var m = a.parentNode, r = m.getBoundingClientRect(), q = a.getBoundingClientRect();
        if (q.right > r.right) m.scrollBy({ left: q.right - r.right + 12, behavior: "smooth" });
        else if (q.left < r.left) m.scrollBy({ left: q.left - r.left - 12, behavior: "smooth" });
      });
      var t0 = secs[0].getBoundingClientRect().top, tn = secs[secs.length - 1].getBoundingClientRect().top, f = atEnd ? 1 : (mid - t0) / Math.max(1, tn - t0);
      fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, f)).toFixed(4) + ")";
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", mark, { passive: true });
    mark();
  };
  window.keepTerms = function(root) {
    var RX = /\b(?:ANTE-(?:TTO|SFT|RL)|SWE-bench|Terminal-Bench|Reactive-RL|Retrospective-RL|TTS-\d+|Qwen3(?:\.5)?-\d+(?:\.\d+)?B|R2E-Gym|[Tt]est-time)\b/g, SKIP = "code,pre,svg,script,style,textarea,.katex,.nw";
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, { acceptNode: function(n) {
      RX.lastIndex = 0;
      return n.parentElement && !n.parentElement.closest(SKIP) && RX.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    } }), nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function(n) {
      var t = n.nodeValue, f = document.createDocumentFragment(), last = 0, m;
      RX.lastIndex = 0;
      while (m = RX.exec(t)) {
        if (m.index > last) f.appendChild(document.createTextNode(t.slice(last, m.index)));
        var sp = document.createElement("span");
        sp.className = "nw";
        sp.textContent = m[0];
        f.appendChild(sp);
        last = m.index + m[0].length;
      }
      if (last < t.length) f.appendChild(document.createTextNode(t.slice(last)));
      n.parentNode.replaceChild(f, n);
    });
  };
  window.renderFooter = function() {
    var f = document.createElement("footer");
    f.id = "cite";
    var names = A.authors.map(function(a) {
      return a.name;
    }), ref = names.slice(0, -1).join(", ") + ", and " + names[names.length - 1] + ". <i>" + esc(A.title) + '</i>. arXiv preprint <a href="' + A.arxiv.abs + '" target="_blank" rel="noopener">arXiv:' + A.arxiv.id + "</a>, 2026.";
    var bib = esc(A.bibtex).replace(/^(@\w+)\{([^,]+),/, '<span class="bt">$1</span>{<span class="bk">$2</span>,').replace(/^(\s+)(\w+)=/gm, '$1<span class="bf">$2</span>=');
    f.innerHTML = '<div class="wrap"><div class="cite-panel"><p class="sec-chip" style="--dot:#6B7A99"><i></i>Cite</p><p class="cite-lead">If you find ANTE useful in your research, please cite our paper:</p><p class="cite-ref">' + ref + '</p><div class="bibcard"><div class="bibbar"><span>BibTeX</span><button type="button" class="btn small" onclick="copyBib(this)">Copy</button></div><pre class="bib" id="bib">' + bib + '</pre></div><div class="cite-foot"><div><div>Contact: ' + A.emails.map(esc).join(" \xB7 ") + "</div><div>" + esc(A.affiliations["1"]) + " \xB7 " + esc(A.affiliations["2"]) + '</div></div><img class="aws" src="img/aws-logo.png" alt="AWS"></div></div></div>';
    document.body.appendChild(f);
    renderToc();
  };
  window.authorsHTML = function() {
    var cut = Math.floor(A.authors.length / 2) - 1, au = A.authors.map(function(a, i) {
      return '<span class="au">' + esc(a.name) + "<sup>" + a.marks.join(",") + "</sup></span>" + (i < A.authors.length - 1 ? ", " : "") + (i === cut ? '<br class="au-br">' : "");
    }).join("");
    var aff = Object.keys(A.affiliations).map(function(k) {
      return "<sup>" + k + "</sup>" + esc(A.affiliations[k]);
    }).join(" &nbsp;\xB7&nbsp; ");
    var notes = Object.keys(A.notes).map(function(k) {
      return "<sup>" + k + "</sup>" + esc(A.notes[k]);
    }).join(" &nbsp;\xB7&nbsp; ");
    return '<div class="authors">' + au + '</div><div class="affil">' + aff + "<br>" + notes + "</div>";
  };
  window.caption2 = function(html) {
    var m = String(html).match(/^(.*?[.!?])(\s+(?=[A-Z(\\]).*)$/s);
    if (!m || m[2].trim().length < 40) return html;
    return m[1] + ' <span class="cap-rest" hidden>' + m[2].trim() + '</span> <button type="button" class="cap-more" aria-expanded="false">more</button>';
  };
  document.addEventListener("click", function(e) {
    var b = e.target.closest(".cap-more");
    if (!b) return;
    var r = b.previousElementSibling;
    var open = b.getAttribute("aria-expanded") === "true";
    r.hidden = open;
    b.setAttribute("aria-expanded", open ? "false" : "true");
    b.textContent = open ? "more" : "less";
  });
  function closeZoom() {
    var z = document.querySelector(".lightbox");
    if (z) z.remove();
  }
  document.addEventListener("click", function(e) {
    if (e.target.closest(".lightbox")) {
      closeZoom();
      return;
    }
    var im = e.target.closest("figure.paperfig img");
    if (!im) return;
    var z = document.createElement("div");
    z.className = "lightbox";
    z.setAttribute("role", "dialog");
    z.setAttribute("aria-label", im.alt || "Figure");
    z.innerHTML = '<img alt=""><span class="lightbox-x" aria-hidden="true">\xD7</span>';
    z.querySelector("img").src = im.currentSrc || im.src;
    document.body.appendChild(z);
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeZoom();
  });
  var REF = /\s*\((?:(?:Sections?|Tables?|Figures?|Appendix|Appendices|Eqs?\.|Algorithms?|Propositions?|Corollar(?:y|ies)|Lemmas?)\s*[\dA-Z][\w.]*(?:\s*(?:,|and|;)\s*)?)+\)/g;
  var EDITS = [
    ["ANTE-TTO across the two harnesses.", "ANTE-TTO across the different harnesses."],
    ["What changes is exactly what Figure 5 tracks in aggregate: the forecast's hit rate against the executed check.", "After RL, the forecast matches the check, and the task is resolved in 26 steps."],
    ["The same task (<code>sphinx-doc__sphinx-8721</code>) is attempted by the fine-tuned start and by the model after RL.", "As shown in the case of <code>sphinx-doc__sphinx-8721</code>, before RL the forecast misses the executed check twice, and the task remains unresolved after 41 steps."],
    ["<b>The world model sharpens and the trust decision is learned.</b>", "<b>The world model's reasoning ability is reinforced and the trust decision is learned.</b>"],
    ["and the traces in Appendix N.5 show the foresight also works outside the harness.", "and the traces in Case Studies show the foresight also works outside the harness."],
    [" Since the run exits cleanly and the check fails as forecast, the step is a conclusive hit scored \\(+\\alpha\\).", ""],
    ["In this case, uploading a file", "Uploading a file"],
    [" (full trace in Appendix N)", ""],
    ["This section provides one episode for each failure mode", "We show one episode for each failure mode"],
    ["; Figure 14 traces the two interventions end to end.", "."],
    ["The gains of Table 3 come from", "These gains come from"],
    ["Protocol of Table 3.", "Protocol."],
    [" (Algorithm 3)", ""],
    [" (traces in Appendix O)", ""],
    [" from the Table 1 evaluation runs", " from the evaluation runs"],
    [", not about the success of the step", ""]
  ];
  window.siteEdit = function(t) {
    t = String(t);
    EDITS.forEach(function(e) {
      t = t.split(e[0]).join(e[1]);
    });
    return t.replace(REF, "");
  };
  window.figure = function(key, file, extraClass) {
    var c = A.fig_captions[key] || { number: "?", text: "" };
    c = { number: c.number, text: siteEdit(c.text) };
    return '<figure class="paperfig ' + (extraClass || "") + '"><img src="img/figures/' + file + '" alt="Figure ' + c.number + '"><figcaption>' + caption2(c.text) + " " + src("Figure " + c.number) + "</figcaption></figure>";
  };
  window.sentence = function(par, prefix) {
    var ss = String(par).split(/(?<=[.!?])\s+(?=[A-Z<\\(])/);
    var hit = ss.filter(function(x) {
      return x.replace(/<[^>]+>/g, "").indexOf(prefix) === 0;
    })[0] || "";
    return hit.replace(/^Furthermore, /, "").replace(/^Measured from call counts, /, function(m) {
      return "";
    }).replace(/^([a-z])/, function(m) {
      return m.toUpperCase();
    });
  };
  window.copyBib = function(btn) {
    var settled = false, label = btn.textContent;
    function say(t, ms) {
      btn.textContent = t;
      setTimeout(function() {
        btn.textContent = label;
      }, ms);
    }
    function done() {
      if (settled) return;
      settled = true;
      say("Copied", 1600);
    }
    function legacy() {
      if (settled) return;
      var ta = document.createElement("textarea");
      ta.value = A.bibtex;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
      }
      document.body.removeChild(ta);
      if (ok) {
        done();
        return;
      }
      settled = true;
      var bib = document.getElementById("bib");
      if (bib) {
        bib.scrollIntoView({ block: "center" });
        var r = document.createRange();
        r.selectNodeContents(bib);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      }
      say("Selected: press \u2318C or Ctrl+C", 2600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(A.bibtex).then(done, legacy);
      setTimeout(legacy, 500);
    } else legacy();
  };
  window.renderMath = function() {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(document.body, { delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }], macros: { "\\Vhat": "\\widehat{V}", "\\Qhat": "\\widehat{Q}", "\\Ahat": "\\widehat{A}", "\\ytst": "\\hat{y}^{\\mathrm{tst}}", "\\yexe": "\\hat{y}^{\\mathrm{exe}}", "\\rtst": "y^{\\mathrm{tst}}", "\\rexe": "y^{\\mathrm{exe}}", "\\lpred": "\\mathcal{L}_{\\mathrm{pred}}", "\\textsc": "{\\footnotesize\\text{#1}}", "\\bm": "\\boldsymbol{#1}" }, throwOnError: false });
      } catch (e) {
      }
    }
  };
  var SMALL = { a: 1, an: 1, the: 1, and: 1, but: 1, or: 1, nor: 1, for: 1, so: 1, yet: 1, as: 1, at: 1, by: 1, in: 1, of: 1, on: 1, to: 1, up: 1, off: 1, vs: 1, its: 1 };
  window.tcase = function(t) {
    var words = String(t).split(" "), n = words.length, afterColon = true;
    return words.map(function(w, i) {
      var bare = w.replace(/^[(\u201c"']+|[)\u201d"'?!.,:;]+$/g, "");
      var first = i === 0 || afterColon;
      afterColon = /[:.?!]$/.test(w);
      if (!bare || /[A-Z]/.test(bare) || /[_\d<>]/.test(bare)) return w;
      if (!first && i !== n - 1 && SMALL[bare.toLowerCase()]) return w;
      return w.replace(bare, bare.split("-").map(function(x) {
        return x.charAt(0).toUpperCase() + x.slice(1);
      }).join("-"));
    }).join(" ");
  };
  window.capFirst = function(t) {
    return String(t).replace(/(^|·\s*)([a-z])/g, function(m, a, b) {
      return a + b.toUpperCase();
    });
  };
  window.num = function(s) {
    var m = String(s).match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  };
  var autos = [], autoT = null;
  function onScrollFolds() {
    clearTimeout(autoT);
    autoT = setTimeout(function() {
      var H = window.innerHeight, opened = false;
      autos.forEach(function(f) {
        var t = f.sum.getBoundingClientRect().top, near = t > 0 && t < H * 0.45;
        if (f.d.open && near) opened = true;
        if (f.user) return;
        if (f.d.open && t > H * 0.6) f.d.open = false;
        else if (!f.d.open && !opened && near) opened = f.d.open = true;
      });
    }, 180);
  }
  window.autoFold = function(id, redraw) {
    var d = document.getElementById(id);
    if (!d) return;
    var f = { d, sum: d.querySelector("summary"), user: false };
    f.sum.addEventListener("click", function() {
      f.user = true;
    });
    if (redraw) d.addEventListener("toggle", function() {
      if (d.open) redraw();
    });
    if (!autos.length && !window.STATIC) window.addEventListener("scroll", onScrollFolds, { passive: true });
    autos.push(f);
    if (location.hash === "#" + id) {
      f.user = true;
      d.open = true;
    }
  };
  document.addEventListener("click", function(e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    autos.forEach(function(f) {
      if ("#" + f.d.id === a.getAttribute("href")) {
        f.user = true;
        f.d.open = true;
      }
    });
  }, true);
})();
