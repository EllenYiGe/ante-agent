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
    var links = [["#demo", "Demo"], ["#results", "Results"], ["#method", "Approach"], ["#cases", "Case Studies"], ["#bib", "Cite"]];
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
    var hs = Array.from(document.querySelectorAll("main section.part > h2"));
    if (hs.length < 2) return;
    var toc = document.createElement("nav");
    toc.className = "toc";
    toc.setAttribute("aria-label", "On this page");
    toc.innerHTML = '<div class="t">On this page</div>' + hs.map(function(h, i) {
      var sec = h.closest("section");
      if (!sec.id) sec.id = "s" + i;
      return '<a href="#' + sec.id + '">' + h.textContent.replace(/\s*(§[\d.]+|App\. [A-Z][\d.]*)\s*$/, "").replace(/\s+[a-z_]+__[a-z_]+-\d+.*$/, "") + "</a>";
    }).join("");
    document.body.appendChild(toc);
    var links = Array.from(toc.querySelectorAll("a")), secs = links.map(function(a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    });
    function mark() {
      var k = 0;
      secs.forEach(function(s, i) {
        if (s && s.getBoundingClientRect().top <= 140) k = i;
      });
      links.forEach(function(a, i) {
        a.classList.toggle("on", i === k);
      });
    }
    window.addEventListener("scroll", mark, { passive: true });
    mark();
  };
  window.renderFooter = function() {
    renderToc();
    var f = document.createElement("footer");
    f.innerHTML = '<div class="wrap"><div class="fr"><div style="flex:1;min-width:260px"><div>Contact: ' + A.emails.map(esc).join(" \xB7 ") + '</div><div style="margin-top:4px">' + esc(A.affiliations["1"]) + " \xB7 " + esc(A.affiliations["2"]) + '</div><div class="bibhead"><span>Citation</span><button type="button" class="btn small" onclick="copyBib(this)">Copy BibTeX</button></div><code class="bib" id="bib">' + esc(A.bibtex) + '</code></div><img class="aws" src="img/aws-logo.png" alt="AWS"></div></div>';
    document.body.appendChild(f);
  };
  window.authorsHTML = function() {
    var au = A.authors.map(function(a) {
      return '<span class="au">' + esc(a.name) + "<sup>" + a.marks.join(",") + "</sup></span>";
    }).join(", ");
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
    ["What changes is exactly what Figure 5 tracks in aggregate: the forecast's hit rate against the executed check.", "What changes is the forecast's hit rate against the executed check."],
    ["and the traces in Appendix O.5 show the foresight also works outside the harness.", "and the traces below show the foresight also works outside the harness."],
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
  var SMALL = { a: 1, an: 1, the: 1, and: 1, but: 1, or: 1, nor: 1, for: 1, so: 1, yet: 1, as: 1, at: 1, by: 1, in: 1, of: 1, on: 1, to: 1, up: 1, off: 1, vs: 1, its: 1, is: 1 };
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
})();
