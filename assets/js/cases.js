window.renderCaseStudies = function(main) {
  var el = document.createElement("section");
  el.id = "cases";
  el.className = "part";
  main.appendChild(el);
  var A = window.ANTE, O = A.cases_O, FM = A.failure_modes;
  var colorCls = { paloalto: "", trajamber: "amber", trajred: "red", trajgray: "amber" };
  function beliefCard(text) {
    var m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        var j = JSON.parse(m[0]);
        var po = j.predicted_outcome || {};
        var tt = po.target_test, ex = po.exit_ok;
        return '<div class="fs-col fs-belief compact"><div class="fs-lab">Belief state</div><p class="fs-sum">' + esc(j.state_summary || "") + '</p><div class="fs-chips">' + (tt !== void 0 ? '<span class="fs-chip ' + (tt === "PASS" ? "pass" : tt === "FAIL" ? "fail" : "na") + '">target_test = ' + esc(String(tt)) + "</span>" : "") + (ex !== void 0 ? '<span class="fs-chip ' + (ex ? "pass" : "fail") + '">exit_ok = ' + ex + "</span>" : "") + (j.decision ? '<span class="fs-chip dec ' + esc(j.decision) + '">decision: ' + esc(j.decision) + "</span>" : "") + Object.keys(j).filter(function(k) {
          return ["state_summary", "predicted_outcome", "decision"].indexOf(k) < 0;
        }).map(function(k) {
          return '<span class="fs-chip na">' + esc(k) + " = " + esc(typeof j[k] === "object" ? JSON.stringify(j[k]) : String(j[k])) + "</span>";
        }).join("") + "</div></div>";
      } catch (e) {
      }
    }
    return '<div class="belief">' + esc(text) + "</div>";
  }
  function item(it) {
    if (it.type === "belief") return beliefCard(it.text);
    if (it.type === "memory") return '<div class="memory">' + esc(it.text) + "</div>";
    if (it.type === "obs") return '<div class="obs">' + esc(it.text) + "</div>";
    if (it.type === "call") {
      var v = it.text.split("\\(\\Rightarrow\\)");
      return '<div class="call">' + esc(v[0].replace(/&lt;/g, "<").replace(/&gt;/g, ">")) + (v.length > 1 ? "\\(\\Rightarrow\\) " + v.slice(1).join("").trim() : "") + "</div>";
    }
    if (it.type === "none") return '<div class="obs">' + esc(it.text || "no output") + "</div>";
    return '<p class="note">' + it.html + "</p>";
  }
  function block(b, idx) {
    return '<div class="stepcard ' + (colorCls[b.color] || "") + ' casestep" data-i="' + idx + '"><h4>' + capFirst(b.title) + "</h4>" + b.items.map(item).join("") + "</div>";
  }
  function excerpts(c) {
    return '<div class="prose">' + c.intro.map(function(p) {
      return "<p>" + caption2(siteEdit(p)) + "</p>";
    }).join("") + "</div>" + (c.blocks.length > 1 ? '<div class="playbar"><button type="button" data-act="prev">\u25C0 Previous</button><button type="button" data-act="next">Next Step \u25B6</button><button type="button" data-act="all">Show All</button><span class="caption" style="margin:0" data-role="pos"></span></div><div class="steps">' + c.blocks.map(block).join("") + "</div>" : c.blocks.length ? '<div class="steps">' + c.blocks.map(block).join("") + "</div>" : "");
  }
  var order = [0, 1, 3, 4];
  var tabs = order.map(function(oi, k) {
    return '<button type="button" data-p="o' + oi + '" aria-pressed="' + (k === 0) + '"><span>' + (k + 1) + "</span>" + tcase(O[oi].title) + "</button>";
  }).join("") + '<button type="button" data-p="fm" aria-pressed="false"><span>' + (order.length + 1) + "</span>" + tcase(FM.heading) + "</button>";
  var panels = order.map(function(oi, k) {
    var c = O[oi];
    return '<div class="casepanel" data-panel="o' + oi + '"' + (k ? " hidden" : "") + '><div class="casehead"><h4>' + tcase(c.title) + "</h4>" + (c.task ? "<span>" + c.task + "</span>" : "") + "</div>" + (oi === 1 ? '<div class="lanes-host"></div>' : excerpts(c)) + "</div>";
  }).join("") + '<div class="casepanel" data-panel="fm" hidden><div class="casehead"><h4>' + tcase(FM.heading) + '</h4></div><div class="fs-tabs fm-modes">' + FM.modes.map(function(m, j) {
    return '<button type="button" data-mode="' + j + '" aria-pressed="' + (j === 0) + '">' + tcase(m.para_title) + "</button>";
  }).join("") + "</div>" + FM.modes.map(function(m, j) {
    return '<div class="fm-host" data-j="' + j + '"' + (j ? " hidden" : "") + "></div>";
  }).join("") + '<p class="caption">' + caption2(siteEdit(FM.intro)) + "</p></div>";
  el.innerHTML = '<h2 data-toc="Case Studies">How foresight affects the outcome</h2><div class="casetabs">' + tabs + "</div>" + panels;
  var bar = el.querySelector(".casetabs");
  bar.addEventListener("click", function(e) {
    var b = e.target.closest("button");
    if (!b) return;
    bar.querySelectorAll("button").forEach(function(x) {
      x.setAttribute("aria-pressed", "false");
    });
    b.setAttribute("aria-pressed", "true");
    if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: Math.max(0, b.offsetLeft - bar.offsetLeft - 16), behavior: "smooth" });
    el.querySelectorAll(".casepanel").forEach(function(p) {
      p.hidden = p.dataset.panel !== b.dataset.p;
    });
  });
  el.querySelectorAll(".casepanel").forEach(function(sec) {
    var cards = Array.from(sec.querySelectorAll(".casestep")), bar2 = sec.querySelector(".playbar");
    if (cards.length < 2 || !bar2) return;
    var shown = 1;
    function paint() {
      cards.forEach(function(c, i) {
        c.classList.toggle("hidden-step", i >= shown);
      });
      bar2.querySelector("[data-act=prev]").disabled = shown <= 1;
      bar2.querySelector("[data-act=next]").disabled = bar2.querySelector("[data-act=all]").disabled = shown >= cards.length;
      var pos = sec.querySelector("[data-role=pos]");
      if (pos) pos.textContent = Math.min(shown, cards.length) + " of " + cards.length + " excerpts shown";
    }
    bar2.addEventListener("click", function(e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "next") shown = Math.min(cards.length, shown + 1);
      else if (b.dataset.act === "prev") shown = Math.max(1, shown - 1);
      else shown = cards.length;
      paint();
    });
    paint();
  });
  renderLanes(el.querySelector(".lanes-host"));
  el.querySelectorAll(".fm-host").forEach(function(h) {
    renderFailure(h, FM.modes[+h.dataset.j]);
  });
  var modes = el.querySelector(".fm-modes");
  modes.addEventListener("click", function(e) {
    var b = e.target.closest("button");
    if (!b) return;
    modes.querySelectorAll("button").forEach(function(x) {
      x.setAttribute("aria-pressed", "false");
    });
    b.setAttribute("aria-pressed", "true");
    el.querySelectorAll(".fm-host").forEach(function(h) {
      h.hidden = h.dataset.j !== b.dataset.mode;
    });
  });
};
