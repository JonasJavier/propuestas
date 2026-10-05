/* ==========================================================================
   La Casita de Papi · gallery.js
   Filtros de la galería y visor a pantalla completa: teclado (← → Esc),
   deslizamiento con el dedo y foco dentro del visor (diálogo nativo).
   ========================================================================== */
(() => {
  "use strict";

  const start = () => {
    const K = window.Casita;
    const lists = document.querySelectorAll("[data-gallery]");
    if (!K || !lists.length) return;
    const { t } = K;

    // Visor
    const dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", t("lb.label"));
    dlg.innerHTML = `
      <div class="lightbox__frame">
        <div class="lightbox__top">
          <span data-count aria-live="polite"></span>
          <button class="icon-btn" type="button" data-close aria-label="${t("lb.close")}"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button>
        </div>
        <div class="lightbox__stage"><img alt=""></div>
        <p class="lightbox__caption"></p>
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="${t("lb.prev")}"><svg class="icon" aria-hidden="true"><use href="#i-left"/></svg></button>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="${t("lb.next")}"><svg class="icon" aria-hidden="true"><use href="#i-right"/></svg></button>
      </div>`;
    document.body.appendChild(dlg);
    const big = dlg.querySelector(".lightbox__stage img");
    const caption = dlg.querySelector(".lightbox__caption");
    const count = dlg.querySelector("[data-count]");
    let items = [];
    let index = 0;

    dlg.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) document.body.classList.remove("has-dialog");
      items[index]?.focus({ preventScroll: true });
    });
    dlg.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) dlg.close();
    });

    function show(i) {
      index = (i + items.length) % items.length;
      const src = items[index].querySelector("img");
      big.src = src.currentSrc || src.src;
      if (src.srcset) big.srcset = src.srcset;
      big.sizes = "100vw";
      big.alt = src.alt;
      caption.textContent = src.alt;
      count.textContent = `${index + 1} / ${items.length}`;
    }

    function open(list, btn) {
      items = [...list.querySelectorAll(".gallery__item")].filter((b) => !b.closest("li").hidden);
      show(items.indexOf(btn));
      dlg.showModal();
      document.body.classList.add("has-dialog");
    }

    dlg.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(index - 1));
    dlg.querySelector(".lightbox__nav--next").addEventListener("click", () => show(index + 1));
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    });

    // Deslizar con el dedo
    const stage = dlg.querySelector(".lightbox__stage");
    let x0 = null, y0 = null;
    stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    lists.forEach((list) => {
      list.addEventListener("click", (e) => {
        const btn = e.target.closest(".gallery__item");
        if (btn) open(list, btn);
      });
    });

    // Filtros (página de galería)
    const chips = [...document.querySelectorAll("[data-gallery-filter]")];
    chips.forEach((c) => c.addEventListener("click", () => {
      const cat = c.dataset.galleryFilter;
      chips.forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
      document.querySelectorAll("[data-gallery] > li").forEach((li) => {
        li.hidden = !!cat && !li.dataset.cat.split(" ").includes(cat);
      });
    }));
  };

  if (window.Casita && window.Casita.ready) start();
  else document.addEventListener("casita:ready", start, { once: true });
})();
