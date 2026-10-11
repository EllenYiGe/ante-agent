(function() {
  var A = window.ANTE;
  var C = { vfg: "#3A4E9E", qfg: "#B8651F", afg: "#6A519E", dfg: "#2E7D6E", pos: "#2F7A3E", neg: "#C4404A", neu: "#5C6773", fbd: "#C9B26A", fbg: "#FDF6E0", pbd: "#8FAE83", pbg: "#E9F2E4", grey: "#C3C7CC", ink: "#232F3E", muted: "#6B7580", line: "#D9DDE2" };
  var steps = A.worked_example.map(function(s) {
    return { id: s.step, i: s.rollout, t: s.position, g: s.forecast, d: s.decision, ok: s.right, r: s.reward, W: s["return"] };
  });
  var vals = {};
  A.worked_values.forEach(function(r) {
    vals[r.quantity + "|" + r.key] = parseFloat(r.value);
  });
  var Aep = { 1: vals["A_episode_advantage|1"], 2: vals["A_episode_advantage|2"], 3: vals["A_episode_advantage|3"] };
  function mean(v) {
    return v.reduce(function(a, b) {
      return a + b;
    }, 0) / v.length;
  }
  var V = {}, Q = {};
  ["F", "P"].forEach(function(g) {
    V[g] = mean(steps.filter(function(s) {
      return s.g === g;
    }).map(function(s) {
      return s.W;
    }));
    ["tr", "ab"].forEach(function(d) {
      Q[g + d] = mean(steps.filter(function(s) {
        return s.g === g && s.d === d;
      }).map(function(s) {
        return s.W;
      }));
    });
  });
  steps.forEach(function(s) {
    s.Ay = s.W - V[s.g];
    s.Ayd = s.W - Q[s.g + s.d];
    s.D = (s.Ay + s.Ayd) / 2;
    s.Ai = Aep[s.i];
  });
  var rollouts = [1, 2, 3].map(function(i) {
    var ss = steps.filter(function(s) {
      return s.i === i;
    });
    return { i, T: Math.max.apply(null, ss.map(function(s) {
      return s.t;
    })), steps: ss, resolved: Aep[i] > 0 };
  });
  var alpha = 0.05, gamma = 0.0625, kappa = 0.02;
  (function() {
    var tr = steps.filter(function(s) {
      return s.d === "tr" && s.ok;
    })[0], wr = steps.filter(function(s) {
      return s.d === "tr" && s.ok === false;
    })[0], ab = steps.filter(function(s) {
      return s.d === "ab";
    })[0];
    if (tr) alpha = tr.r;
    if (wr) gamma = -wr.r;
    if (ab) kappa = -ab.r;
  })();
  function rnd(x, d) {
    var m = Math.pow(10, d);
    return Math.round(Math.abs(x) * m + 1e-9) / m;
  }
  function sign(x) {
    return x > 0 ? "+" : x < 0 ? "\u2212" : "";
  }
  function f4(x) {
    var t = rnd(x, 4).toFixed(4).replace(/0+$/, "");
    if (t.split(".")[1].length < 2) t = rnd(x, 4).toFixed(2);
    return sign(x) + t;
  }
  function f3(x) {
    return sign(x) + rnd(x, 3).toFixed(3);
  }
  function sub(s) {
    return '<tspan baseline-shift="sub" font-size="72%">' + s + "</tspan>";
  }
  function sup(s) {
    return '<tspan baseline-shift="super" font-size="72%">' + s + "</tspan>";
  }
  function letter(s) {
    return ["a", "b", "c", "d"][rollouts[s.i - 1].steps.indexOf(s)];
  }
  function stepName(s) {
    return "\u03C4" + sub(s.i) + " t" + sub(letter(s));
  }
  function rcol(s) {
    return s.d === "ab" ? C.neu : s.ok ? C.pos : C.neg;
  }
  function rsym(s) {
    return s.d === "ab" ? "\u2212\u03BA" : s.ok ? "+\u03B1" : "\u2212\u03B3";
  }
  function chip(s) {
    return s.g + "\xB7" + s.d + (s.d === "tr" ? s.ok ? " \u2713" : " \u2717" : "");
  }
  function text(x, y, t, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 11) + '"' + (o.w ? ' font-weight="' + o.w + '"' : "") + (o.a ? ' text-anchor="' + o.a + '"' : "") + ' fill="' + (o.c || C.ink) + '"' + (o.i ? ' font-style="italic"' : "") + (o.op ? ' opacity="' + o.op + '"' : "") + ">" + t + "</text>";
  }
  var LW = 620, LH = 372, X0 = 118, SW = 96, BW = 78, BH = 44, ROWY = [62, 186, 310], KD = 240;
  function left(sel) {
    var o = '<svg viewBox="0 0 ' + LW + " " + LH + '" class="bapo-svg" role="img" aria-label="Three rollouts of one task with their decision rewards, returns and step credit">';
    rollouts.forEach(function(R2, k) {
      var y2 = ROWY[k];
      o += text(10, y2 - 8, "\u03C4" + sub(R2.i), { s: 15, w: 700 }) + text(10, y2 + 8, R2.resolved ? "resolved, R" + sub(R2.i) + " = 1" : "not resolved, R" + sub(R2.i) + " = 0", { s: 10.5, c: C.muted }) + text(10, y2 + 24, "A" + sub(R2.i) + " = " + f3(Aep[R2.i]), { s: 11.5, w: 600, c: C.afg });
      o += '<line x1="' + (X0 - 10) + '" y1="' + y2 + '" x2="' + (X0 + (R2.T - 1) * SW + BW + 10) + '" y2="' + y2 + '" stroke="' + C.line + '" stroke-width="1.5"/>';
      for (var t = 1; t <= R2.T; t++) {
        var x = X0 + (t - 1) * SW, s = R2.steps.filter(function(q) {
          return q.t === t;
        })[0], cx = x + BW / 2;
        if (!s) {
          o += '<rect x="' + x + '" y="' + (y2 - BH / 2) + '" width="' + BW + '" height="' + BH + '" rx="7" fill="' + C.grey + '" opacity=".5"/>' + text(cx, y2 + 4, "pragmatic", { s: 10, a: "middle", op: 0.75 }) + '<g class="act a4">' + text(cx, y2 + BH / 2 + 48, "\u0394 = 0", { s: 10.5, a: "middle", c: C.muted }) + "</g>";
          continue;
        }
        var isSel = sel && sel.id === s.id;
        o += '<g class="bapo-step" data-id="' + s.id + '" style="cursor:pointer"><rect x="' + x + '" y="' + (y2 - BH / 2) + '" width="' + BW + '" height="' + BH + '" rx="7" fill="' + (s.g === "F" ? C.fbg : C.pbg) + '" stroke="' + (isSel ? C.ink : s.g === "F" ? C.fbd : C.pbd) + '" stroke-width="' + (isSel ? 2.5 : 1.4) + '"/>';
        o += text(cx, y2 - 4, chip(s), { s: 13, w: 700, a: "middle" }) + text(cx, y2 + 12, stepName(s), { s: 10, a: "middle", c: C.muted });
        o += '<g class="act a1">' + text(cx, y2 + BH / 2 + 15, rsym(s) + " = " + f4(s.r), { s: 11, w: 600, a: "middle", c: rcol(s) }) + "</g>";
        var h = s.D * KD, by = y2 + BH / 2 + 44, top = h >= 0 ? by - h : by;
        o += '<g class="act a4"><line x1="' + (x + 6) + '" y1="' + by + '" x2="' + (x + BW - 6) + '" y2="' + by + '" stroke="' + C.line + '"/><rect x="' + (cx - 9) + '" y="' + top + '" width="18" height="' + Math.abs(h) + '" fill="' + C.dfg + '" opacity=".9"/>' + text(cx + 13, h >= 0 ? top + 4 : top + Math.abs(h) + 4, "\u0394 " + f3(s.D), { s: 10, w: 600, c: C.dfg }) + "</g></g>";
      }
    });
    if (sel) {
      var R = rollouts[sel.i - 1], y = ROWY[sel.i - 1], xa = X0 + (sel.t - 1) * SW, xb = X0 + (R.T - 1) * SW + BW, yb = y - BH / 2 - 12, terms = R.steps.filter(function(q) {
        return q.t >= sel.t;
      }).map(function(q) {
        return f4(q.r);
      }).join(" ").replace(/ \+/g, " + ").replace(/ −/g, " \u2212 ");
      o += '<g class="act a2"><path d="M' + xa + " " + (yb + 5) + " V" + yb + " H" + xb + " V" + (yb + 5) + '" fill="none" stroke="' + C.ink + '" stroke-width="1.4"/>' + text((xa + xb) / 2, yb - 6, "W = " + terms + " = " + f4(sel.W), { s: 11, w: 600, a: "middle" }) + "</g>";
    }
    o += '<g class="act a4"><rect x="10" y="' + (LH - 18) + '" width="11" height="11" fill="' + C.dfg + '"/>' + text(26, LH - 9, "\u0394" + sub("i,t") + " bars to scale; A" + sub("i") + " is shared by every step of its rollout", { s: 10.5, c: C.muted }) + "</g>";
    return o + "</svg>";
  }
  var RW = 560, RH = 372, AX0 = 100, AX1 = RW - 18, WMIN = -0.115, WMAX = 0.045;
  function xw(w) {
    return AX0 + (w - WMIN) / (WMAX - WMIN) * (AX1 - AX0);
  }
  function diamond(x, y, r, c) {
    return '<path d="M' + x + " " + (y - r) + " L" + (x + r) + " " + y + " L" + x + " " + (y + r) + " L" + (x - r) + " " + y + ' Z" fill="' + c + '"/>';
  }
  function bracket(x1, x2, y, c, label, anchorRight) {
    var o = '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + c + '" stroke-width="2"/><line x1="' + x2 + '" y1="' + (y - 5) + '" x2="' + x2 + '" y2="' + (y + 5) + '" stroke="' + c + '" stroke-width="2"/><line x1="' + x1 + '" y1="' + (y - 5) + '" x2="' + x1 + '" y2="' + (y + 5) + '" stroke="' + c + '" stroke-width="2"/>';
    return o + text(anchorRight ? x2 + 22 : x2 - 22, y + 4, label, { s: 10.5, w: 700, c, a: anchorRight ? "start" : "end" });
  }
  function right(sel) {
    var o = '<svg viewBox="0 0 ' + RW + " " + RH + '" class="bapo-svg" role="img" aria-label="Belief groups F and P with their belief values, belief-decision values and the advantages of the selected step">';
    ["F", "P"].forEach(function(g, gi) {
      var py = 8 + gi * 184, ph = 172, vx = xw(V[g]);
      o += '<g class="act a3"><rect x="4" y="' + py + '" width="' + (RW - 8) + '" height="' + ph + '" rx="10" fill="' + (g === "F" ? C.fbg : C.pbg) + '" opacity=".7"/>';
      o += text(16, py + 20, "G(" + g + ")", { s: 13, w: 700 }) + text(62, py + 20, "forecast " + (g === "F" ? "FAIL" : "PASS"), { s: 12, c: C.muted }) + text(RW - 16, py + 20, "V\u0302(" + g + ") = " + f4(V[g]), { s: 12, w: 700, a: "end", c: C.vfg });
      ["tr", "ab"].forEach(function(d, di) {
        var sy2 = py + 32 + di * 58, sh = 50, q = Q[g + d], cy = sy2 + sh / 2;
        o += '<rect x="' + (AX0 - 6) + '" y="' + sy2 + '" width="' + (AX1 - AX0 + 12) + '" height="' + sh + '" rx="8" fill="#fff" stroke="' + C.line + '"/>' + text(16, cy - 3, "G(" + g + "," + d + ")", { s: 11.5, w: 700 }) + text(16, cy + 11, "Q\u0302 = " + f4(q), { s: 10, w: 600, c: C.qfg });
        o += '<line x1="' + AX0 + '" y1="' + cy + '" x2="' + AX1 + '" y2="' + cy + '" stroke="' + C.line + '"/>' + diamond(xw(q), cy, 7, C.qfg);
        var ss = steps.filter(function(s) {
          return s.g === g && s.d === d;
        }).sort(function(a, b) {
          return a.W - b.W;
        }), lastx = -99, row = 0;
        ss.forEach(function(s) {
          var x2 = xw(s.W);
          row = Math.abs(x2 - lastx) < 36 ? 1 - row : 0;
          lastx = x2;
          var my = cy + (row ? 10 : -10), isSel = sel && sel.id === s.id;
          o += '<g class="bapo-step" data-id="' + s.id + '" style="cursor:pointer"><rect x="' + (x2 - 17) + '" y="' + (my - 8) + '" width="34" height="16" rx="4" fill="' + (g === "F" ? C.fbg : C.pbg) + '" stroke="' + (isSel ? C.ink : g === "F" ? C.fbd : C.pbd) + '" stroke-width="' + (isSel ? 2.2 : 1.2) + '"/>' + text(x2, my + 4, stepName(s), { s: 9.5, w: 600, a: "middle" }) + "</g>";
        });
      });
      o += '<line x1="' + vx + '" y1="' + (py + 28) + '" x2="' + vx + '" y2="' + (py + ph - 14) + '" stroke="' + C.vfg + '" stroke-width="1.4" stroke-dasharray="4 3"/>' + diamond(vx, py + ph - 14, 7, C.vfg);
      [-0.1, -0.05, 0].forEach(function(t) {
        var x2 = xw(t);
        o += '<line x1="' + x2 + '" y1="' + (py + ph - 16) + '" x2="' + x2 + '" y2="' + (py + ph - 10) + '" stroke="' + C.muted + '"/>' + text(x2, py + ph - 1, t === 0 ? "0" : t.toFixed(2), { s: 9.5, a: "middle", c: C.muted });
      });
      o += text(AX1, py + ph - 1, "W", { s: 10, a: "end", c: C.muted, i: true }) + "</g>";
      if (sel && sel.g === g) {
        var sy = py + 32 + (sel.d === "tr" ? 0 : 1) * 58, x = xw(sel.W), qx = xw(Q[g + sel.d]);
        o += '<g class="act a4">' + bracket(vx, x, sy + 9, C.vfg, "A" + sup("\u1EF9") + " = " + f3(sel.Ay), x >= vx) + bracket(qx, x, sy + 41, C.qfg, "A" + sup("\u1EF9,d") + " = " + f3(sel.Ayd), x >= qx) + "</g>";
      }
    });
    return o + "</svg>";
  }
  function card(s) {
    var nG = steps.filter(function(q) {
      return q.g === s.g;
    }).length, nGd = steps.filter(function(q) {
      return q.g === s.g && q.d === s.d;
    }).length;
    var rows = [
      [1, "decision reward r<sub>" + s.i + "," + letter(s) + "</sub>", rsym(s) + " = " + f4(s.r), s.d === "ab" ? "abstained" : s.ok ? "rightly trusted" : "wrongly trusted"],
      [2, "decision return W<sub>" + s.i + "," + letter(s) + "</sub> = \u03A3<sub>s \u2265 t</sub> r<sub>" + s.i + ",s</sub>", f4(s.W), "the rewards from this step to the end of \u03C4<sub>" + s.i + "</sub>"],
      [3, "belief value V\u0302(" + s.g + ")", f4(V[s.g]), "mean W over the " + nG + " steps that forecast " + (s.g === "F" ? "FAIL" : "PASS")],
      [3, "belief-decision value Q\u0302(" + s.g + ", " + s.d + ")", f4(Q[s.g + s.d]), "mean W over the " + nGd + " of them that " + (s.d === "tr" ? "trusted" : "abstained")],
      [4, "belief-relative A<sup>\u1EF9</sup> = W \u2212 V\u0302", f3(s.Ay), ""],
      [4, "decision-relative A<sup>\u1EF9,d</sup> = W \u2212 Q\u0302", f3(s.Ayd), ""],
      [4, "step credit \u0394 = \u03C9(A<sup>\u1EF9</sup> + A<sup>\u1EF9,d</sup>), \u03C9 = \xBD", "<b>" + f3(s.D) + "</b>", "added to the episode advantage A<sub>" + s.i + "</sub> = " + f3(s.Ai) + " that every step of \u03C4<sub>" + s.i + "</sub> shares"]
    ];
    return '<div class="bapo-cardhead">Selected step \u03C4<sub>' + s.i + "</sub> t<sub>" + letter(s) + "</sub>: forecast " + (s.g === "F" ? "FAIL" : "PASS") + ", " + (s.d === "tr" ? "trusted" : "abstained") + (s.ok === true ? ", correct" : s.ok === false ? ", missed" : "") + '</div><table class="bapo-table">' + rows.map(function(r) {
      return '<tr class="act a' + r[0] + '"><td>' + r[1] + '</td><td class="n">' + r[2] + '</td><td class="w">' + r[3] + "</td></tr>";
    }).join("") + "</table>";
  }
  var ACTS = [["Decision Rewards", "every conclusive step is scored by its own forecast and decision: +\u03B1 rightly trusted, \u2212\u03B3 wrongly trusted, \u2212\u03BA abstained"], ["Decision Returns", "a step inherits the rewards from itself to the end of its rollout, W = \u03A3 r"], ["Belief Groups", "steps that forecast the same outcome form a belief group; V\u0302 is the group mean of W, Q\u0302 the mean within one decision"], ["Step Credit", "the gaps to V\u0302 and to Q\u0302 are the two advantages; their mean \u03C9(A<sup>\u1EF9</sup> + A<sup>\u1EF9,d</sup>) is the step credit \u0394, added to the shared episode advantage"]];
  window.renderBapo = function(el) {
    var sel = steps[0], act = 4, timer = null, wanted = true, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.className = "bapo";
    el.innerHTML = '<div class="bapo-bar"><div class="bapo-acts">' + ACTS.map(function(a, i) {
      return '<button type="button" data-act="' + (i + 1) + '"><span>' + (i + 1) + "</span>" + a[0] + "</button>";
    }).join("") + '</div><button type="button" class="bapo-play">Pause</button></div><p class="bapo-note" id="bapo-note"></p><div class="bapo-panes"><div class="bapo-pane" id="bapo-left"></div><div class="bapo-pane" id="bapo-right"></div></div><div class="bapo-foot"><div class="bapo-card" id="bapo-card"></div><div class="bapo-legend"><div><i style="background:' + C.fbg + ";border-color:" + C.fbd + '"></i>forecast FAIL (F)</div><div><i style="background:' + C.pbg + ";border-color:" + C.pbd + '"></i>forecast PASS (P)</div><div><i style="background:' + C.grey + ";border-color:" + C.grey + '"></i>pragmatic step, \u0394 = 0</div><div><b style="color:' + C.pos + '">+\u03B1 = ' + f4(alpha) + '</b> rightly trusted (tr)</div><div><b style="color:' + C.neg + '">\u2212\u03B3 = ' + f4(-gamma) + '</b> wrongly trusted</div><div><b style="color:' + C.neu + '">\u2212\u03BA = ' + f4(-kappa) + '</b> abstained (ab)</div><div><i style="background:' + C.vfg + ";border-color:" + C.vfg + ';transform:rotate(45deg);border-radius:0"></i>V\u0302(\u1EF9) belief value</div><div><i style="background:' + C.qfg + ";border-color:" + C.qfg + ';transform:rotate(45deg);border-radius:0"></i>Q\u0302(\u1EF9,d) belief-decision value</div><div><i style="background:' + C.dfg + ";border-color:" + C.dfg + '"></i>\u0394<sub>i,t</sub> step credit</div><div class="bapo-small">Values before the within-task standardization.</div></div></div>';
    var playBtn = el.querySelector(".bapo-play");
    function paint() {
      el.setAttribute("data-act", act);
      el.querySelectorAll(".bapo-acts button").forEach(function(b) {
        b.setAttribute("aria-pressed", +b.dataset.act === act ? "true" : "false");
      });
      document.getElementById("bapo-note").innerHTML = "<b>" + act + " \xB7 " + ACTS[act - 1][0] + ":</b> " + ACTS[act - 1][1] + '. <span class="bapo-hint">Click any conclusive step to follow its numbers; the replay pauses while you look.</span>';
      document.getElementById("bapo-left").innerHTML = left(sel);
      document.getElementById("bapo-right").innerHTML = right(sel);
      document.getElementById("bapo-card").innerHTML = card(sel);
      playBtn.textContent = timer ? "Pause" : "Play";
    }
    function tick() {
      if (act < 4) act++;
      else {
        sel = steps[(steps.indexOf(sel) + 1) % steps.length];
        act = 1;
      }
      paint();
    }
    function start() {
      if (timer) clearInterval(timer);
      timer = setInterval(tick, 1300);
      paint();
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      paint();
    }
    el.addEventListener("click", function(e) {
      var st = e.target.closest(".bapo-step");
      if (st) {
        wanted = false;
        stop();
        sel = steps.filter(function(s) {
          return s.id === st.dataset.id;
        })[0];
        paint();
        return;
      }
      var b = e.target.closest(".bapo-acts button");
      if (b) {
        wanted = false;
        stop();
        act = +b.dataset.act;
        paint();
        return;
      }
      if (e.target.closest(".bapo-play")) {
        if (timer) {
          wanted = false;
          stop();
        } else {
          wanted = true;
          if (act >= 4) {
            act = 1;
          }
          start();
        }
      }
    });
    if (reduce || window.STATIC) {
      act = 4;
      wanted = false;
      paint();
      return;
    }
    act = 1;
    start();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function(en) {
        en.forEach(function(x) {
          if (x.isIntersecting) {
            if (wanted && !timer) start();
          } else if (timer) {
            clearInterval(timer);
            timer = null;
          }
        });
      }, { threshold: 0.2 }).observe(el);
    }
  };
})();
