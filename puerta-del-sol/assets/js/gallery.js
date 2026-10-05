/* Puerta del Sol · galería: filtros y visor a pantalla completa (teclado, deslizar, foco atrapado). */
(function () {
  "use strict";
  var grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  var tiles = Array.prototype.slice.call(grid.querySelectorAll(".g-tile"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-gfilter]"));
  var status = document.querySelector("[data-gallery-status]");
  var lb = document.getElementById("lightbox");
  var img = lb.querySelector("[data-lb-img]");
  var cap = lb.querySelector("[data-lb-cap]");
  var count = lb.querySelector("[data-lb-count]");
  var list = [], index = 0;

  function visible() { return tiles.filter(function (t) { return !t.hidden; }); }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-gfilter");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      tiles.forEach(function (t) { t.hidden = f !== "all" && t.getAttribute("data-gcat") !== f; });
      var n = visible().length;
      status.textContent = "Mostrando " + n + (n === 1 ? " foto" : " fotos");
    });
  });

  function show(i) {
    index = (i + list.length) % list.length;
    var link = list[index].querySelector(".g-link");
    var thumb = link.querySelector("img");
    img.src = link.getAttribute("data-full");
    img.alt = thumb.alt;
    img.width = thumb.width; img.height = thumb.height;
    cap.textContent = thumb.alt;
    count.textContent = (index + 1) + " de " + list.length;
    [index + 1, index - 1].forEach(function (k) {   // precarga las vecinas
      var t = list[(k + list.length) % list.length];
      new Image().src = t.querySelector(".g-link").getAttribute("data-full");
    });
  }

  grid.addEventListener("click", function (e) {
    var link = e.target.closest(".g-link");
    if (!link) return;
    e.preventDefault();
    list = visible();
    show(list.indexOf(link.closest(".g-tile")));
    lb.showModal();
    document.body.classList.add("has-dialog");
  });

  lb.querySelector("[data-lb-prev]").addEventListener("click", function () { show(index - 1); });
  lb.querySelector("[data-lb-next]").addEventListener("click", function () { show(index + 1); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
  });

  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  window.PDS = window.PDS || {};
  window.PDS.gallery = { show: show, get index() { return index; } };
})();
