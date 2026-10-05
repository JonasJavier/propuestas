/* Central Gastronómica — menú interactivo (categorías, búsqueda y filtros) */
(() => {
  'use strict';

  const MENU = window.CG_MENU;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const chipsEl = $('[data-menu-chips]');
  const listEl = $('[data-menu-list]');
  const search = $('[data-menu-search]');
  const empty = $('[data-menu-empty]');
  if (!MENU || !listEl) return;

  const active = new Set();
  const money = new Intl.NumberFormat('en-US');
  const lang = () => window.CG?.lang || 'es';
  const t = (key) => window.CG?.t(key) ?? key;
  const local = (v) => (v && typeof v === 'object' ? v[lang()] ?? v.es : v || '');
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function picture(name, alt) {
    const w = MENU.imageWidths[0];
    return `<img src="assets/img/${name}-${w}.webp" alt="${alt}" loading="lazy" decoding="async" width="${w}" height="${w}">`;
  }

  function tagHtml(tag) {
    return `<span class="tag tag--${tag}">${t(`tag.${tag}`)}</span>`;
  }

  function render() {
    chipsEl.innerHTML = MENU.sections
      .map((s) => `<a class="chip" href="#${s.id}" data-chip="${s.id}">${local(s.name)}</a>`)
      .join('');

    listEl.innerHTML = MENU.sections.map((s) => `
      <section class="menu-sec" id="${s.id}" data-sec="${s.id}" aria-labelledby="${s.id}-h">
        <header class="menu-sec__head">
          <h2 class="menu-sec__title" id="${s.id}-h">${local(s.name)}</h2>
          ${s.note ? `<p class="menu-sec__note">${local(s.note)}</p>` : ''}
        </header>
        <ul class="dish-list" role="list">
          ${s.items.map((d) => {
            const desc = local(d.desc);
            const haystack = norm(`${d.name} ${desc} ${(d.tags || []).map((tg) => t(`tag.${tg}`)).join(' ')}`);
            return `
            <li class="dish${d.img ? ' dish--img' : ''}" data-tags="${(d.tags || []).join(' ')}" data-search="${haystack.replace(/"/g, '')}">
              <div class="dish__body">
                <h3 class="dish__name">${d.name}</h3>
                ${desc ? `<p class="dish__desc">${desc}</p>` : ''}
                ${d.tags?.length ? `<p class="dish__tags">${d.tags.map(tagHtml).join('')}</p>` : ''}
              </div>
              ${d.price ? `<p class="dish__price"><span class="dish__cur">RD$</span>${money.format(d.price)}</p>` : ''}
              ${d.img ? `<div class="dish__img">${picture(d.img, d.name)}</div>` : ''}
            </li>`;
          }).join('')}
        </ul>
      </section>`).join('');

    applyFilters();
    spy();
  }

  function applyFilters() {
    const q = norm(search?.value.trim() || '');
    let shown = 0;
    $$('.menu-sec', listEl).forEach((sec) => {
      let secShown = 0;
      $$('.dish', sec).forEach((li) => {
        const tags = li.dataset.tags.split(' ');
        const okTags = [...active].every((tg) => tags.includes(tg));
        const okText = !q || li.dataset.search.includes(q);
        const ok = okTags && okText;
        li.hidden = !ok;
        if (ok) secShown += 1;
      });
      sec.hidden = secShown === 0;
      $(`[data-chip="${sec.dataset.sec}"]`, chipsEl)?.classList.toggle('is-off', secShown === 0);
      shown += secShown;
    });
    if (empty) empty.hidden = shown > 0;
    currentChip = null;
    updateSpy?.();
  }

  /* Resalta la categoría que se está leyendo y la mantiene visible en la barra de chips */
  let currentChip = null;
  function updateSpy() {
    const offset = (document.querySelector('.menu-tools')?.getBoundingClientRect().bottom || 120) + 24;
    const sections = $$('.menu-sec:not([hidden])', listEl);
    let current = sections[0];
    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= offset) current = sec;
    });
    const id = current?.dataset.sec;
    if (!id || id === currentChip) return;
    currentChip = id;
    $$('.chip', chipsEl).forEach((c) => {
      const on = c.dataset.chip === id;
      c.classList.toggle('is-active', on);
      if (on) {
        c.setAttribute('aria-current', 'true');
        chipsEl.scrollTo({ left: c.offsetLeft - (chipsEl.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
      } else c.removeAttribute('aria-current');
    });
  }
  let ticking = false;
  function spy() {
    currentChip = null;
    updateSpy();
  }
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateSpy(); ticking = false; });
  }, { passive: true });

  $$('[data-filter]').forEach((btn) => btn.addEventListener('click', () => {
    const tag = btn.dataset.filter;
    if (active.has(tag)) active.delete(tag); else active.add(tag);
    btn.setAttribute('aria-pressed', String(active.has(tag)));
    applyFilters();
  }));

  search?.addEventListener('input', applyFilters);

  $('[data-menu-reset]')?.addEventListener('click', () => {
    active.clear();
    $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    if (search) search.value = '';
    applyFilters();
    search?.focus();
  });

  document.addEventListener('cg:lang', render);
  render();
})();
