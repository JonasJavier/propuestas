/* The Deck · galería: filtros y visor a pantalla completa
   (teclado ← → Esc, deslizamiento con el dedo; el foco queda dentro del diálogo nativo). */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rejilla = $("[data-rejilla]");
  const visor = $("#visor");
  if (!rejilla || !visor) return;

  const items = $$("li", rejilla);
  const filtros = $$("[data-gal-filtro]");
  const img = $("[data-visor-img]", visor);
  const cuenta = $("[data-visor-cuenta]", visor);
  const texto = $("[data-visor-texto]", visor);
  let visibles = items;
  let actual = 0;

  function filtrar(cat) {
    filtros.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.galFiltro === cat)));
    items.forEach((li) => (li.hidden = !!cat && li.dataset.cat !== cat));
    visibles = items.filter((li) => !li.hidden);
  }
  filtros.forEach((b) => b.addEventListener("click", () => filtrar(b.dataset.galFiltro)));

  function mostrar(i) {
    actual = (i + visibles.length) % visibles.length;
    const foto = $("img", visibles[actual]);
    img.removeAttribute("srcset");
    img.src = foto.getAttribute("src");
    img.srcset = foto.getAttribute("srcset");
    img.sizes = "(min-width: 1024px) 80vw, 100vw";
    img.alt = foto.alt;
    texto.textContent = foto.alt;
    cuenta.textContent = `${actual + 1} / ${visibles.length}`;
  }

  function abrir(li) {
    mostrar(visibles.indexOf(li));
    window.DeckDialog(visor);
  }

  rejilla.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) abrir(b.closest("li"));
  });
  $("[data-visor-ant]", visor).addEventListener("click", () => mostrar(actual - 1));
  $("[data-visor-sig]", visor).addEventListener("click", () => mostrar(actual + 1));
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });

  // Deslizar con el dedo
  const escena = $("[data-visor-escena]", visor);
  let x0 = null;
  escena.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") x0 = e.clientX;
  });
  escena.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
  });
  escena.addEventListener("pointercancel", () => (x0 = null));
  // Un toque en el fondo oscuro (fuera de la foto) cierra
  escena.addEventListener("click", (e) => {
    if (e.target === escena) visor.close();
  });

  // Enlaces desde el inicio: galeria.html#deck-burger abre esa foto
  const desdeHash = () => {
    const li = location.hash && items.find((x) => `#${x.id}` === location.hash);
    if (!li) return;
    filtrar("");
    li.scrollIntoView({ block: "center" });
    abrir(li);
  };
  desdeHash();
  window.addEventListener("hashchange", desdeHash);
})();
