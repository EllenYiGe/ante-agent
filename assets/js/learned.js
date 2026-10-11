window.renderLearned = function(el) {
  var A = window.ANTE, F5 = A.fig5, sc = { "7b": "#C9A227", "14b": "#B23A9A", "32b": "#0E8F99" };
  var PANELS = [["a_hit_rate", "Prediction Hit Rate"], ["b_trust_rate", "Trust Rate"], ["c_trusted_pred_acc", "Trust-Pred Acc."], ["d_abstain_justified", "Abstain-Justified"]];
  var scale = "32b", steps = [], idx = 0, timer = null, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function series(p) {
    return F5[p] && F5[p][scale] || [];
  }
  function allSteps() {
    var s = {};
    PANELS.forEach(function(P) {
      series(P[0]).forEach(function(d) {
        s[d[0]] = 1;
      });
    });
    return Object.keys(s).map(Number).sort(function(a, b) {
      return a - b;
    });
  }
  function last(p) {
    var e = A.fig5_end && A.fig5_end[p];
    return e && e[scale] != null ? e[scale] : null;
  }
  var c3 = A.cases_O[2], before = c3.blocks[0], after = c3.blocks[1];
  function beliefOf(b) {
    var it = b.items.filter(function(x) {
      return x.type === "belief";
    })[0];
    if (!it) return null;
    try {
      return JSON.parse(it.text.replace(/^<belief_state>/, "").replace(/<\/belief_state>$/, ""));
    } catch (e) {
      return null;
    }
  }
  function card(b, cls) {
    var j = beliefOf(b), obs = [].concat.apply([], b.items.filter(function(x) {
      return x.type === "obs";
    }).map(function(x) {
      return x.text.split("\n");
    }));
    var say = b.items.filter(function(x) {
      return x.type === "text";
    }).map(function(x) {
      return x.html;
    }).join(" ");
    return '<div class="lr-card ' + cls + '"><div class="lr-head">' + capFirst(b.title) + "</div>" + (say ? '<p class="lr-say">' + say + "</p>" : "") + (j ? '<div class="fs-col fs-belief"><div class="fs-lab">Belief state, written before the action</div><p class="fs-sum">' + esc(j.state_summary) + '</p><div class="fs-chips"><span class="fs-chip ' + (j.predicted_outcome.target_test === "PASS" ? "pass" : j.predicted_outcome.target_test === "FAIL" ? "fail" : "na") + '">target_test = ' + esc(j.predicted_outcome.target_test) + '</span><span class="fs-chip ' + (j.predicted_outcome.exit_ok ? "pass" : "fail") + '">exit_ok = ' + j.predicted_outcome.exit_ok + '</span><span class="fs-chip dec ' + esc(j.decision) + '">decision: ' + esc(j.decision) + "</span></div></div>" : "") + (obs.length ? '<div class="fs-col lr-exec"><div class="fs-lab">Execution</div>' + obs.map(function(o) {
      return '<code class="fs-out">' + esc(o) + "</code>";
    }).join("") + "</div>" : "") + "</div>";
  }
  el.className = "lr";
  el.innerHTML = '<div class="lr-bar"><div class="seg" id="lr-scale">' + ["7b", "14b", "32b"].map(function(s) {
    return '<button type="button" data-s="' + s + '" aria-pressed="' + (s === scale) + '">' + s.toUpperCase() + "</button>";
  }).join("") + '</div><div class="lr-ctl"><button type="button" class="lr-play">Pause</button><input type="range" id="lr-range" min="0" max="0" value="0" aria-label="RL training step"><output id="lr-step"></output></div></div><div class="grid2" id="lr-fig5" style="gap:12px;margin-top:14px"></div><p class="caption" style="margin:10px 0 0">' + caption2(siteEdit(A.fig_captions["fig:hit"].text)) + " " + src("Figure " + A.fig_captions["fig:hit"].number) + '</p><div class="sub-part"><h3>' + tcase(c3.title) + '</h3><p class="answer">' + siteEdit(c3.intro.join(" ")) + '</p><div class="lr-pair">' + card(before, "before") + card(after, "after") + "</div></div>";
  var range = el.querySelector("#lr-range"), out = el.querySelector("#lr-step"), playBtn = el.querySelector(".lr-play");
  function drawCurves() {
    var box = el.querySelector("#lr-fig5");
    if (!window.d3 || !box) return;
    box.innerHTML = "";
    var upto = steps[idx];
    PANELS.forEach(function(P) {
      var p = P[0], pts = series(p);
      if (!pts.length) return;
      var W = 520, H = 220, m = { t: 26, r: 36, b: 34, l: 40 };
      var div = document.createElement("div");
      box.appendChild(div);
      var svg = d3.select(div).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)");
      var all = pts.map(function(d) {
        return d[1];
      });
      var x = d3.scaleLinear().domain([0, d3.max(pts, function(d) {
        return d[0];
      })]).range([m.l, W - m.r]), y = d3.scaleLinear().domain([Math.floor(Math.min.apply(null, all) / 10) * 10 - 2, Math.ceil(Math.max.apply(null, all) / 10) * 10 + 2]).range([H - m.b, m.t]);
      svg.append("text").attr("x", m.l).attr("y", 14).style("font", "600 12.5px var(--body)").style("fill", "currentColor").text(P[1] + " (%)");
      svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(d3.axisBottom(x).ticks(5));
      svg.append("g").attr("transform", "translate(" + m.l + ",0)").call(d3.axisLeft(y).ticks(5));
      svg.selectAll(".domain,.tick line").style("stroke", "var(--line)");
      svg.selectAll(".tick text").style("font", "11px var(--body)").style("fill", "currentColor");
      svg.append("text").attr("x", W / 2).attr("y", H - 4).attr("text-anchor", "middle").style("font", "11px var(--body)").style("fill", "currentColor").text("Training steps");
      var shown = pts.filter(function(d) {
        return d[0] <= upto;
      }), rest = pts.filter(function(d) {
        return d[0] > upto;
      });
      svg.append("g").selectAll("circle").data(rest).enter().append("circle").attr("cx", function(d) {
        return x(d[0]);
      }).attr("cy", function(d) {
        return y(d[1]);
      }).attr("r", 1.4).attr("fill", "var(--line)");
      svg.append("g").selectAll("circle").data(shown).enter().append("circle").attr("cx", function(d) {
        return x(d[0]);
      }).attr("cy", function(d) {
        return y(d[1]);
      }).attr("r", 1.6).attr("fill", sc[scale]).attr("opacity", 0.5);
      var line = d3.line().defined(function(d) {
        return d[2] != null;
      }).x(function(d) {
        return x(d[0]);
      }).y(function(d) {
        return y(d[2]);
      });
      svg.append("path").datum(shown).attr("d", line).attr("fill", "none").attr("stroke", sc[scale]).attr("stroke-width", 2.4);
      var cur = shown.filter(function(d) {
        return d[2] != null;
      }).slice(-1)[0];
      if (cur) {
        svg.append("circle").attr("cx", x(cur[0])).attr("cy", y(cur[2])).attr("r", 5).attr("fill", sc[scale]);
        if (!rest.length) {
          var endv = last(p);
          if (endv != null) svg.append("text").attr("x", x(cur[0]) + 8).attr("y", y(cur[2]) + 4).style("font", "600 11.5px var(--mono)").style("fill", sc[scale]).text(endv.toFixed(0));
        }
      }
    });
  }
  function paint() {
    var step = steps[idx];
    out.textContent = "RL step " + step;
    range.value = idx;
    drawCurves();
    playBtn.textContent = timer ? "Pause" : "Play";
  }
  function reset() {
    steps = allSteps();
    range.max = Math.max(0, steps.length - 1);
    idx = 0;
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    paint();
  }
  function start() {
    stop();
    timer = setInterval(function() {
      idx++;
      if (idx >= steps.length) {
        idx = 0;
      }
      paint();
    }, 220);
    paint();
  }
  el.querySelector("#lr-scale").addEventListener("click", function(e) {
    var b = e.target.closest("button");
    if (!b) return;
    el.querySelectorAll("#lr-scale button").forEach(function(x) {
      x.setAttribute("aria-pressed", "false");
    });
    b.setAttribute("aria-pressed", "true");
    scale = b.dataset.s;
    reset();
    if (timer) start();
    else {
      idx = steps.length - 1;
      paint();
    }
  });
  range.addEventListener("input", function() {
    stop();
    idx = +range.value;
    paint();
  });
  playBtn.addEventListener("click", function() {
    if (timer) stop();
    else start();
  });
  reset();
  if (reduce || window.STATIC) {
    idx = steps.length - 1;
    paint();
  } else start();
  if ("IntersectionObserver" in window) {
    var wanted = true;
    new IntersectionObserver(function(en) {
      en.forEach(function(x) {
        if (x.isIntersecting) {
          if (wanted && !timer && !reduce) start();
        } else if (timer) {
          clearInterval(timer);
          timer = null;
        }
      });
    }, { threshold: 0.2 }).observe(el);
    playBtn.addEventListener("click", function() {
      wanted = !!timer;
    });
  }
};
