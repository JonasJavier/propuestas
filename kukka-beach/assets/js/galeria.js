/* Kukka Beach — galería con filtros y visor a pantalla completa
   (teclado ← → Esc, deslizamiento con el dedo y foco atrapado por <dialog>). */
(function () {
  "use strict";
  var K = window.Kukka;
  var rejilla = document.querySelector("[data-galeria]");
  var visor = document.querySelector("[data-visor-dialogo]");
  if (!rejilla || !visor) return;

  var filtros = document.querySelector("[data-galeria-filtros]");
  var img = visor.querySelector("[data-visor-img]");
  var texto = visor.querySelector("[data-visor-texto]");
  var contador = visor.querySelector("[data-visor-contador]");
  var actuales = [];
  var indice = 0;

  function visibles() {
    return Array.prototype.filter.call(rejilla.querySelectorAll(".galeria-item"), function (li) { return !li.hidden; })
      .map(function (li) { return li.querySelector("a"); });
  }

  filtros.addEventListener("click", function (ev) {
    var chip = ev.target.closest("[data-filtro]");
    if (!chip) return;
    var f = chip.getAttribute("data-filtro");
    filtros.querySelectorAll("[data-filtro]").forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
    rejilla.querySelectorAll(".galeria-item").forEach(function (li) {
      li.hidden = f !== "todo" && li.getAttribute("data-cat") !== f;
    });
  });

  function mostrar(i) {
    indice = (i + actuales.length) % actuales.length;
    var a = actuales[indice];
    var miniatura = a.querySelector("img");
    img.style.opacity = "0";
    img.onload = function () { img.style.opacity = "1"; };
    img.src = a.getAttribute("href");
    img.alt = miniatura.alt;
    texto.textContent = miniatura.alt;
    contador.textContent = (indice + 1) + " / " + actuales.length;
    // Precarga la siguiente
    var sig = actuales[(indice + 1) % actuales.length];
    if (sig) { var pre = new Image(); pre.src = sig.getAttribute("href"); }
  }

  function abrir(a) {
    actuales = visibles();
    var i = actuales.indexOf(a);
    mostrar(i < 0 ? 0 : i);
    if (K) K.abrirDialogo(visor); else visor.showModal();
    visor.querySelector("[data-visor-cerrar]").focus();
  }

  rejilla.addEventListener("click", function (ev) {
    var a = ev.target.closest("a[data-visor]");
    if (!a) return;
    ev.preventDefault();
    abrir(a);
  });

  visor.querySelector("[data-visor-prev]").addEventListener("click", function () { mostrar(indice - 1); });
  visor.querySelector("[data-visor-next]").addEventListener("click", function () { mostrar(indice + 1); });
  visor.querySelector("[data-visor-cerrar]").addEventListener("click", function () { visor.close(); });
  visor.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowLeft") { ev.preventDefault(); mostrar(indice - 1); }
    if (ev.key === "ArrowRight") { ev.preventDefault(); mostrar(indice + 1); }
  });
  visor.addEventListener("click", function (ev) {
    if (ev.target === visor || ev.target.classList.contains("visor-figura")) visor.close();
  });

  // Deslizar con el dedo
  var inicioX = null, inicioY = null;
  visor.addEventListener("touchstart", function (ev) {
    inicioX = ev.touches[0].clientX; inicioY = ev.touches[0].clientY;
  }, { passive: true });
  visor.addEventListener("touchend", function (ev) {
    if (inicioX === null) return;
    var dx = ev.changedTouches[0].clientX - inicioX;
    var dy = ev.changedTouches[0].clientY - inicioY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mostrar(indice + (dx < 0 ? 1 : -1));
    inicioX = inicioY = null;
  });

  // Llegada desde el inicio con #foto-…
  if (location.hash.indexOf("#foto-") === 0) {
    var destino = document.getElementById(location.hash.slice(1));
    if (destino) setTimeout(function () { destino.scrollIntoView({ block: "center" }); abrir(destino); }, 80);
  }
})();
