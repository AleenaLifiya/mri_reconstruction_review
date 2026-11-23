(function () {
  "use strict";
  var D = window.REVIEW_DATA, W = D.works;
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function safeUrl(u) { return /^https:\/\//i.test(u || "") ? u : ""; }
  function link(href, text, label) {
    var a = el("a", "", text);
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    if (label) a.setAttribute("aria-label", label);
    return a;
  }

  var SETTINGS = [
    ["Sparse-to-dense", "Slices are missing, and the tissue between them is never measured.", true],
    ["Thick-to-thin", "The tissue between slice centres is measured but averaged into thick slices.", true],
    ["Slice-to-volume", "Several slice stacks cover the tissue and must first be aligned to a common frame.", true],
    ["In-plane super-resolution", "Every slice stays in place, and fine in-plane detail beyond the measured k-space extent is lost.", false],
    ["Accelerated acquisition", "Every slice stays in place, and skipped k-space samples appear as aliasing artefacts.", false],
    ["Isotropic 3D", "The volume is degraded along all three axes at once.", false]
  ];
  var FILTERS = {
    setting: { get: function (w) { return w.settings; }, order: SETTINGS.map(function (s) { return s[0]; }).concat(["Through-plane, type not stated", "Super-resolution, plane not stated", "Outside the six settings"]) },
    source: { get: function (w) { return [w.source]; }, order: ["Simulated", "Simulated and real", "Real", "Not stated"] },
    anatomy: { get: function (w) { return w.anatomy; } },
    dataset: { get: function (w) { return w.datasets; } },
    family: { get: function (w) { return w.families; } },
    supervision: { get: function (w) { return w.supervision; }, order: ["Paired", "Self-supervised", "Unpaired or unsupervised", "Subject-specific", "Not stated"] },
    year: { get: function (w) { return [String(w.year)]; }, desc: true },
    code: { get: function (w) { return [w.code ? "Code released" : "No code released"]; }, order: ["Code released", "No code released"] }
  };
  var state = { q: "", sort: "study", dir: 1, open: {} };

  Object.keys(FILTERS).forEach(function (k) {
    var f = FILTERS[k], counts = {};
    W.forEach(function (w) { f.get(w).forEach(function (v) { counts[v] = (counts[v] || 0) + 1; }); });
    var vals = f.order ? f.order.filter(function (v) { return counts[v]; }) : Object.keys(counts).sort(function (a, b) { return a.localeCompare(b); });
    if (f.desc) vals.reverse();
    if (k === "dataset") vals.sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
    var s = $("f-" + k);
    var all = el("option", "", "All"); all.value = ""; s.appendChild(all);
    vals.forEach(function (v) { var o = el("option", "", v + " (" + counts[v] + ")"); o.value = v; s.appendChild(o); });
    f.select = s;
    s.addEventListener("change", function () { s.classList.toggle("set", !!s.value); render(); });
  });

  function text(w) {
    return [w.study, w.title, w.venue, w.year, w.settings.join(" "), w.source, w.anatomy.join(" "), w.datasets.join(" "), w.families.join(" "), w.supervision.join(" "), w.degradation, w.input].join(" ").toLowerCase();
  }
  W.forEach(function (w) { w._t = text(w); });

  function filtered() {
    var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = W.filter(function (w) {
      if (!terms.every(function (t) { return w._t.indexOf(t) >= 0; })) return false;
      return Object.keys(FILTERS).every(function (k) {
        var v = FILTERS[k].select.value;
        return !v || FILTERS[k].get(w).indexOf(v) >= 0;
      });
    });
    function key(w) {
      var v = w[state.sort];
      if (Array.isArray(v)) return v.join(", ").toLowerCase() || "￿";
      if (typeof v === "boolean") return v ? 0 : 1;
      return typeof v === "string" ? v.toLowerCase() : v;
    }
    return out.sort(function (a, b) {
      var x = key(a), y = key(b);
      var c = x < y ? -1 : x > y ? 1 : 0;
      return c * state.dir || a.study.localeCompare(b.study);
    });
  }

  function tags(list, cls) {
    var td = el("td");
    if (!list.length) { td.appendChild(el("span", "dash", "-")); return td; }
    list.forEach(function (v) { var c = cls ? cls(v) : ""; td.appendChild(el("span", "tag" + (c ? " " + c : ""), v)); });
    return td;
  }
  var THROUGH = ["Sparse-to-dense", "Thick-to-thin", "Slice-to-volume", "Through-plane, type not stated"];
  var FAMILY_CLASS = { "CNN and encoder-decoder": "f-cnn", "GAN": "f-gan", "Transformer and attention": "f-tr", "Diffusion and score-based": "f-dif", "Implicit neural representation": "f-inr", "Deep unfolding": "f-unf", "State-space and Mamba": "f-mam" };
  var SOURCE_CLASS = { "Simulated": "src-sim", "Simulated and real": "src-both", "Real": "src-real", "Not stated": "src-ns" };
  var EVIDENCE_CLASS = { data: "on", valid: "valid", report: "report" };

  function detail(w) {
    var tr = el("tr", "detail"), td = el("td"), dl = el("dl");
    td.colSpan = 8;
    [["Title", w.title], ["Venue", w.venue + " (" + w.type + ")"], ["Degradation operator", w.degradation], ["Factors", w.factors],
     ["Reference", w.reference], ["Model input", w.input], ["Supervision", w.supervision.join(", ")], ["Review ID", w.id], ["DOI", w.doi || "Not available"]].concat(w.code_note ? [["Code", w.code_note]] : [])
      .forEach(function (p) { var d = el("div"); d.appendChild(el("dt", "", p[0])); d.appendChild(el("dd", "", p[1])); dl.appendChild(d); });
    td.appendChild(dl); tr.appendChild(td);
    return tr;
  }

  function render() {
    var list = filtered(), body = $("rows"), frag = document.createDocumentFragment();
    body.textContent = "";
    list.forEach(function (w) {
      var tr = el("tr", "work"), first = el("td", "study-cell"), btn = el("button", "open");
      btn.type = "button";
      btn.setAttribute("aria-expanded", state.open[w.id] ? "true" : "false");
      btn.appendChild(el("b", "", w.study));
      btn.appendChild(el("span", "", w.title));
      btn.addEventListener("click", function () { state.open[w.id] = !state.open[w.id]; render(); });
      first.appendChild(btn);
      tr.appendChild(first);
      tr.appendChild(el("td", "", String(w.year)));
      tr.appendChild(tags(w.settings, function (v) { return THROUGH.indexOf(v) >= 0 ? "tp" : ""; }));
      tr.appendChild(el("td", "", w.source));
      tr.appendChild(tags(w.anatomy));
      tr.appendChild(tags(w.datasets));
      tr.appendChild(tags(w.families, function (v) { return FAMILY_CLASS[v] || ""; }));
      var l = el("td", "links");
      if (safeUrl(w.paper_url)) l.appendChild(link(w.paper_url, "Paper", "Paper: " + w.study));
      if (safeUrl(w.code_url)) l.appendChild(link(w.code_url, "Code", "Code: " + w.study));
      if (w.code && !safeUrl(w.code_url)) { var noLink = el("span", "code-note", "Code stated"); noLink.title = w.code_note; l.appendChild(noLink); }
      if (!l.childNodes.length) l.appendChild(el("span", "dash", "-"));
      tr.appendChild(l);
      frag.appendChild(tr);
      if (state.open[w.id]) frag.appendChild(detail(w));
    });
    if (!list.length) {
      var tr = el("tr"), td = el("td", "empty", "No studies match these filters.");
      td.colSpan = 8; tr.appendChild(td); frag.appendChild(tr);
    }
    body.appendChild(frag);
    $("count").textContent = "Showing " + list.length + " of " + W.length + " studies";
    document.querySelectorAll("#matrix-table thead th").forEach(function (th) {
      var b = th.querySelector("button");
      if (b.dataset.sort === state.sort) th.setAttribute("aria-sort", state.dir > 0 ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });
    return list;
  }

  function applyFilter(k, v) {
    resetAll(false);
    FILTERS[k].select.value = v;
    FILTERS[k].select.classList.add("set");
    render();
    $("matrix").scrollIntoView();
  }
  function resetAll(draw) {
    state.q = ""; $("q").value = "";
    Object.keys(FILTERS).forEach(function (k) { FILTERS[k].select.value = ""; FILTERS[k].select.classList.remove("set"); });
    if (draw !== false) render();
  }

  var timer;
  $("q").addEventListener("input", function (e) {
    clearTimeout(timer);
    timer = setTimeout(function () { state.q = e.target.value; render(); }, 120);
  });
  $("reset").addEventListener("click", function () { resetAll(); });
  document.querySelectorAll("#matrix-table thead button").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.dataset.sort;
      if (state.sort === k) state.dir = -state.dir;
      else { state.sort = k; state.dir = k === "year" ? -1 : 1; }
      render();
    });
  });

  function csvCell(v) {
    var s = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  $("export").addEventListener("click", function () {
    var head = ["Review ID", "Study", "Title", "Year", "Venue", "Publication type", "Anatomy", "Reconstruction settings", "Degraded input", "Degradation operator", "Factors", "Reference", "Supervision", "Input", "Datasets", "Model families", "Code released", "Code URL", "Code note", "DOI", "Paper URL"];
    var rows = filtered().map(function (w) {
      return [w.id, w.study, w.title, w.year, w.venue, w.type, w.anatomy.join("; "), w.settings.join("; "), w.source, w.degradation, w.factors, w.reference, w.supervision.join("; "), w.input, w.datasets.join("; "), w.families.join("; "), w.code ? "Yes" : "No", w.code_url, w.code_note, w.doi, w.paper_url].map(csvCell).join(",");
    });
    var blob = new Blob(["﻿" + head.map(csvCell).join(",") + "\r\n" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = el("a"); a.href = URL.createObjectURL(blob); a.download = "research_matrix_filtered.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  var count = function (label) { return W.filter(function (w) { return w.settings.indexOf(label) >= 0; }).length; };
  var maxSetting = Math.max.apply(null, SETTINGS.map(function (s) { return count(s[0]); }));
  SETTINGS.forEach(function (s) {
    var n = count(s[0]), b = el("button", "setting"), info = el("span"), track = el("span", "track"), fill = el("span", "fill" + (s[2] ? " on" : ""));
    b.type = "button";
    b.setAttribute("aria-label", s[0] + ": " + n + " studies. Filter the matrix.");
    info.appendChild(el("b", "", s[0] + (s[2] ? " · through-plane" : "")));
    info.appendChild(el("small", "", s[1]));
    fill.style.width = (100 * n / maxSetting) + "%";
    track.appendChild(fill);
    b.appendChild(info); b.appendChild(track); b.appendChild(el("span", "val", String(n)));
    b.dataset.tip = s[0] + ": " + n + " of " + W.length + " studies";
    b.addEventListener("click", function () { applyFilter("setting", s[0]); });
    $("settings-chart").appendChild(b);
  });

  function bars(host, items, max, filterKey) {
    items.forEach(function (it) {
      var r = el(filterKey ? "button" : "div", "bar-row"), track = el("span", "track"), fill = el("span", "fill " + (it.cls || "on"));
      if (filterKey) {
        r.type = "button";
        r.setAttribute("aria-label", it.label + ": " + it.n + " studies. Filter the matrix.");
        r.addEventListener("click", function () { applyFilter(filterKey, it.value || it.label); });
      }
      r.dataset.tip = it.label + ": " + it.n + " of " + W.length + " studies";
      fill.style.width = (100 * it.n / max) + "%";
      track.appendChild(fill);
      r.appendChild(el("span", "", it.label)); r.appendChild(track); r.appendChild(el("span", "val", String(it.n)));
      host.appendChild(r);
    });
  }
  var src = FILTERS.source.order.map(function (l) { return { label: l, cls: SOURCE_CLASS[l], n: W.filter(function (w) { return w.source === l; }).length }; });
  bars($("source-chart"), src, W.length, "source");
  var topDs = D.datasets.slice(0, 10).map(function (d) { return { label: d.name, n: d.works }; });
  bars($("dataset-chart"), topDs, topDs[0].n, "dataset");
  bars($("evidence-chart"), D.evidence.map(function (e) { return { label: e.label, n: e.n, cls: EVIDENCE_CLASS[e.group] }; }), W.length);

  document.querySelectorAll("[data-family]").forEach(function (b) {
    b.setAttribute("aria-label", "Filter the matrix by " + b.dataset.family);
    b.addEventListener("click", function () { applyFilter("family", b.dataset.family); });
  });

  $("copy").addEventListener("click", function () {
    var b = this, done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy BibTeX"; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText($("bibtex").textContent).then(done, function () {});
  });

  var tip = $("tip");
  function showTip(e) {
    var t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.dataset.tip; tip.hidden = false;
    var r = t.getBoundingClientRect();
    var x = e.clientX || r.left + 20, y = e.clientY || r.top;
    tip.style.left = Math.min(x + 12, innerWidth - tip.offsetWidth - 8) + "px";
    tip.style.top = Math.max(y - tip.offsetHeight - 10, 6) + "px";
  }
  document.addEventListener("mousemove", showTip);
  document.addEventListener("focusin", showTip);
  document.addEventListener("focusout", function () { tip.hidden = true; });

  var links = {};
  document.querySelectorAll(".toc a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          if (links[e.target.id]) links[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(links).forEach(function (k) { var s = $(k); if (s) io.observe(s); });
  }
  render();
})();
