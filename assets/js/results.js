window.renderResults = function(main) {
  var A = window.ANTE;
  function plain(c) {
    return String(c).replace(/<[^>]+>/g, "").trim();
  }
  function val(c) {
    var t = plain(c);
    if (t.indexOf("/") >= 0) t = t.split("/")[1];
    var m = t.match(/-?\d+(?:\.\d+)?/);
    return m ? +m[0] : NaN;
  }
  function se(c) {
    var m = plain(c).match(/±\s*([\d.]+)/);
    return m ? +m[1] : null;
  }
  function fmtCell(c) {
    return String(c).replace(/ ↑([\d.]+)/g, ' <span class="up">\u2191$1</span>').replace(/ ±([\d.]+)/g, ' <span class="se">\xB1$1</span>');
  }
  function table(t, opts) {
    opts = opts || {};
    var rows = t.rows, head = rows[0], body = rows.slice(1);
    var th = "<tr>" + head.map(function(h, i) {
      return '<th class="' + (i >= (opts.numFrom || 2) ? "n " : "") + '" data-col="' + i + '">' + h + "</th>";
    }).join("") + "</tr>";
    var tb = body.map(function(r) {
      if (r.length === 1) return '<tr class="group"><td colspan="' + head.length + '">' + r[0] + "</td></tr>";
      var hl = plain(r[1] || "") === "ANTE" || plain(r[0] || "") === "ANTE" || /^ANTE-\d+B$/.test(plain(r[0] || ""));
      return "<tr" + (hl ? ' class="hl"' : "") + ">" + r.map(function(c, i) {
        return '<td class="' + (i >= (opts.numFrom || 2) ? "n" : "") + '">' + fmtCell(c) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    return '<div class="tablewrap"><table class="paper">' + th + tb + "</table></div>" + (t.note ? '<p class="tablenote">' + t.note + "</p>" : "");
  }
  function cap(t) {
    return '<p class="caption">' + caption2(t.caption) + " " + src("Table " + t.number) + "</p>";
  }
  function qa(id, question, answer, chip) {
    return '<div id="r-' + id + '" class="qa sub-part"><h3>' + question + "</h3>" + (answer ? '<p class="answer">' + siteEdit(answer) + "</p>" : "");
  }
  var ACC = "var(--ante)", GREY = ["#C9C3B6", "#B9B2A4", "#8FA7B4", "#7FB89A"];
  var T1 = A.tables.main.rows, T2 = A.tables.term.rows, T3 = A.tables.ood.rows;
  var TC = ["ANTE-TTO", "TTS-4", "TTS-8"], TCOL = { "ANTE-TTO": ACC, "TTS-4": "#8FA7B4", "TTS-8": "#B9B2A4" }, TSET = [];
  A.fig4.forEach(function(r) {
    if (TSET.indexOf(r.setting) < 0) TSET.push(r.setting);
  });
  function f4(st, mm) {
    return A.fig4.filter(function(x) {
      return x.setting === st && x.method === mm;
    })[0];
  }
  function mtcOf(r) {
    return (+r.B_tok - 1) * +r.T_base_tokens / +r.delta_S_points;
  }
  function nmtcOf(r) {
    return (+r.B_tok - 1) / +r.delta_S_points;
  }
  function enot(v) {
    var e = Math.floor(Math.log10(v));
    return (v / Math.pow(10, e)).toFixed(1) + "e" + e;
  }
  function sci(d) {
    if (!d) return "0";
    var e = Math.floor(Math.log10(d)), m = d / Math.pow(10, e);
    return (Math.abs(m - Math.round(m)) < 1e-9 ? String(Math.round(m)) : m.toFixed(1)) + "e" + e;
  }
  var MTCMAX = 1.12 * Math.max.apply(null, A.fig4.map(mtcOf));
  function mean(a) {
    return a.reduce(function(s, v) {
      return s + v;
    }, 0) / a.length;
  }
  function tcLook(nm) {
    return { fill: TCOL[nm] };
  }
  function mtcRatio(m) {
    return Math.round(mean(TSET.map(function(st) {
      return mtcOf(f4(st, m)) / mtcOf(f4(st, "ANTE-TTO"));
    })));
  }
  function row(rows, name, col) {
    col = col === void 0 ? 1 : col;
    return rows.filter(function(x) {
      return plain(x[col]) === name;
    })[0];
  }
  function lastRow(rows, name, col) {
    col = col === void 0 ? 1 : col;
    return rows.filter(function(x) {
      return plain(x[col]) === name;
    }).slice(-1)[0];
  }
  var ante1 = lastRow(T1, "ANTE"), d1 = row(T1, "\u0394 Reactive baseline"), ante2 = row(T2, "ANTE", 0), d2 = row(T2, "\u0394 Reactive baseline", 0), mean3 = T3.filter(function(r) {
    return /Mean of/.test(plain(r[1] || ""));
  })[0];
  var f7 = A.fig4.filter(function(r) {
    return r.setting === "SWE-7B";
  }), tto7 = f7.filter(function(r) {
    return r.method === "ANTE-TTO";
  })[0], tts7 = f7.filter(function(r) {
    return r.method === "TTS-4";
  })[0];
  var tiles = '<div class="cards four"><div class="card"><div class="num">' + val(ante1[4]).toFixed(1) + "<small>%</small></div><p>pass@1 on SWE-bench Verified at 32B, " + plain(d1[4]) + ' over Reactive-RL</p><div class="foot">' + src("Table 1") + '</div></div><div class="card"><div class="num">' + val(ante2[3]).toFixed(1) + "<small>%</small></div><p>resolved on Terminal-Bench 2.0 at 9B, " + plain(d2[3]) + ' over Reactive-RL</p><div class="foot">' + src("Table 2") + '</div></div><div class="card"><div class="num">' + plain(mean3[4]).replace("\u2191", "+") + '<small>pts</small></div><p>mean gain over Reactive-RL on 11 out-of-distribution benchmarks at 32B</p><div class="foot">' + src("Table 3") + '</div></div><div class="card"><div class="num">' + (+tto7.B_tok).toFixed(2) + "<small>\xD7</small></div><p>inference tokens of ANTE-TTO at 7B relative to one greedy attempt, against " + (+tts7.B_tok).toFixed(2) + '\xD7 for TTS-4</p><div class="foot">' + src("Figure 4") + "</div></div></div>";
  var wobapo = sentence(A.setup_data, "We additionally evaluate ANTE (w/o BAPO)");
  var host = document.createElement("div");
  host.innerHTML = '<section id="results" class="part"><h2>Results ' + src("\xA73") + "</h2>" + tiles + qa("belief", "Does the Internal Belief Help?", "", "\xA73.2") + '<div class="chartbox duo"><div class="legend duo-legend" id="t12legend"></div><div class="duo-grid"><div class="duo-pane"><div class="duo-head"><b>SWE-bench Verified</b></div><div id="t1chart"></div></div><div class="duo-pane"><div class="duo-head"><b>Terminal Bench</b></div><div id="t2chart"></div></div></div><p class="caption duo-cap">Whiskers show the s.e. over 3 evaluation runs of one checkpoint, for the rows run three times; the table below lists every number.</p></div><details class="paperfigs"><summary>Table: Main Results on SWE-bench Verified and Terminal Bench</summary>' + table(A.tables.main, { numFrom: 2 }) + table(A.tables.term, { numFrom: 1 }) + '</details><details class="paperfigs"><summary>Table: Performance Comparison on SWE-bench Verified and Terminal-Bench 2.0</summary>' + table(A.tables.sota, { numFrom: 4 }) + cap(A.tables.sota) + table(A.tables.termmarket, { numFrom: 4 }) + cap(A.tables.termmarket) + "</details></div>" + qa("bapo", "Does BAPO Help?", "", "\xA73.2") + '<div class="chartbox"><div class="chart-head"><div class="caption" style="margin:0">What BAPO adds on top of the belief state</div><div class="legend"><span><i style="background:#7FB89A"></i>ANTE (w/o BAPO)</span><span><i style="background:' + ACC + '"></i>ANTE</span></div></div><div id="bapochart"></div></div>' + (wobapo ? '<p class="caption">' + caption2(siteEdit(wobapo)) + "</p>" : "") + "</div>" + qa("ood", "Does the Foresight Transfer Across Harnesses and Domains?", sentence(A.ood_par, "ANTE leads on all eleven"), "\xA73.3") + '<div class="chartbox"><div class="chart-head"><div class="seg" id="t3seg"><button type="button" data-s="paper" aria-pressed="true">By Domain</button><button type="button" data-s="gain">By Gain</button></div><div class="legend"><span><i style="background:#B9B2A4"></i>Reactive-RL</span><span><i style="background:' + ACC + '"></i>ANTE-32B</span></div></div><div id="t3chart"></div></div></div>' + qa("tto", "What Does Test-Time Foresight Cost?", "On average, ANTE-TTO's marginal token cost is 1/" + mtcRatio("TTS-4") + " of TTS-4's and 1/" + mtcRatio("TTS-8") + " of TTS-8's: it resamples only at trigger steps, scores the candidates by the beliefs the policy emits, and executes the best candidate.", "\xA73.4") + '<div class="chartbox tc"><div class="legend duo-legend" id="tc-legend"></div><div class="duo-grid"><div class="duo-pane"><div class="duo-head"><b>Inference Tokens per Task</b></div><div id="mtc"></div><div id="tc-btok"></div></div><div class="duo-pane"><div class="duo-head"><b>Marginal Token Cost</b></div><div id="tc-mtc"></div><div id="tc-nmtc"></div></div></div><p class="caption duo-cap"><b>ANTE-TTO cost analysis.</b> TTS-\\(n\\): best-of-\\(n\\) sampling; \\(B_{\\mathrm{tok}}\\): inference tokens per task relative to one greedy attempt; \\(\\mathrm{MTC} = (B_{\\mathrm{tok}}{-}1)\\,T_{\\mathrm{base}}/\\Delta S\\): inference tokens spent per point of score gain, with \\(T_{\\mathrm{base}}\\) the tokens of one greedy run (dashed line) and \\(\\Delta S\\) the score gain; \\(\\mathrm{nMTC} = (B_{\\mathrm{tok}}{-}1)/\\Delta S\\): greedy attempts spent per point of score gain.</p></div></div></section>';
  function axisStyle(svg) {
    svg.selectAll(".domain,.tick line").style("stroke", "var(--line)");
    svg.selectAll(".tick text").style("font", "11px var(--body)").style("fill", "currentColor");
  }
  function seg(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function(e) {
      var b = e.target.closest("button");
      if (!b) return;
      el.querySelectorAll("button").forEach(function(x) {
        x.setAttribute("aria-pressed", "false");
      });
      b.setAttribute("aria-pressed", "true");
      fn(b.dataset.s);
    });
  }
  function narrow() {
    return (document.getElementById("main") || document.body).clientWidth < 600;
  }
  function phoneW(el) {
    return Math.max(280, Math.round(el.clientWidth || (document.getElementById("main") || document.body).clientWidth - 32));
  }
  function rich(t, s) {
    var re = /(_)\{([^}]*)\}/g, last = 0, shift = 0, mm;
    s = String(s);
    function put(txt, dy, small) {
      if (!txt) return;
      var sp = t.append("tspan").text(txt);
      if (dy) sp.attr("dy", dy);
      if (small) sp.style("font-size", ".78em");
    }
    while (mm = re.exec(s)) {
      put(s.slice(last, mm.index), shift ? -shift + "px" : null);
      put(mm[2], "3px", true);
      shift = 3;
      last = re.lastIndex;
    }
    put(s.slice(last), shift ? -shift + "px" : null);
    return t;
  }
  function hbars(el, groups, o) {
    el.innerHTML = "";
    var W = phoneW(el), L = o.labelW || 124, R = 78, RH = 22, GH = 26, H = 8 + groups.reduce(function(s, g) {
      return s + GH + g.rows.length * RH;
    }, 0);
    var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)"), x = d3.scaleLinear().domain([0, o.max]).range([L, W - R]), y = 4;
    groups.forEach(function(g) {
      rich(svg.append("text").attr("x", 0).attr("y", y + 17).style("font", "600 13px var(--body)").style("fill", "currentColor"), g.name);
      y += GH;
      if (g.ref != null) svg.append("line").attr("x1", x(g.ref)).attr("x2", x(g.ref)).attr("y1", y + 2).attr("y2", y + g.rows.length * RH - 2).attr("stroke", EDGE).attr("stroke-width", 1.2).attr("stroke-dasharray", "4 3");
      g.rows.forEach(function(r) {
        var cy = y + RH / 2, end = x(r.value);
        svg.append("text").attr("x", L - 8).attr("y", cy + 4).attr("text-anchor", "end").style("font", "12px var(--body)").style("fill", "currentColor").text(r.label);
        svg.append("rect").attr("x", L).attr("y", cy - 6).attr("width", Math.max(1, x(r.value) - L)).attr("height", 12).attr("rx", 2).attr("fill", r.color).append("title").text(r.title);
        if (r.se != null) {
          svg.append("line").attr("x1", x(r.value - r.se)).attr("x2", x(r.value + r.se)).attr("y1", cy).attr("y2", cy).attr("stroke", "currentColor").attr("stroke-width", 1.2);
          end = Math.max(end, x(r.value + r.se));
        }
        if (r.cap) {
          svg.append("rect").attr("x", x(r.value)).attr("y", cy - 6).attr("width", Math.max(1, x(r.cap.value) - x(r.value))).attr("height", 12).attr("fill", "none").attr("stroke", r.color).attr("stroke-dasharray", "3 2").append("title").text(r.cap.title);
          end = Math.max(end, x(r.cap.value));
        }
        var tx = svg.append("text").attr("x", end + 5).attr("y", cy + 4).style("font", "600 11.5px var(--mono)").style("fill", "currentColor").style("paint-order", "stroke").style("stroke", "var(--bg)").style("stroke-width", "5px").style("stroke-linejoin", "round").text(r.text);
        if (r.cap && r.cap.text) tx.append("tspan").attr("dx", 4).style("fill", "var(--accent)").text(r.cap.text);
        y += RH;
      });
    });
  }
  function hdumb(el, rows, o) {
    el.innerHTML = "";
    var W = phoneW(el), RH = 42, HH = 24, H = 8 + rows.reduce(function(s, r) {
      return s + (r.head ? HH : 0) + RH;
    }, 0) + 26;
    var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)"), x = d3.scaleLinear().domain(o.domain).range([10, W - 10]), y = 4;
    rows.forEach(function(r) {
      if (r.head) {
        svg.append("text").attr("x", 0).attr("y", y + 16).style("font", "600 12px var(--body)").style("fill", "var(--muted)").text(r.head);
        y += HH;
      }
      svg.append("text").attr("x", 0).attr("y", y + 14).style("font", (r.mean ? "italic 600 " : "") + "12.5px var(--body)").style("fill", "currentColor").text(r.label);
      svg.append("text").attr("x", W).attr("y", y + 14).attr("text-anchor", "end").style("font", "600 12px var(--mono)").style("fill", "var(--accent)").text(r.delta);
      var cy = y + 30;
      svg.append("line").attr("x1", x(r.a)).attr("x2", x(r.b)).attr("y1", cy).attr("y2", cy).attr("stroke", "var(--line)").attr("stroke-width", 3);
      svg.append("circle").attr("cx", x(r.a)).attr("cy", cy).attr("r", 5.5).attr("fill", o.ca).append("title").text(r.ta);
      svg.append("circle").attr("cx", x(r.b)).attr("cy", cy).attr("r", 5.5).attr("fill", o.cb).append("title").text(r.tb);
      y += RH;
    });
    svg.append("g").attr("transform", "translate(0," + (y + 2) + ")").call(d3.axisBottom(x).ticks(5));
    axisStyle(svg);
  }
  var FAM = [[/^Reactive/, "#B9B2A4"], [/^Retrospective/, "#8FA7B4"], [/w\/o BAPO/, "#7FB89A"], [/^ANTE$/, ACC]], EDGE = "#9C958A";
  function look(name) {
    for (var i = 0; i < FAM.length; i++) if (FAM[i][0].test(name)) return { fill: FAM[i][1] };
    return { fill: EDGE };
  }
  function swatch(name) {
    return '<span><i style="background:' + look(name).fill + '"></i>' + esc(name) + "</span>";
  }
  function num(c) {
    var t = plain(c);
    if (t.indexOf("/") >= 0) t = t.split("/")[1];
    var m = t.match(/-?\d+(?:\.\d+)?/);
    return m ? m[0] : "";
  }
  function t1data() {
    var grp = null, methods = [], rowsBy = {};
    T1.slice(1).forEach(function(r) {
      if (r.length < 5) return;
      if (plain(r[0]) === "SFT") grp = "SFT";
      else if (plain(r[0]) === "RL") grp = "RL";
      var name = plain(r[1]);
      if (/^Δ/.test(name)) return;
      if (grp === "RL") {
        methods.push(name);
        rowsBy[name] = r;
      }
    });
    var tto = methods.filter(function(m) {
      return /ANTE-TTO/.test(m);
    })[0];
    return { methods: methods.filter(function(m) {
      return !/ANTE-TTO/.test(m);
    }), rowsBy, tto };
  }
  var T2rows = T2.slice(1).filter(function(r) {
    var n = plain(r[0]);
    return !/^Δ/.test(n) && !/\(base\)$/.test(n);
  }), T2methods = T2rows.map(function(r) {
    return plain(r[0]);
  }), BENCH = T2[0].slice(1).map(plain);
  function vbars(el, o) {
    el.innerHTML = "";
    var W = Math.max(300, Math.round(el.clientWidth || 460)), H = o.h || 290, m = { t: 36, r: 4, b: 30, l: 32 }, lk = o.look || look;
    var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)");
    var x0 = d3.scaleBand().domain(o.groups).range([m.l, W - m.r]).paddingInner(0.24).paddingOuter(0.06), x1 = d3.scaleBand().domain(o.series).range([0, x0.bandwidth()]).padding(0.12);
    var y = d3.scaleLinear().domain([0, o.max]).range([H - m.b, m.t]), y0 = y(0);
    rich(svg.append("text").attr("x", 0).attr("y", 13).style("font", "500 12px var(--body)").style("fill", "var(--muted)"), o.unit);
    var ya = d3.axisLeft(y).ticks(5);
    if (o.tickFmt) ya.tickFormat(o.tickFmt);
    svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(d3.axisBottom(x0).tickSize(0).tickPadding(9));
    svg.append("g").attr("transform", "translate(" + m.l + ",0)").call(ya);
    axisStyle(svg);
    svg.selectAll(".tick text").style("font-size", "12px");
    if (o.ref) o.groups.forEach(function(g, gi) {
      var rv = o.ref(gi);
      svg.append("line").attr("x1", x0(g) - 4).attr("x2", x0(g) + x0.bandwidth() + 4).attr("y1", y(rv)).attr("y2", y(rv)).attr("stroke", EDGE).attr("stroke-width", 1.2).attr("stroke-dasharray", "4 3").append("title").text("One greedy run at " + g + ": " + rv + " tokens");
    });
    o.groups.forEach(function(g, gi) {
      o.series.forEach(function(nm) {
        var d = o.cell(nm, gi), s = lk(nm), x = x0(g) + x1(nm), w = x1.bandwidth(), top = d.v;
        svg.append("rect").attr("x", x).attr("y", y(d.v)).attr("width", w).attr("height", y0 - y(d.v)).attr("fill", s.fill).append("title").text(d.title);
        if (d.s != null) {
          svg.append("line").attr("x1", x + w / 2).attr("x2", x + w / 2).attr("y1", y(d.v - d.s)).attr("y2", y(d.v + d.s)).attr("stroke", "currentColor").attr("stroke-width", 1.2);
          top = d.v + d.s;
        }
        if (d.cap) {
          svg.append("rect").attr("x", x).attr("y", y(d.cap.v)).attr("width", w).attr("height", Math.max(0, y(d.v) - y(d.cap.v))).attr("fill", "none").attr("stroke", ACC).attr("stroke-dasharray", "3 2").append("title").text(d.cap.title);
          top = Math.max(top, d.cap.v);
        }
        if (!o.all && nm !== "ANTE") return;
        var ly = y(top) - 6;
        svg.append("text").attr("x", x + w / 2).attr("y", ly).attr("text-anchor", "middle").style("font", o.all ? "600 11px var(--body)" : "600 12px var(--mono)").style("fill", "currentColor").style("paint-order", "stroke").style("stroke", "var(--bg)").style("stroke-width", "5px").style("stroke-linejoin", "round").text(d.text);
        if (d.cap && d.cap.text) svg.append("text").attr("x", x + w / 2).attr("y", ly - 14).attr("text-anchor", "middle").style("font", "600 11px var(--mono)").style("fill", "var(--accent)").text(d.cap.text);
      });
    });
  }
  function drawT1() {
    var el = document.getElementById("t1chart");
    if (!window.d3 || !el) return;
    var D = t1data(), scales = ["7B", "14B", "32B"];
    document.getElementById("t12legend").innerHTML = T2methods.concat(D.methods.filter(function(m) {
      return T2methods.indexOf(m) < 0;
    })).map(swatch).join("") + (D.tto ? '<span><i style="border:1.5px dashed ' + ACC + ';background:none"></i>' + esc(D.tto.replace(/^\+\s*/, "")) + " (dashed cap, \u2191 over ANTE)</span>" : "");
    function cell(mm, si) {
      var c = D.rowsBy[mm][2 + si], d = { v: val(c), s: se(c), text: num(c), title: mm + " at " + scales[si] + ": " + plain(c) };
      if (D.tto && mm === "ANTE") {
        var tc = D.rowsBy[D.tto][2 + si], g = (plain(tc).match(/↑([\d.]+)/) || [])[1];
        d.cap = { v: val(tc), text: g ? "\u2191" + g : "", title: "+ ANTE-TTO at " + scales[si] + ": " + plain(tc) };
      }
      return d;
    }
    if (narrow()) {
      hbars(el, scales.map(function(sc2, si) {
        return { name: sc2, rows: D.methods.map(function(mm) {
          var d = cell(mm, si), s = look(mm);
          return { label: mm, value: d.v, color: s.fill, se: d.s, text: d.text, title: d.title, cap: d.cap && { value: d.cap.v, text: d.cap.text, title: d.cap.title } };
        }) };
      }), { max: 65 });
      return;
    }
    vbars(el, { groups: scales, series: D.methods, max: 65, unit: "pass@1 (%)", cell });
  }
  function drawT2() {
    var el = document.getElementById("t2chart");
    if (!window.d3 || !el) return;
    function cell(mm, bi) {
      var c = T2rows[T2methods.indexOf(mm)][1 + bi];
      return { v: val(c), s: se(c), text: num(c), title: mm + " on " + BENCH[bi] + ": " + plain(c) };
    }
    if (narrow()) {
      hbars(el, BENCH.map(function(bn, bi) {
        return { name: bn, rows: T2methods.map(function(mm) {
          var d = cell(mm, bi), s = look(mm);
          return { label: mm, value: d.v, color: s.fill, se: d.s, text: d.text, title: d.title };
        }) };
      }), { max: 50, labelW: 132 });
      return;
    }
    vbars(el, { groups: BENCH, series: T2methods, max: 50, unit: "resolved (%); all variants build on Qwen3.5-9B", cell });
  }
  main.appendChild(host);
  drawT1();
  drawT2();
  function drawBapoGain() {
    var el = document.getElementById("bapochart");
    if (!window.d3 || !el) return;
    el.innerHTML = "";
    var items = [], grp = null, wo = null, an = null;
    T1.slice(1).forEach(function(r) {
      if (r.length < 5) return;
      if (plain(r[0]) === "RL") grp = "RL";
      if (grp !== "RL") return;
      if (plain(r[1]) === "ANTE (w/o BAPO)") wo = r;
      if (plain(r[1]) === "ANTE") an = r;
    });
    if (wo && an) ["7B", "14B", "32B"].forEach(function(sc2, i) {
      items.push({ label: "SWE-bench Verified " + sc2, a: val(wo[2 + i]), b: val(an[2 + i]), ra: plain(wo[2 + i]), rb: plain(an[2 + i]) });
    });
    var wo2 = row(T2, "ANTE (w/o BAPO)", 0), an2 = row(T2, "ANTE", 0);
    if (wo2 && an2) T2[0].slice(1).forEach(function(bn, i) {
      items.push({ label: plain(bn), a: val(wo2[1 + i]), b: val(an2[1 + i]), ra: plain(wo2[1 + i]), rb: plain(an2[1 + i]) });
    });
    if (narrow()) {
      hdumb(el, items.map(function(it) {
        return { label: it.label, a: it.a, b: it.b, delta: "+" + (it.b - it.a).toFixed(1), ta: "ANTE (w/o BAPO): " + it.ra, tb: "ANTE: " + it.rb };
      }), { domain: [15, 65], ca: "#7FB89A", cb: ACC });
      return;
    }
    var RH = 30, W = 760, m = { t: 8, r: 70, b: 28, l: 190 }, H = m.t + items.length * RH + m.b;
    var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)");
    var x = d3.scaleLinear().domain([15, 65]).range([m.l, W - m.r]);
    svg.append("g").attr("transform", "translate(0," + (m.t + items.length * RH) + ")").call(d3.axisBottom(x).ticks(6));
    axisStyle(svg);
    items.forEach(function(it, i) {
      var yy = m.t + i * RH + RH / 2;
      if (i === 3) svg.append("line").attr("x1", m.l - 100).attr("x2", W - m.r + 60).attr("y1", yy - RH / 2).attr("y2", yy - RH / 2).attr("stroke", "var(--line)");
      svg.append("text").attr("x", m.l - 12).attr("y", yy + 4).attr("text-anchor", "end").style("font", "12px var(--body)").style("fill", "currentColor").text(it.label);
      svg.append("line").attr("x1", x(it.a)).attr("x2", x(it.b)).attr("y1", yy).attr("y2", yy).attr("stroke", "var(--line)").attr("stroke-width", 3);
      svg.append("circle").attr("cx", x(it.a)).attr("cy", yy).attr("r", 5.5).attr("fill", "#7FB89A").append("title").text("ANTE (w/o BAPO): " + it.ra);
      svg.append("circle").attr("cx", x(it.b)).attr("cy", yy).attr("r", 5.5).attr("fill", ACC).append("title").text("ANTE: " + it.rb);
      svg.append("text").attr("x", W - m.r + 10).attr("y", yy + 4).style("font", "600 11.5px var(--mono)").style("fill", "var(--accent)").text("+" + (it.b - it.a).toFixed(1));
    });
  }
  drawBapoGain();
  function drawT3(order) {
    var el = document.getElementById("t3chart");
    if (!window.d3 || !el) return;
    el.innerHTML = "";
    var rows = T3.slice(1).map(function(r) {
      return { dom: plain(r[0]), bench: plain(r[1]), re: val(r[2]), an: val(r[3]), d: val(r[4]), raw: r, mean: /Mean of/.test(plain(r[1])) };
    });
    var body = rows.filter(function(r) {
      return !r.mean;
    }), mean2 = rows.filter(function(r) {
      return r.mean;
    })[0];
    if (order === "gain") body.sort(function(a, b) {
      return b.d - a.d;
    });
    var list = body.concat(mean2 ? [mean2] : []);
    if (narrow()) {
      var prev = null;
      hdumb(el, list.map(function(r) {
        var h = order !== "gain" && r.dom && r.dom !== prev ? r.dom : null;
        if (h) prev = r.dom;
        return { head: h, label: r.bench, a: r.re, b: r.an, delta: plain(r.raw[4]), mean: r.mean, ta: "Reactive-RL: " + plain(r.raw[2]), tb: "ANTE-32B: " + plain(r.raw[3]) };
      }), { domain: [30, 100], ca: "#B9B2A4", cb: ACC });
      return;
    }
    var RH = 26, W = 760, m = { t: 10, r: 70, b: 28, l: 250 }, H = m.t + list.length * RH + m.b;
    var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)");
    var x = d3.scaleLinear().domain([30, 100]).range([m.l, W - m.r]);
    svg.append("g").attr("transform", "translate(0," + (m.t + list.length * RH) + ")").call(d3.axisBottom(x).ticks(7));
    axisStyle(svg);
    var prev = null;
    list.forEach(function(r, i) {
      var yy = m.t + i * RH + RH / 2;
      if (order !== "gain" && r.dom && r.dom !== prev) {
        svg.append("text").attr("x", 8).attr("y", yy + 4).style("font", "600 11px var(--body)").style("fill", "var(--muted)").text(r.dom);
        prev = r.dom;
      }
      if (r.mean) svg.append("line").attr("x1", m.l - 120).attr("x2", W - m.r + 60).attr("y1", yy - RH / 2).attr("y2", yy - RH / 2).attr("stroke", "var(--line)");
      svg.append("text").attr("x", m.l - 12).attr("y", yy + 4).attr("text-anchor", "end").style("font", (r.mean ? "italic 600 " : "") + "12px var(--body)").style("fill", "currentColor").text(r.bench);
      svg.append("line").attr("x1", x(r.re)).attr("x2", x(r.an)).attr("y1", yy).attr("y2", yy).attr("stroke", "var(--line)").attr("stroke-width", 3);
      svg.append("circle").attr("cx", x(r.re)).attr("cy", yy).attr("r", 5.5).attr("fill", "#B9B2A4").append("title").text("Reactive-RL: " + plain(r.raw[2]));
      svg.append("circle").attr("cx", x(r.an)).attr("cy", yy).attr("r", 5.5).attr("fill", ACC).append("title").text("ANTE-32B: " + plain(r.raw[3]));
      svg.append("text").attr("x", W - m.r + 10).attr("y", yy + 4).style("font", "600 11.5px var(--mono)").style("fill", "var(--accent)").text(plain(r.raw[4]));
    });
  }
  var t3order = "paper";
  drawT3(t3order);
  seg("t3seg", function(s) {
    t3order = s;
    drawT3(s);
  });
  function paneW() {
    var e = document.getElementById("t1chart");
    return e ? e.clientWidth : 0;
  }
  var wasNarrow = narrow(), lastW = paneW(), rz = null;
  window.addEventListener("resize", function() {
    clearTimeout(rz);
    rz = setTimeout(function() {
      var n = narrow(), w = paneW();
      if (n === wasNarrow) {
        if (!n && Math.abs(w - lastW) > 6) {
          lastW = w;
          drawT1();
          drawT2();
          drawMtc();
        }
        return;
      }
      wasNarrow = n;
      lastW = w;
      drawT1();
      drawT2();
      drawBapoGain();
      drawT3(t3order);
      drawMtc();
    }, 200);
  });
  function drawMtc() {
    var eB = document.getElementById("mtc"), eM = document.getElementById("tc-mtc");
    if (!window.d3 || !eB || !eM) return;
    document.getElementById("tc-legend").innerHTML = TC.map(function(mm) {
      return '<span><i style="background:' + TCOL[mm] + '"></i>' + mm + "</span>";
    }).join("") + '<span><i class="dash"></i>One Greedy Run</span>';
    function bt(mm, gi) {
      var r = f4(TSET[gi], mm);
      return { v: +r.B_tok, text: (+r.B_tok).toFixed(2), title: mm + " at " + TSET[gi] + ": B_tok = " + r.B_tok + ", \u0394S = " + r.delta_S_points + " points" };
    }
    function mt(mm, gi) {
      var r = f4(TSET[gi], mm), v = mtcOf(r);
      return { v, text: enot(v), title: mm + " at " + TSET[gi] + ": MTC = " + enot(v) + " tokens per point (B_tok = " + r.B_tok + ", \u0394S = " + r.delta_S_points + ", T_base = " + r.T_base_tokens + ")" };
    }
    function greedy(gi) {
      return +f4(TSET[gi], TC[0]).T_base_tokens;
    }
    if (narrow()) {
      hbars(eB, TSET.map(function(st, gi) {
        return { name: st, rows: TC.map(function(mm) {
          var d = bt(mm, gi);
          return { label: mm, value: d.v, color: TCOL[mm], text: d.text, title: d.title };
        }) };
      }), { max: 9, labelW: 84 });
      hbars(eM, TSET.map(function(st, gi) {
        return { name: st, ref: greedy(gi), rows: TC.map(function(mm) {
          var d = mt(mm, gi);
          return { label: mm, value: d.v, color: TCOL[mm], text: d.text, title: d.title };
        }) };
      }), { max: MTCMAX, labelW: 84 });
    } else {
      vbars(eB, { groups: TSET, series: TC, max: 9, h: 250, all: true, look: tcLook, unit: "B_{tok}, relative to one greedy attempt", cell: bt });
      vbars(eM, { groups: TSET, series: TC, max: MTCMAX, tickFmt: sci, h: 250, all: true, look: tcLook, ref: greedy, unit: "MTC, tokens per point of score gain", cell: mt });
    }
    [["tc-btok", "Avg. B_{tok}", function(r) {
      return +r.B_tok;
    }, 1], ["tc-nmtc", "Avg. nMTC", nmtcOf, 2]].forEach(function(P) {
      var el = document.getElementById(P[0]);
      if (!el) return;
      var vs = TC.map(function(mm) {
        return mean(TSET.map(function(st) {
          return P[2](f4(st, mm));
        }));
      });
      hbars(el, [{ name: P[1], rows: TC.map(function(mm, i) {
        return { label: mm, value: vs[i], color: TCOL[mm], text: vs[i].toFixed(P[3]), title: mm + ", " + P[1].replace("_{tok}", "_tok") + ": " + vs[i].toFixed(P[3]) };
      }) }], { max: Math.max.apply(null, vs) * 1.12, labelW: 84 });
    });
  }
  drawMtc();
  var sc = { "7b": "#C9A227", "14b": "#B23A9A", "32b": "#0E8F99" }, labels = { a_hit_rate: "(a) Prediction hit rate (%)", b_trust_rate: "(b) Trust rate (%)", c_trusted_pred_acc: "(c) Trusted-prediction accuracy (%)", d_abstain_justified: "(d) Abstention (%)" };
  function drawFig5(scale) {
    var box = document.getElementById("fig5");
    if (!window.d3 || !box) return;
    box.innerHTML = "";
    Object.keys(A.fig5).forEach(function(p) {
      var data = A.fig5[p];
      var W = 520, H = 240, m = { t: 26, r: 14, b: 34, l: 40 };
      var div = document.createElement("div");
      box.appendChild(div);
      var svg = d3.select(div).append("svg").attr("viewBox", "0 0 " + W + " " + H).style("color", "var(--ink)");
      var all = [];
      Object.keys(data).forEach(function(s) {
        if (scale === "all" || s === scale) data[s].forEach(function(d) {
          all.push(d[1]);
        });
      });
      var x = d3.scaleLinear().domain([0, 100]).range([m.l, W - m.r]), y = d3.scaleLinear().domain([Math.floor(Math.min.apply(null, all) / 10) * 10 - 2, Math.ceil(Math.max.apply(null, all) / 10) * 10 + 2]).range([H - m.b, m.t]);
      svg.append("text").attr("x", m.l).attr("y", 14).style("font", "600 12.5px var(--body)").style("fill", "currentColor").text(labels[p]);
      svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(d3.axisBottom(x).ticks(5));
      svg.append("g").attr("transform", "translate(" + m.l + ",0)").call(d3.axisLeft(y).ticks(5));
      axisStyle(svg);
      svg.append("text").attr("x", W / 2).attr("y", H - 4).attr("text-anchor", "middle").style("font", "11px var(--body)").style("fill", "currentColor").text("Training steps");
      Object.keys(data).forEach(function(s) {
        if (scale !== "all" && s !== scale) return;
        var pts = data[s];
        svg.append("g").selectAll("circle").data(pts).enter().append("circle").attr("cx", function(d) {
          return x(d[0]);
        }).attr("cy", function(d) {
          return y(d[1]);
        }).attr("r", 1.6).attr("fill", sc[s]).attr("opacity", 0.45);
        var line = d3.line().defined(function(d) {
          return d[2] != null;
        }).x(function(d) {
          return x(d[0]);
        }).y(function(d) {
          return y(d[2]);
        });
        svg.append("path").datum(pts).attr("d", line).attr("fill", "none").attr("stroke", sc[s]).attr("stroke-width", 2.2);
        var last = pts.filter(function(d) {
          return d[2] != null;
        }).slice(-1)[0];
        if (last) svg.append("text").attr("x", x(last[0]) + 4).attr("y", y(last[2]) + 4).style("font", "600 11px var(--body)").style("fill", sc[s]).text(s.toUpperCase());
      });
    });
  }
};
