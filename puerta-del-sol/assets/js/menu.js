/* Puerta del Sol · menú: buscador sin tildes, filtros, categoría activa y anterior/siguiente. */
(function () {
  "use strict";
  var input = document.querySelector("[data-menu-search]");
  if (!input) return;
  var clearBtn = document.querySelector("[data-search-clear]");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".menu-cat"));
  var dishes = Array.prototype.slice.call(document.querySelectorAll(".dish"));
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-cat-link]"));
  var track = document.querySelector("[data-cats-track]");
  var prevBtn = document.querySelector("[data-cat-prev]");
  var nextBtn = document.querySelector("[data-cat-next]");
  var result = document.querySelector("[data-menu-result]");
  var empty = document.querySelector("[data-menu-empty]");
  var emptyQ = document.querySelector("[data-empty-q]");
  var filter = "all";
  var active = sections[0] && sections[0].id;

  function norm(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function apply() {
    var q = norm(input.value);
    var words = q ? q.split(" ") : [];
    var total = 0;
    dishes.forEach(function (d) {
      var tags = d.getAttribute("data-tags").split(" ");
      var hay = d.getAttribute("data-q");
      var ok = (filter === "all" || tags.indexOf(filter) > -1) &&
        words.every(function (w) { return hay.indexOf(w) > -1; });
      d.hidden = !ok;
      if (ok) total++;
    });
    sections.forEach(function (sec) {
      var n = sec.querySelectorAll(".dish:not([hidden])").length;
      sec.hidden = n === 0;
      sec.querySelector("[data-count]").textContent = n;
      var link = links.find(function (l) { return l.getAttribute("data-cat-link") === sec.getAttribute("data-cat"); });
      if (link) { link.classList.toggle("is-empty", n === 0); link.tabIndex = n === 0 ? -1 : 0; }
    });
    clearBtn.hidden = !input.value;
    var filtered = words.length || filter !== "all";
    result.textContent = filtered ? (total === 1 ? "1 plato" : total + " platos") + (words.length ? " para “" + input.value.trim() + "”" : "") : "";
    empty.hidden = total > 0;
    if (!total) emptyQ.textContent = input.value.trim() || chipLabel();
    updateNav();
  }
  function chipLabel() { var c = chips.find(function (x) { return x.getAttribute("aria-pressed") === "true"; }); return c ? c.textContent : ""; }

  var t;
  input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(apply, 120); });
  input.addEventListener("keydown", function (e) { if (e.key === "Escape" && input.value) { input.value = ""; apply(); } });
  clearBtn.addEventListener("click", function () { input.value = ""; apply(); input.focus(); });
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      filter = c.getAttribute("data-filter");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      apply();
    });
  });
  document.querySelector("[data-menu-reset]").addEventListener("click", function () {
    input.value = ""; filter = "all";
    chips.forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-filter") === "all" ? "true" : "false"); });
    apply(); input.focus();
  });

  /* Categoría activa al hacer scroll */
  function visibleSections() { return sections.filter(function (s) { return !s.hidden; }); }
  function setActive(id) {
    active = id;
    links.forEach(function (l) {
      var on = "cat-" + l.getAttribute("data-cat-link") === id;
      l.classList.toggle("is-active", on);
      if (on) {
        l.setAttribute("aria-current", "true");
        track.scrollTo({ left: l.offsetLeft - track.offsetLeft - track.clientWidth / 2 + l.offsetWidth / 2, behavior: "smooth" });
      } else l.removeAttribute("aria-current");
    });
    updateNav();
  }
  function updateNav() {
    var vis = visibleSections();
    var idx = vis.findIndex(function (s) { return s.id === active; });
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx === -1 ? vis.length === 0 : idx >= vis.length - 1;
  }
  function onScroll() {
    var offset = (window.innerWidth >= 1024 ? 76 : 0) + 90;
    var current = null;
    visibleSections().forEach(function (s) { if (s.getBoundingClientRect().top - offset <= 0) current = s; });
    current = current || visibleSections()[0];
    if (current && current.id !== active) setActive(current.id);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  function go(dir) {
    var vis = visibleSections();
    var idx = vis.findIndex(function (s) { return s.id === active; });
    var target = vis[Math.max(0, Math.min(vis.length - 1, idx + dir))];
    if (target) { target.scrollIntoView({ behavior: "smooth", block: "start" }); setActive(target.id); }
  }
  prevBtn.addEventListener("click", function () { go(-1); });
  nextBtn.addEventListener("click", function () { go(1); });
  links.forEach(function (l) {
    l.addEventListener("click", function () { setActive("cat-" + l.getAttribute("data-cat-link")); });
  });

  if (sections[0]) setActive(sections[0].id);
  onScroll();
})();
