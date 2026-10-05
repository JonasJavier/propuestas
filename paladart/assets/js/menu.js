/* ==========================================================================
   Paladart · menu.js
   Carta interactiva: categorías con barra fija, buscador sin tildes ni
   mayúsculas, filtros y cortes por libra enlazados a la balanza.
   Los platos y precios se editan en menu-data.js.
   ========================================================================== */
(() => {
  "use strict";

  const start = () => {
    const K = window.Sitio;
    const M = window.MENU;
    const box = document.querySelector("[data-menu]");
    if (!K || !M || !box) return;
    const { t, lang } = K;

    const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const catName = (c) => (lang === "en" && c.en) || c.name;
    const catNote = (c) => (lang === "en" && c.note_en) || c.note || "";

    const TAGS = {
      popular: { icon: "i-star" },
      chef: { icon: "i-chef" },
      veg: { icon: "i-leaf" },
      nuevo: { icon: "i-sparkle" },
      picante: { icon: "i-flame" },
    };
    const tagLabel = (k) => t("tag." + k);

    function priceHtml(it) {
      if (it.sizes) {
        return `<span class="dish__sizes">${it.sizes.map((s) => {
          const label = (lang === "en" && s.en) || s.label;
          return `<span><span class="size__label">${label}</span>${K.fmtPrice(s.price)}</span>`;
        }).join("")}</span>`;
      }
      return K.priceLabel(it);
    }

    function dishHtml(it) {
      const name = K.itemName(it);
      const alt = lang === "es" ? (it.en && it.en.name) : it.name;
      const desc = K.itemDesc(it);
      const meta = [
        ...(it.tags || []).filter((k) => TAGS[k]).map((k) => `<span class="tag tag--${k}"><svg class="icon" aria-hidden="true"><use href="#${TAGS[k].icon}"/></svg>${tagLabel(k)}</span>`),
        it.cut ? `<a class="dish__weigh" href="index.html?corte=${it.id}#balanza"><svg class="icon" aria-hidden="true"><use href="#i-scale"/></svg>${t("menu.weigh")}</a>` : "",
      ].join("");
      const photo = it.img ? K.img(it.img, { sizes: "84px", alt: "", cls: "dish__photo" }) : "";
      const search = norm([it.name, it.desc, it.en && it.en.name, it.en && it.en.desc].join(" "));
      return `<li class="dish${photo ? " dish--photo" : ""}" id="${it.id}" data-tags="${(it.tags || []).join(" ")}${it.img ? " foto" : ""}" data-search="${search.replace(/"/g, "")}">
        ${photo}
        <h3 class="dish__name">${name}${alt && alt !== name ? `<span class="dish__en" lang="${lang === "es" ? "en" : "es"}">${alt}</span>` : ""}</h3>
        <p class="dish__price">${priceHtml(it)}</p>
        ${desc ? `<p class="dish__desc">${desc}</p>` : ""}
        <div class="dish__meta">${meta}</div>
      </li>`;
    }

    box.innerHTML = M.categories.map((c) => {
      const items = M.items.filter((it) => it.cat === c.id);
      if (!items.length) return "";
      const featured = c.id === "cortes";
      return `<section class="menu-cat${featured ? " menu-cat--featured" : ""}" id="cat-${c.id}" aria-labelledby="h-${c.id}">
        <div class="menu-cat__head">
          <h2 id="h-${c.id}">${catName(c)}</h2>
          ${catNote(c) ? `<p class="menu-cat__note">${catNote(c)}</p>` : ""}
        </div>
        <ul class="menu-list" role="list">${items.map(dishHtml).join("")}</ul>
      </section>`;
    }).join("");

    /* ---------- Barra de categorías ---------- */
    const bar = document.querySelector("[data-catbar]");
    const wrap = document.querySelector(".catbar-wrap");
    const sections = [...box.querySelectorAll(".menu-cat")];
    bar.innerHTML = sections.map((s) => `<li><a href="#${s.id}" data-cat="${s.id}">${s.querySelector("h2").textContent}</a></li>`).join("");
    const links = [...bar.querySelectorAll("a")];
    const prevBtn = document.querySelector("[data-cat-prev]");
    const nextBtn = document.querySelector("[data-cat-next]");

    const visibleSections = () => sections.filter((s) => !s.hidden);
    let current = null;

    function setCurrent(id) {
      if (id === current) return;
      current = id;
      links.forEach((a) => a.setAttribute("aria-current", a.dataset.cat === id ? "true" : "false"));
      const a = links.find((x) => x.dataset.cat === id);
      if (a) {
        const target = a.offsetLeft - bar.clientWidth / 2 + a.offsetWidth / 2;
        bar.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
      }
      const vis = visibleSections();
      const i = vis.findIndex((s) => s.id === id);
      prevBtn.disabled = i <= 0;
      nextBtn.disabled = i === -1 || i >= vis.length - 1;
    }

    function spy() {
      const line = wrap.getBoundingClientRect().bottom + 48;
      let id = null;
      for (const s of visibleSections()) {
        if (s.getBoundingClientRect().top <= line) id = s.id;
      }
      setCurrent(id || (visibleSections()[0] && visibleSections()[0].id));
      wrap.classList.toggle("is-stuck", wrap.getBoundingClientRect().top <= parseFloat(getComputedStyle(wrap).top) + 1 && window.scrollY > 200);
    }
    window.addEventListener("scroll", spy, { passive: true });

    function go(id) {
      const s = document.getElementById(id);
      if (!s) return;
      s.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    bar.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-cat]");
      if (!a) return;
      e.preventDefault();
      go(a.dataset.cat);
      history.replaceState(null, "", "#" + a.dataset.cat);
    });
    const step = (dir) => {
      const vis = visibleSections();
      const i = vis.findIndex((s) => s.id === current);
      const next = vis[Math.min(vis.length - 1, Math.max(0, i + dir))];
      if (next) go(next.id);
    };
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));

    /* ---------- Búsqueda y filtros ---------- */
    const input = document.getElementById("menu-q");
    const clear = document.querySelector("[data-clear]");
    const empty = document.querySelector("[data-menu-empty]");
    const emptyTitle = document.querySelector("[data-empty-title]");
    const chips = [...document.querySelectorAll("[data-filter]")];
    let filter = "";

    function apply() {
      const q = norm(input.value.trim());
      const words = q.split(/\s+/).filter(Boolean);
      let total = 0;
      sections.forEach((s) => {
        let n = 0;
        s.querySelectorAll(".dish").forEach((d) => {
          const okText = words.every((w) => d.dataset.search.includes(w));
          const okTag = !filter || d.dataset.tags.split(" ").includes(filter);
          const show = okText && okTag;
          d.hidden = !show;
          if (show) n++;
        });
        s.hidden = n === 0;
        total += n;
      });
      links.forEach((a) => (a.parentElement.hidden = document.getElementById(a.dataset.cat).hidden));
      clear.hidden = !input.value;
      empty.hidden = total > 0;
      if (!total) {
        emptyTitle.textContent = q
          ? t("menu.emptyQuery", { q: input.value.trim() })
          : t("menu.emptyFilter");
      }
      current = null;
      spy();
    }

    let timer;
    input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
    document.querySelector("[data-menu-search]").addEventListener("submit", (e) => { e.preventDefault(); input.blur(); apply(); });
    clear.addEventListener("click", () => { input.value = ""; apply(); input.focus(); });
    chips.forEach((c) => c.addEventListener("click", () => {
      filter = c.dataset.filter;
      chips.forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
      apply();
    }));
    document.querySelectorAll("[data-suggest]").forEach((b) => b.addEventListener("click", () => {
      input.value = b.dataset.suggest;
      filter = "";
      chips.forEach((x) => x.setAttribute("aria-pressed", x.dataset.filter === "" ? "true" : "false"));
      apply();
    }));
    document.querySelector("[data-reset]").addEventListener("click", () => {
      input.value = "";
      filter = "";
      chips.forEach((x) => x.setAttribute("aria-pressed", x.dataset.filter === "" ? "true" : "false"));
      apply();
    });

    document.querySelector("[data-print]")?.addEventListener("click", () => window.print());

    /* ---------- Enlace directo a un plato (menu.html#camarones-papi) ---------- */
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && document.getElementById(hash)) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        const y = el.getBoundingClientRect().top + window.scrollY - (wrap.offsetHeight + parseFloat(getComputedStyle(wrap).top) + 16);
        window.scrollTo({ top: y });
        el.style.transition = "background-color 1.2s";
        el.style.backgroundColor = "rgba(233, 181, 34, 0.28)";
        setTimeout(() => (el.style.backgroundColor = ""), 1600);
      }, 0);
    }
    spy();
  };

  if (window.Sitio && window.Sitio.ready) start();
  else document.addEventListener("sitio:ready", start, { once: true });
})();
