/* La Casita de Mary · carta: render, búsqueda sin tildes, filtros y categorías */
(function () {
  "use strict";
  var root = document.querySelector("[data-menu-root]");
  if (!root || !window.MENU) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var EN = new URLSearchParams(location.search).get("lang") === "en";
  var money = window.casitaMoney;
  var TAGS = EN
    ? { popular: "Most ordered", chef: "House special", nuevo: "New", veg: "Veg", picante: "Spicy" }
    : { popular: "Lo más pedido", chef: "De la casa", nuevo: "Nuevo", veg: "Veg", picante: "Picante" };

  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Render ---------- */
  var cats = window.MENU.categories;
  root.innerHTML = cats.map(function (c) {
    var items = c.items.map(function (it) {
      var name = EN ? it.en || it.name : it.name;
      var desc = EN ? it.descEn || it.desc : it.desc;
      var im = it.img && window.casitaSrcset(it.img);
      var flags = (it.tags || []).slice();
      if (it.origin) flags.push(it.origin);
      var hay = norm([it.name, it.en, it.desc, it.descEn, c.name, c.en].join(" "));
      var tags = (it.tags || []).filter(function (t) { return TAGS[t]; }).map(function (t) { return '<span class="tag tag--' + t + '">' + TAGS[t] + "</span>"; }).join("");
      return '<li class="item' + (im ? " item--photo" : "") + '" data-flags="' + flags.join(" ") + '" data-hay="' + esc(hay) + '">' +
        (im ? '<img class="item__img" src="/propuestas/la-casita-de-mary/assets/img/' + it.img + "-" + window.IMG[it.img].w[0] + ".webp" + '" width="84" height="84" alt="' + esc(name) + '" loading="lazy" decoding="async">' : "") +
        '<div class="item__name">' + esc(name) + tags + "</div>" +
        '<span class="item__price">' + money(it.price) + "</span>" +
        '<p class="item__desc">' + esc(desc) + "</p>" +
        '<button class="item__add" type="button" data-add="' + it.id + '" aria-label="' + (EN ? "Add " : "Agregar ") + esc(name) + '"><svg aria-hidden="true"><use href="#i-plus"/></svg></button>' +
        "</li>";
    }).join("");
    var note = EN ? c.noteEn : c.note;
    return '<section class="menu-cat" id="' + c.id + '" aria-labelledby="h-' + c.id + '">' +
      '<div class="menu-cat__head"><h2 id="h-' + c.id + '">' + esc(EN ? c.en : c.name) + "</h2>" + (note ? "<p>" + esc(note) + "</p>" : "") + "</div>" +
      '<ul class="menu-list">' + items + "</ul></section>";
  }).join("");

  var catList = $("[data-cats]");
  catList.innerHTML = cats.map(function (c) {
    return '<li><a href="#' + c.id + '" data-cat="' + c.id + '">' + esc(EN ? c.en : c.name) + "</a></li>";
  }).join("");

  /* ---------- Búsqueda y filtros ---------- */
  var q = $("[data-menu-search]"), clear = $("[data-search-clear]"), filters = $("[data-menu-filters]"), empty = $("[data-menu-empty]");
  var filter = "all";
  function apply() {
    var term = norm(q.value.trim()), any = false;
    clear.hidden = !q.value;
    $$(".menu-cat", root).forEach(function (sec) {
      var vis = 0;
      $$(".item", sec).forEach(function (li) {
        var ok = (!term || li.dataset.hay.indexOf(term) > -1) && (filter === "all" || li.dataset.flags.split(" ").indexOf(filter) > -1);
        li.hidden = !ok;
        if (ok) vis++;
      });
      sec.hidden = vis === 0;
      var link = $('[data-cat="' + sec.id + '"]', catList);
      if (link) link.parentNode.hidden = vis === 0;
      if (vis) any = true;
    });
    empty.hidden = any;
    spy();
  }
  q.addEventListener("input", apply);
  clear.addEventListener("click", function () { q.value = ""; apply(); q.focus(); });
  filters.addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c) return;
    filter = c.dataset.filter;
    $$(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
    apply();
  });
  $("[data-menu-reset]").addEventListener("click", function () {
    q.value = ""; filter = "all";
    $$(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.filter === "all")); });
    apply();
  });
  // ?q=arepa abre la carta ya filtrada
  var pre = new URLSearchParams(location.search).get("q");
  if (pre) { q.value = pre; }

  /* ---------- Categoría visible (scrollspy) ---------- */
  var current = null;
  function visibleCats() { return $$(".menu-cat", root).filter(function (s) { return !s.hidden; }); }
  function spy() {
    var secs = visibleCats(), off = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64) + 90;
    var act = secs[0];
    secs.forEach(function (s) { if (s.getBoundingClientRect().top - off <= 0) act = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && secs.length) act = secs[secs.length - 1];
    var id = act ? act.id : null;
    if (id === current) return;
    current = id;
    $$("a", catList).forEach(function (a) {
      var on = a.dataset.cat === id;
      a.classList.toggle("is-active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        var left = a.offsetLeft - catList.offsetLeft - (catList.clientWidth - a.offsetWidth) / 2;
        catList.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      } else a.removeAttribute("aria-current");
    });
    navState();
  }
  window.addEventListener("scroll", spy, { passive: true });

  var prev = $("[data-cats-prev]"), next = $("[data-cats-next]");
  function navState() {
    var secs = visibleCats(), i = secs.findIndex(function (s) { return s.id === current; });
    prev.disabled = i <= 0;
    next.disabled = i < 0 || i >= secs.length - 1;
  }
  function go(d) {
    var secs = visibleCats(), i = secs.findIndex(function (s) { return s.id === current; });
    var t = secs[Math.min(secs.length - 1, Math.max(0, i + d))];
    if (t) t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });

  apply();
})();
