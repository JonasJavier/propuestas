/* Central Gastronómica — interacciones comunes a todas las páginas */
(() => {
  'use strict';

  const CFG = window.CG_CONFIG;
  const DICT = window.CG_I18N;
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch { /* sin almacenamiento */ } },
  };

  /* ---------------------------------------------------------------- idioma */

  let lang = 'es';
  const originals = new WeakMap();

  function t(key, vars) {
    let str = (DICT[lang] && DICT[lang][key]) ?? DICT.es[key] ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    return str;
  }

  function remember(el, prop) {
    const saved = originals.get(el) || {};
    if (!(prop in saved)) {
      saved[prop] = prop === 'html' ? el.innerHTML : prop === 'text' ? el.textContent : el.getAttribute(prop);
      originals.set(el, saved);
    }
    return saved[prop];
  }

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'es';
    root.lang = lang;
    const en = DICT.en;

    $$('[data-i18n]').forEach((el) => {
      const es = remember(el, 'text');
      el.textContent = lang === 'en' ? (en[el.dataset.i18n] ?? es) : es;
    });
    $$('[data-i18n-html]').forEach((el) => {
      const es = remember(el, 'html');
      el.innerHTML = lang === 'en' ? (en[el.dataset.i18nHtml] ?? es) : es;
    });
    $$('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        const es = remember(el, attr);
        el.setAttribute(attr, lang === 'en' ? (en[key] ?? es) : es);
      });
    });

    if (DICT.meta && DICT.meta[document.body.dataset.page]) {
      const meta = DICT.meta[document.body.dataset.page];
      const titleEs = remember(document.head.querySelector('title'), 'text');
      document.title = lang === 'en' ? meta.title : titleEs;
    }

    $$('[data-lang-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(lang === 'en'));
      $$('[data-lang]', btn).forEach((s) => s.classList.toggle('is-active', s.dataset.lang === lang));
    });

    store.set('cg-lang', lang);
    document.dispatchEvent(new CustomEvent('cg:lang', { detail: { lang } }));
  }

  /* ------------------------------------------------------- hora y horario */

  const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** Fecha/hora actual en Santo Domingo, sin importar la zona del visitante. */
  function nowLocal() {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: CFG.timeZone, weekday: 'short', year: 'numeric', month: '2-digit',
        day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(new Date()).map((p) => [p.type, p.value]),
    );
    return {
      day: DAYS_EN.indexOf(parts.weekday),
      mins: Number(parts.hour) * 60 + Number(parts.minute),
      iso: `${parts.year}-${parts.month}-${parts.day}`,
    };
  }

  function formatTime(mins) {
    const m = ((mins % 1440) + 1440) % 1440;
    const h24 = Math.floor(m / 60);
    const min = String(m % 60).padStart(2, '0');
    const h12 = h24 % 12 || 12;
    if (lang === 'en') return `${h12}:${min} ${h24 < 12 ? 'AM' : 'PM'}`;
    return `${h12}:${min} ${h24 < 12 ? 'a. m.' : 'p. m.'}`;
  }

  /** ¿Está abierto ahora? Considera el cierre después de medianoche del día anterior. */
  function openState() {
    const { day, mins } = nowLocal();
    const [open, close] = CFG.hours[day];
    if (mins >= open && mins < close) return { open: true, closesAt: close, mins, open_: open };
    const prev = CFG.hours[(day + 6) % 7];
    if (prev[1] > 1440 && mins < prev[1] - 1440) return { open: true, closesAt: prev[1] - 1440, mins, late: true };
    if (mins < open) return { open: false, opensAt: open, today: true, mins };
    return { open: false, opensAt: CFG.hours[(day + 1) % 7][0], today: false, mins };
  }

  function renderStatus() {
    const s = openState();
    $$('[data-open-status]').forEach((el) => {
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
      const label = $('[data-open-label]', el);
      const detail = $('[data-open-detail]', el);
      if (label) label.textContent = s.open ? t('status.open') : t('status.closed');
      if (detail) {
        detail.textContent = s.open
          ? t('status.until', { time: formatTime(s.closesAt) })
          : t(s.today ? 'status.opensToday' : 'status.opensTomorrow', { time: formatTime(s.opensAt) });
      }
    });

    // Marca el día de hoy en las tablas de horario
    const { day } = nowLocal();
    $$('[data-hours-day]').forEach((row) => {
      const isToday = Number(row.dataset.hoursDay) === day;
      row.classList.toggle('is-today', isToday);
      row.dataset.today = t('d.today');
      if (isToday) row.setAttribute('aria-current', 'date');
      else row.removeAttribute('aria-current');
    });

    renderDial(s);
  }

  /* Reloj del día: la franja de servicio de hoy y dónde estamos en ella */
  function renderDial(s) {
    const dial = $('[data-day-dial]');
    if (!dial) return;
    const { day, mins } = nowLocal();
    // Si estamos después de medianoche dentro del servicio de ayer, el "día" es ayer.
    const serviceDay = s.late ? (day + 6) % 7 : day;
    const [open, close] = CFG.hours[serviceDay];
    const span = close - open;
    const now = s.late ? mins + 1440 : mins;
    const pct = Math.min(100, Math.max(0, ((now - open) / span) * 100));

    dial.style.setProperty('--now', `${pct}%`);
    dial.classList.toggle('is-live', s.open);

    const moments = $$('[data-moment]', dial);
    const spans = moments.map((m) => {
      const [from, to] = m.dataset.moment.split('-').map(Number);
      return Math.max(0, Math.min(to, close) - from);
    });
    const grid = $('.dial__moments', dial);
    if (grid) grid.style.gridTemplateColumns = spans.map((w) => `${w}fr`).join(' ');

    moments.forEach((m) => {
      const [from, to] = m.dataset.moment.split('-').map(Number);
      const end = Math.min(to, close);
      m.style.setProperty('--from', `${((from - open) / span) * 100}%`);
      m.style.setProperty('--to', `${((end - open) / span) * 100}%`);
      m.classList.toggle('is-now', s.open && now >= from && now < end);
    });

    const closeLabel = $('[data-dial-close]', dial);
    if (closeLabel) closeLabel.textContent = formatTime(close);
    const clock = $('[data-dial-clock]');
    if (clock) clock.textContent = formatTime(mins);
  }

  /* ------------------------------------------------------------ encabezado */

  function initHeader() {
    const header = $('.site-header');
    const sentinel = $('[data-header-sentinel]');
    if (!header) return;
    if (sentinel && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        header.classList.toggle('is-solid', !entry.isIntersecting);
        document.body.classList.toggle('past-hero', !entry.isIntersecting);
      }, { rootMargin: '-64px 0px 0px 0px' }).observe(sentinel);
    } else {
      header.classList.add('is-solid');
      document.body.classList.add('past-hero');
    }

    const nav = $('#nav-sheet');
    $$('[data-nav-open]').forEach((btn) => btn.addEventListener('click', () => {
      nav.showModal();
      btn.setAttribute('aria-expanded', 'true');
    }));
    nav?.addEventListener('close', () => $$('[data-nav-open]').forEach((b) => b.setAttribute('aria-expanded', 'false')));
    $$('[data-nav-close], #nav-sheet a', nav || document).forEach((el) => el.addEventListener('click', () => nav.close()));
  }

  /* ------------------------------------------------------- hojas (dialog) */

  function initSheets() {
    $$('dialog.sheet, dialog.lightbox').forEach((dlg) => {
      // Cerrar al tocar el fondo
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg) dlg.close();
      });
      $$('[data-sheet-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
      dlg.addEventListener('close', () => document.body.classList.remove('has-sheet'));
    });
  }

  function openSheet(dlg) {
    if (!dlg) return;
    document.body.classList.add('has-sheet');
    dlg.showModal();
  }

  /* ----------------------------------------------------------- reservas */

  function waLink(text) {
    return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  function slotsFor(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const [open, close] = CFG.hours[day];
    const lastSeat = close - CFG.lastSeatingBeforeClose;
    const today = nowLocal();
    const slots = [];
    for (let t0 = open; t0 <= lastSeat; t0 += 30) {
      if (isoDate === today.iso && t0 < today.mins + 30) continue;
      slots.push(t0);
    }
    return slots;
  }

  function prettyDate(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-DO', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
    }).format(new Date(Date.UTC(y, m - 1, d)));
  }

  function addDays(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + n));
    return dt.toISOString().slice(0, 10);
  }

  function initReservation() {
    const dlg = $('#reserva');
    const form = $('#reserva-form');
    if (!dlg || !form) return;

    const date = form.elements.fecha;
    const time = form.elements.hora;
    const people = form.elements.personas;
    const note = $('[data-time-note]', form);

    function fillTimes() {
      const prev = time.value;
      const slots = slotsFor(date.value);
      time.innerHTML = '';
      if (!slots.length) {
        const opt = new Option(t('res.noSlots'), '');
        opt.disabled = true;
        time.append(opt);
        time.value = '';
        if (note) note.hidden = false;
        return;
      }
      if (note) note.hidden = true;
      slots.forEach((m) => time.append(new Option(formatTime(m), String(m))));
      // Por defecto, 8:00 p. m. si existe; si no, el primer horario disponible
      const preferred = slots.includes(Number(prev)) ? prev : slots.includes(1200) ? '1200' : String(slots[0]);
      time.value = preferred;
    }

    function setMinDate() {
      const today = nowLocal().iso;
      date.min = today;
      date.max = addDays(today, 90);
      if (!date.value || date.value < today) {
        // Si hoy ya no quedan horarios, proponer mañana
        date.value = slotsFor(today).length ? today : addDays(today, 1);
      }
    }

    // Stepper de personas
    $$('[data-step]', form).forEach((btn) => btn.addEventListener('click', () => {
      const next = Math.min(Number(people.max), Math.max(Number(people.min), Number(people.value) + Number(btn.dataset.step)));
      people.value = next;
      people.dispatchEvent(new Event('input', { bubbles: true }));
    }));
    const bigGroup = $('[data-big-group]', form);
    people.addEventListener('input', () => {
      if (bigGroup) bigGroup.hidden = Number(people.value) < CFG.bigGroupFrom;
    });

    date.addEventListener('change', fillTimes);
    document.addEventListener('cg:lang', () => {
      if (date.value) fillTimes();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const occasion = data.get('ocasion');
      const lines = [
        t('res.msg.hello'),
        '',
        `• ${t('res.msg.name')}: ${data.get('nombre').trim()}`,
        `• ${t('res.msg.date')}: ${prettyDate(data.get('fecha'))}`,
        `• ${t('res.msg.time')}: ${formatTime(Number(data.get('hora')))}`,
        `• ${t('res.msg.people')}: ${data.get('personas')}`,
      ];
      if (occasion && occasion !== 'ninguna') lines.push(`• ${t('res.msg.occasion')}: ${t(`occ.${occasion}`)}`);
      const extra = (data.get('nota') || '').trim();
      if (extra) lines.push(`• ${t('res.msg.note')}: ${extra}`);
      lines.push('', t('res.msg.sign'));
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });

    $$('[data-reserve]').forEach((btn) => btn.addEventListener('click', (e) => {
      e.preventDefault();
      setMinDate();
      fillTimes();
      openSheet(dlg);
    }));

    // Abrir directamente con /#reservar
    if (location.hash === '#reservar') {
      setMinDate();
      fillTimes();
      openSheet(dlg);
    }
  }

  /* Formulario de eventos → WhatsApp */
  function initEventForm() {
    const form = $('#evento-form');
    if (!form) return;
    const date = form.elements.fecha;
    if (date) {
      const today = nowLocal().iso;
      date.min = addDays(today, 1);
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const lines = [
        t('ev.msg.hello'),
        '',
        `• ${t('ev.msg.type')}: ${t(`evtype.${data.get('tipo')}`)}`,
        `• ${t('res.msg.name')}: ${data.get('nombre').trim()}`,
      ];
      const company = (data.get('empresa') || '').trim();
      if (company) lines.push(`• ${t('ev.msg.company')}: ${company}`);
      if (data.get('fecha')) lines.push(`• ${t('res.msg.date')}: ${prettyDate(data.get('fecha'))}`);
      lines.push(`• ${t('ev.msg.guests')}: ${data.get('invitados')}`);
      const extra = (data.get('detalle') || '').trim();
      if (extra) lines.push(`• ${t('ev.msg.details')}: ${extra}`);
      lines.push('', t('res.msg.sign'));
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });

    // Preseleccionar tipo desde las tarjetas
    $$('[data-event-type]').forEach((link) => link.addEventListener('click', () => {
      const radio = form.querySelector(`input[name="tipo"][value="${link.dataset.eventType}"]`);
      if (radio) radio.checked = true;
    }));
  }

  /* Enlaces de WhatsApp genéricos (con mensaje según idioma) */
  function initWaLinks() {
    const update = () => $$('[data-wa]').forEach((a) => {
      a.href = waLink(t(a.dataset.wa || 'wa.default'));
    });
    update();
    document.addEventListener('cg:lang', update);
  }

  /* --------------------------------------------------------------- galería */

  function initLightbox() {
    const dlg = $('#lightbox');
    const items = $$('[data-gallery-item]');
    if (!dlg || !items.length) return;
    const track = $('.lightbox__track', dlg);
    const counter = $('[data-lb-count]', dlg);

    items.forEach((item) => {
      const img = $('img', item);
      const fig = document.createElement('figure');
      fig.className = 'lightbox__slide';
      const big = document.createElement('img');
      big.src = item.dataset.full || img.currentSrc || img.src;
      big.alt = img.alt;
      big.loading = 'lazy';
      big.decoding = 'async';
      fig.append(big);
      track.append(fig);
    });

    const slides = $$('.lightbox__slide', track);
    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (i, smooth = true) => {
      const idx = (i + slides.length) % slides.length;
      track.scrollTo({ left: idx * track.clientWidth, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
    };
    const updateCount = () => { counter.textContent = `${current() + 1} / ${slides.length}`; };

    track.addEventListener('scroll', () => requestAnimationFrame(updateCount), { passive: true });

    items.forEach((item, i) => item.addEventListener('click', (e) => {
      e.preventDefault();
      openSheet(dlg);
      slides.forEach((s) => { const im = $('img', s); im.loading = 'eager'; });
      requestAnimationFrame(() => { go(i, false); updateCount(); });
    }));

    $('[data-lb-prev]', dlg).addEventListener('click', () => go(current() - 1));
    $('[data-lb-next]', dlg).addEventListener('click', () => go(current() + 1));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
    });
  }

  /* Carruseles: flechas, barra de progreso y arrastre con mouse */
  function initRails() {
    $$('[data-rail]').forEach((wrap) => {
      const rail = $('[data-rail-track]', wrap);
      const prev = $('[data-rail-prev]', wrap);
      const next = $('[data-rail-next]', wrap);
      const bar = $('[data-rail-bar]', wrap);
      if (!rail) return;

      // Ancho de una tarjeta más el espacio entre tarjetas
      const unit = () => {
        const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
        return (rail.firstElementChild?.getBoundingClientRect().width || rail.clientWidth) + gap;
      };
      // Avanza tantas tarjetas completas como quepan en el área de contenido
      const step = () => Math.max(1, Math.floor(wrap.clientWidth / unit())) * unit();
      const sync = () => {
        const max = rail.scrollWidth - rail.clientWidth;
        if (prev) prev.disabled = rail.scrollLeft < 8;
        if (next) next.disabled = rail.scrollLeft > max - 8;
        if (bar) {
          const ratio = Math.min(1, rail.clientWidth / rail.scrollWidth);
          const pos = max > 0 ? rail.scrollLeft / max : 0;
          bar.style.width = `${ratio * 100}%`;
          bar.style.transform = `translateX(${(pos * (1 - ratio) / ratio) * 100}%)`;
        }
      };
      const smooth = () => (reducedMotion.matches ? 'auto' : 'smooth');
      // Margen exacto hasta el borde de la ventana (sin contar la barra de scroll)
      const bleed = () => {
        rail.style.setProperty('--bleed', `${Math.max(0, wrap.getBoundingClientRect().left)}px`);
      };
      bleed();
      rail.scrollLeft = 0;
      window.addEventListener('resize', bleed);
      prev?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: smooth() }));
      next?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: smooth() }));
      rail.addEventListener('scroll', sync, { passive: true });
      rail.addEventListener('scrollend', sync);
      window.addEventListener('resize', sync);
      sync();

      // Arrastrar con el mouse (en táctil ya funciona el deslizamiento nativo)
      let startX = 0;
      let startLeft = 0;
      let moved = false;
      let pointerId = null;
      rail.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startLeft = rail.scrollLeft;
        moved = false;
      });
      rail.addEventListener('pointermove', (e) => {
        if (e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) {
          moved = true;
          rail.classList.add('is-dragging');
          rail.setPointerCapture(pointerId);
        }
        if (moved) rail.scrollLeft = startLeft - dx;
      });
      const end = () => {
        if (pointerId === null) return;
        pointerId = null;
        if (!moved) return;
        // Al soltar, ajusta a la tarjeta más cercana
        rail.classList.remove('is-dragging');
        rail.scrollTo({ left: Math.round(rail.scrollLeft / unit()) * unit(), behavior: smooth() });
      };
      rail.addEventListener('pointerup', end);
      rail.addEventListener('pointercancel', end);
      // Evita abrir el enlace al terminar un arrastre
      rail.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
    });
  }

  /* ------------------------------------------------------- apariciones */

  function initReveal() {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    root.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* Mapa: el iframe de Google solo se carga cuando la persona lo pide */
  function initMap() {
    $$('[data-map-load]').forEach((btn) => btn.addEventListener('click', () => {
      const box = btn.closest('[data-map]');
      const frame = document.createElement('iframe');
      frame.src = CFG.mapEmbed;
      frame.title = t('visit.mapTitle');
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      box.append(frame);
      $('.map__load', box)?.remove();
    }));
  }

  /* Barra móvil: se aparta al bajar (para leer) y vuelve al subir o al llegar al final */
  function initActionBar() {
    if (!$('.action-bar')) return;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const nearEnd = window.innerHeight + y > document.documentElement.scrollHeight - 120;
      if (Math.abs(y - lastY) > 8 || nearEnd) {
        document.body.classList.toggle('bar-away', y > lastY && y > 400 && !nearEnd);
        lastY = y;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* Aviso de propuesta (descartable) */
  function initProposalNote() {
    const note = $('[data-proposal-note]');
    if (!note) return;
    if (store.get('cg-note') === 'off') { note.hidden = true; return; }
    $('button', note)?.addEventListener('click', () => {
      note.hidden = true;
      store.set('cg-note', 'off');
    });
  }

  /* ------------------------------------------------------------------ init */

  function init() {
    const params = new URLSearchParams(location.search);
    const initial = params.get('lang') || store.get('cg-lang') || 'es';
    applyLang(initial);

    $$('[data-lang-toggle]').forEach((btn) => btn.addEventListener('click', () => applyLang(lang === 'es' ? 'en' : 'es')));

    renderStatus();
    setInterval(renderStatus, 30000);
    document.addEventListener('cg:lang', renderStatus);

    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

    initHeader();
    initSheets();
    initReservation();
    initEventForm();
    initWaLinks();
    initLightbox();
    initRails();
    initReveal();
    initMap();
    initActionBar();
    initProposalNote();
  }

  window.CG = { t, formatTime, get lang() { return lang; }, openSheet };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
