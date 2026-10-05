/* ==========================================================================
   La Casita de Papi · main.js
   Idioma, estado abierto/cerrado (hora de Santo Domingo), horario, reservas
   por WhatsApp, navegación, barra móvil, carrusel, mapa y "¿Hay langostinos hoy?"
   Para probar otras horas: ?now=2026-10-06T21:45 (hora de Santo Domingo).
   ========================================================================== */
(() => {
  "use strict";

  const C = window.CASITA;
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  root.classList.add("js");

  /* ---------------------------------------------------------------- Idioma */
  const lang = ["en", "fr"].includes(root.lang) ? root.lang : "es";
  const LOCALE = { es: "es-DO", en: "en-US", fr: "fr-FR" }[lang];

  // Textos que genera JavaScript (español). Inglés y francés: i18n-en.js / i18n-fr.js
  const ES = {
    "status.open": "Abierto ahora · hasta {at}",
    "status.soon": "Cierra pronto · a {at}",
    "status.later": "Abre hoy a {at}",
    "status.tomorrow": "Cerrado · abre mañana a {at}",
    "status.day": "Cerrado · abre el {day} a {at}",
    "status.closed": "Cerrado",
    "short.open": "Abierto",
    "short.soon": "Cierra pronto",
    "short.later": "Abre hoy",
    "short.closed": "Cerrado",
    "hours.closed": "Cerrado",
    "hours.today": "Hoy",
    "price.from": "desde",
    "season.open": "Temporada abierta",
    "season.closed": "En veda hasta el 1 de julio",
    "season.yes": "Sí",
    "season.no": "Hoy no",
    "season.daysLeft": "Quedan {n} días de temporada",
    "season.lastDay": "Último día de temporada",
    "season.back": "Vuelven el 1 de julio · faltan {n} días",
    "season.backTomorrow": "Vuelven mañana, 1 de julio",
    "season.statusOpen": "Hoy hay Langostinos a la Papi",
    "season.statusClosed": "Hoy no hay langostinos: es tiempo de veda",
    "season.aria": "Calendario del langostino. Veda del 1 de marzo al 30 de junio. Hoy es {date}: {answer}.",
    "season.ariaYes": "hay langostinos",
    "season.ariaNo": "no hay langostinos",
    "season.cta.open": "Reservar para comerlos",
    "season.cta.closed": "Pedir los Camarones a la Papi",
    "closing.tonight": "¿Te guardamos una mesa en la arena esta noche?",
    "closing.tomorrow": "¿Te guardamos una mesa en la arena para mañana?",
    "closing.day": "¿Te guardamos una mesa en la arena para el {day}?",
    "res.peopleN": "{n} personas",
    "res.person": "1 persona",
    "res.more": "Más de {n} personas",
    "res.noTimes": "Ese día no quedan horas para reservar. Elige otra fecha.",
    "res.closedDay": "Ese día la casita descansa. Elige otra fecha.",
    "res.err.name": "Escribe a nombre de quién va la reserva.",
    "res.err.date": "Elige una fecha de hoy en adelante.",
    "res.err.time": "Elige una hora.",
    "res.summary": "{date} · {time} · {people} · {area}",
    "res.msg.hello": "¡Hola, La Casita de Papi! 👋",
    "res.msg.intro": "Quiero reservar una mesa:",
    "res.msg.date": "📅 {v}",
    "res.msg.time": "🕖 {v}",
    "res.msg.people": "👥 {v}",
    "res.msg.area": "🌴 Área: {v}",
    "res.msg.occasion": "🎉 Ocasión: {v}",
    "res.msg.name": "🙋 A nombre de: {v}",
    "res.msg.notes": "📝 Nota: {v}",
    "res.msg.bye": "¿Me la confirman? ¡Gracias!",
    "res.sent": "Listo: te abrimos WhatsApp con tu reserva. Envía el mensaje y te confirmamos por ahí.",
    "fav.more": "Ver en la carta",
    "map.title": "Mapa de La Casita de Papi en la playa de Cabarete",
    "menu.emptyQuery": "No encontramos “{q}” en la carta.",
    "menu.emptyFilter": "No hay platos con ese filtro.",
    "tag.popular": "Los más pedidos",
    "tag.chef": "De la casa",
    "tag.veg": "Vegetariano",
    "tag.nuevo": "Nuevo",
    "tag.picante": "Picante",
    "lb.label": "Galería de fotos",
    "lb.prev": "Foto anterior",
    "lb.next": "Foto siguiente",
    "lb.close": "Cerrar",
  };
  const dict = () => (lang === "en" ? window.I18N_EN : lang === "fr" ? window.I18N_FR : null);

  function t(key, vars) {
    const D = dict();
    let s = (D && D[key]) || ES[key] || key;
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }

  function applyI18n(scope = document) {
    const DICT = dict();
    if (!DICT) return;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = DICT[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = DICT[el.dataset.i18nHtml];
      if (v != null) el.innerHTML = v;
    });
    scope.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (DICT[key] != null) el.setAttribute(attr.trim(), DICT[key]);
      });
    });
    const page = document.body.dataset.page;
    if (DICT["meta." + page + ".title"]) document.title = DICT["meta." + page + ".title"];
    const desc = document.querySelector('meta[name="description"]');
    if (desc && DICT["meta." + page + ".desc"]) desc.content = DICT["meta." + page + ".desc"];
  }

  /* ------------------------------------------------- Tiempo en Santo Domingo */
  const pad = (n) => String(n).padStart(2, "0");
  const toMin = (s) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const dowOf = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const isoOf = (n) => `${n.y}-${pad(n.m)}-${pad(n.d)}`;

  function nowSD() {
    const o = params.get("now");
    if (o && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(o)) {
      const [ds, ts] = o.split("T");
      const [y, m, d] = ds.split("-").map(Number);
      const [h, mi] = ts.split(":").map(Number);
      return { y, m, d, h, mi };
    }
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: C.timeZone, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", hourCycle: "h23",
    }).formatToParts(new Date());
    const g = (type) => Number(parts.find((p) => p.type === type).value);
    return { y: g("year"), m: g("month"), d: g("day"), h: g("hour") % 24, mi: g("minute") };
  }

  function addDays(n, days) {
    const dt = new Date(Date.UTC(n.y, n.m - 1, n.d + days));
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), h: 0, mi: 0 };
  }

  function fmtTime(min) {
    min = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (lang === "fr") return m ? `${h} h ${pad(m)}` : `${h} h`;
    const h12 = h % 12 || 12;
    if (lang === "en") return `${h12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
    return `${h12}:${pad(m)} ${h < 12 ? "a. m." : "p. m."}`;
  }
  // "la 1:00 p. m." / "las 10:00 p. m." en español
  function atTime(min) {
    if (lang !== "es") return fmtTime(min);
    const h12 = Math.floor((((min % 1440) + 1440) % 1440) / 60) % 12 || 12;
    return (h12 === 1 ? "la " : "las ") + fmtTime(min);
  }
  function dayName(dow, style = "long") {
    // 2023-01-01 fue domingo
    return new Intl.DateTimeFormat(LOCALE, { weekday: style, timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + dow)));
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function longDate(n) {
    const s = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(n.y, n.m - 1, n.d)));
    return cap(s);
  }

  /* -------------------------------------------------- Abierto / cerrado */
  const WEEK = 7 * 1440;
  function intervals() {
    const out = [];
    for (let day = 0; day < 7; day++) {
      for (const [o, c] of C.hours[day] || []) {
        const s = day * 1440 + toMin(o);
        let e = day * 1440 + toMin(c);
        if (e <= s) e += 1440; // cruza la medianoche
        out.push([s, e]);
      }
    }
    return out;
  }

  function statusAt(n) {
    const now = dowOf(n.y, n.m, n.d) * 1440 + n.h * 60 + n.mi;
    const iv = intervals();
    for (const [s, e] of iv) {
      for (const off of [0, -WEEK]) {
        if (now >= s + off && now < e + off) {
          const left = e + off - now;
          return { state: left <= 30 ? "soon" : "open", close: e % 1440, left };
        }
      }
    }
    let best = null;
    for (const [s] of iv) {
      let diff = s - now;
      if (diff <= 0) diff += WEEK;
      if (!best || diff < best.diff) best = { diff, s };
    }
    if (!best) return { state: "closed" };
    const dayDiff = Math.floor(((now % 1440) + best.diff) / 1440);
    return {
      state: dayDiff === 0 ? "later" : "closed",
      open: best.s % 1440,
      dayDiff,
      openDow: Math.floor(best.s / 1440) % 7,
    };
  }

  function statusText(st) {
    switch (st.state) {
      case "open": return t("status.open", { at: atTime(st.close) });
      case "soon": return t("status.soon", { at: atTime(st.close) });
      case "later": return t("status.later", { at: atTime(st.open) });
      default:
        if (st.open == null) return t("status.closed");
        if (st.dayDiff === 1) return t("status.tomorrow", { at: atTime(st.open) });
        return t("status.day", { day: dayName(st.openDow), at: atTime(st.open) });
    }
  }

  function renderStatus() {
    const st = statusAt(nowSD());
    const long = statusText(st);
    const short = t("short." + (st.state === "later" ? "later" : st.state === "closed" ? "closed" : st.state));
    document.querySelectorAll("[data-status]").forEach((el) => {
      el.dataset.state = st.state;
      el.innerHTML = `<span class="status__bulb" aria-hidden="true"></span><span class="status__long">${long}</span><span class="status__short" aria-hidden="true">${short}</span>`;
      if (el.dataset.status === "short") el.title = long;
    });
    return st;
  }

  /* ---------------------------------------------------------- Horario */
  function dayHours(dow) {
    const list = C.hours[dow] || [];
    if (!list.length) return null;
    return list.map(([o, c]) => `${fmtTime(toMin(o))} – ${fmtTime(toMin(c))}`).join(", ");
  }

  function renderHours() {
    const today = dowOf(...Object.values(nowSD()).slice(0, 3));
    const order = [1, 2, 3, 4, 5, 6, 0];
    document.querySelectorAll("[data-hours-table] tbody").forEach((tbody) => {
      tbody.innerHTML = order.map((d) => {
        const h = dayHours(d);
        const isToday = d === today;
        return `<tr${isToday ? ' aria-current="date"' : ""}><th scope="row">${cap(dayName(d))}${isToday ? `<span class="today-tag">${t("hours.today")}</span>` : ""}</th><td${h ? "" : ' class="closed"'}>${h || t("hours.closed")}</td></tr>`;
      }).join("");
    });
    document.querySelectorAll("[data-hours-list]").forEach((dl) => {
      dl.innerHTML = order.map((d) => `<dt>${cap(dayName(d, "short")).replace(".", "")}</dt><dd>${dayHours(d) || t("hours.closed")}</dd>`).join("");
    });
  }

  /* ----------------------------------------------- Temporada del langostino */
  function seasonAt(n) {
    const { closedFrom: [fm, fd], closedTo: [tm, td] } = C.langostinoSeason;
    const md = n.m * 100 + n.d;
    const closed = md >= fm * 100 + fd && md <= tm * 100 + td;
    let target;
    if (closed) target = Date.UTC(n.y, tm - 1, td + 1);
    else target = md < fm * 100 + fd ? Date.UTC(n.y, fm - 1, fd) : Date.UTC(n.y + 1, fm - 1, fd);
    const days = Math.round((target - Date.UTC(n.y, n.m - 1, n.d)) / 864e5);
    return { closed, days };
  }

  function seasonLabel(s) {
    return s.closed ? t("season.closed") : t("season.open");
  }

  /* ------------------------------------------------------------ Imágenes */
  function img(name, { sizes = "100vw", alt = "", cls = "", eager = false } = {}) {
    const im = (window.IMG || {})[name];
    if (!im) return "";
    const ws = im.w;
    const src = ws.find((w) => w >= 800) || ws[ws.length - 1];
    const max = ws[ws.length - 1];
    const u = (w) => `assets/img/${name}-${w}.webp?v=${(im.v || {})[w] || 0}`;
    return `<img src="${u(src)}" srcset="${ws.map((w) => `${u(w)} ${w}w`).join(", ")}" sizes="${sizes}" width="${max}" height="${Math.round(max * im.r)}" alt="${alt}"${cls ? ` class="${cls}"` : ""} ${eager ? "" : 'loading="lazy" '}decoding="async">`;
  }

  /* ------------------------------------------------------------- Precios */
  const nf = new Intl.NumberFormat("en-US");
  const fmtPrice = (n) => `RD$ ${nf.format(n)}`;
  function itemName(it) { return (lang !== "es" && it[lang] && it[lang].name) || it.name; }
  function itemDesc(it) { return (lang !== "es" && it[lang] && it[lang].desc != null ? it[lang].desc : it.desc) || ""; }
  function minPrice(it) { return it.sizes ? Math.min(...it.sizes.map((s) => s.price)) : it.price; }

  /* ------------------------------------------------------------- Diálogos */
  let lastOpener = null;
  function openDialog(dlg, opener) {
    if (!dlg || dlg.open) return;
    lastOpener = opener || document.activeElement;
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    dlg.showModal();
    document.body.classList.add("has-dialog");
  }
  function wireDialogs() {
    document.querySelectorAll("dialog").forEach((dlg) => {
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("close", () => {
        if (!document.querySelector("dialog[open]")) document.body.classList.remove("has-dialog");
        if (lastOpener && document.contains(lastOpener)) lastOpener.focus({ preventScroll: true });
      });
    });
    document.addEventListener("click", (e) => {
      const closer = e.target.closest("[data-close]");
      if (closer) closer.closest("dialog")?.close();
      const opener = e.target.closest("[data-open]");
      if (opener) {
        e.preventDefault();
        openDialog(document.getElementById(opener.dataset.open), opener);
      }
    });
    // En el menú móvil, los enlaces a secciones de esta página cierran la hoja
    document.querySelectorAll("#nav-sheet a").forEach((a) => a.addEventListener("click", () => document.getElementById("nav-sheet").close()));
  }

  /* ------------------------------------------------- Encabezado y barra */
  function wireScroll() {
    const header = document.querySelector("[data-header]");
    const bar = document.querySelector(".tabbar");
    let lastY = window.scrollY;
    let anchor = lastY;
    let dir = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header?.classList.toggle("is-scrolled", y > 8);
      if (y !== lastY) {
        const d = y > lastY ? 1 : -1;
        if (d !== dir) { dir = d; anchor = lastY; }
      }
      if (bar) {
        const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 90;
        if (nearBottom || y < 140) bar.classList.remove("is-hidden");
        else if (dir > 0 && y - anchor > 24) bar.classList.add("is-hidden");
        else if (dir < 0 && anchor - y > 16) bar.classList.remove("is-hidden");
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function wireLang() {
    document.querySelectorAll("[data-lang] a").forEach((a) => {
      a.setAttribute("aria-current", a.hreflang === lang ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------ Reservas */
  function slotsFor(dateIso, now) {
    const [y, m, d] = dateIso.split("-").map(Number);
    const out = [];
    for (const [o, c] of C.hours[dowOf(y, m, d)] || []) {
      const s = toMin(o);
      let e = toMin(c);
      if (e <= s) e += 1440;
      for (let x = s; x <= e - C.lastBookingBeforeClose; x += C.bookingStepMinutes) out.push(x);
    }
    if (dateIso === isoOf(now)) {
      const cur = now.h * 60 + now.mi + 30;
      return out.filter((x) => x >= cur);
    }
    return out;
  }

  function nextBookable(now) {
    for (let i = 0; i < 21; i++) {
      const n = addDays(now, i);
      if (slotsFor(isoOf(n), now).length) return { n, offset: i };
    }
    return { n: now, offset: 0 };
  }

  function wireReservation() {
    const dlg = document.getElementById("reservar");
    if (!dlg) return;
    const form = dlg.querySelector("form");
    const f = (name) => form.elements[name];
    const notice = dlg.querySelector("[data-res-notice]");
    const summary = dlg.querySelector("[data-res-summary]");
    const sent = dlg.querySelector("[data-res-sent]");

    // Personas
    const people = f("personas");
    people.innerHTML = Array.from({ length: C.maxPartySize }, (_, i) => i + 1)
      .map((n) => `<option value="${n}"${n === 2 ? " selected" : ""}>${n === 1 ? t("res.person") : t("res.peopleN", { n })}</option>`)
      .join("") + `<option value="mas">${t("res.more", { n: C.maxPartySize })}</option>`;

    function fillTimes() {
      const now = nowSD();
      const date = f("fecha").value;
      const times = f("hora");
      const prev = times.value;
      notice.hidden = true;
      if (!date) { times.innerHTML = ""; return; }
      const [y, m, d] = date.split("-").map(Number);
      const slots = slotsFor(date, now);
      if (!slots.length) {
        times.innerHTML = `<option value="">—</option>`;
        notice.textContent = (C.hours[dowOf(y, m, d)] || []).length ? t("res.noTimes") : t("res.closedDay");
        notice.hidden = false;
      } else {
        times.innerHTML = slots.map((x) => `<option value="${x}">${fmtTime(x)}</option>`).join("");
        const pick = slots.includes(Number(prev)) ? prev : (slots.find((x) => x >= 19 * 60 + 30) ?? slots[slots.length - 1]);
        times.value = String(pick);
      }
      updateSummary();
    }

    function areaLabel() {
      const r = form.querySelector('input[name="area"]:checked');
      return r ? r.closest("label").querySelector("strong").textContent.trim() : "";
    }

    function updateSummary() {
      const date = f("fecha").value;
      const time = f("hora").value;
      if (!date || !time) { summary.hidden = true; return; }
      const [y, m, d] = date.split("-").map(Number);
      summary.textContent = t("res.summary", {
        date: longDate({ y, m, d }),
        time: fmtTime(Number(time)),
        people: f("personas").selectedOptions[0]?.textContent || "",
        area: areaLabel(),
      });
      summary.hidden = false;
    }

    function setError(input, msg) {
      const err = document.getElementById(input.getAttribute("aria-describedby")?.split(" ").find((id) => id.endsWith("-err")));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }

    function validate() {
      const now = nowSD();
      let first = null;
      const name = f("nombre");
      const date = f("fecha");
      const time = f("hora");
      const bad = (input, msg) => { setError(input, msg); if (msg && !first) first = input; };
      bad(name, name.value.trim().length < 2 ? t("res.err.name") : "");
      bad(date, !date.value || date.value < isoOf(now) ? t("res.err.date") : "");
      bad(time, date.value && !time.value ? t("res.err.time") : "");
      if (first) first.focus();
      return !first;
    }

    function open(opener, area) {
      const now = nowSD();
      const { n } = nextBookable(now);
      const date = f("fecha");
      date.min = isoOf(now);
      const max = addDays(now, 180);
      date.max = isoOf(max);
      if (!date.value || date.value < date.min) date.value = isoOf(n);
      if (area) { const r = form.querySelector(`input[name="area"][value="${area}"]`); if (r) r.checked = true; }
      form.hidden = false;
      sent.hidden = true;
      fillTimes();
      openDialog(dlg, opener);
    }

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-reserve]");
      if (!trigger) return;
      e.preventDefault();
      open(trigger, trigger.dataset.area);
    });

    f("fecha").addEventListener("change", () => { setError(f("fecha"), ""); fillTimes(); });
    form.addEventListener("change", (e) => { if (e.target.name !== "fecha") updateSummary(); });
    f("nombre").addEventListener("input", () => setError(f("nombre"), ""));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      const [y, m, d] = f("fecha").value.split("-").map(Number);
      const occasion = f("ocasion");
      const lines = [
        t("res.msg.hello"),
        t("res.msg.intro"),
        "",
        t("res.msg.date", { v: longDate({ y, m, d }) }),
        t("res.msg.time", { v: fmtTime(Number(f("hora").value)).replace(/ /g, " ") }),
        t("res.msg.people", { v: f("personas").selectedOptions[0].textContent }),
        t("res.msg.area", { v: areaLabel() }),
      ];
      if (occasion.value) lines.push(t("res.msg.occasion", { v: occasion.selectedOptions[0].textContent }));
      lines.push(t("res.msg.name", { v: f("nombre").value.trim() }));
      if (f("nota").value.trim()) lines.push(t("res.msg.notes", { v: f("nota").value.trim() }));
      lines.push("", t("res.msg.bye"));
      const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
      const w = window.open(url, "_blank", "noopener");
      if (!w) window.location.href = url;
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("p").textContent = t("res.sent");
      sent.querySelector("button")?.focus();
    });

    window.Casita.openReserve = open;
  }

  /* ------------------------------------------------------------- Carrusel */
  function renderFavorites() {
    const track = document.querySelector("[data-favorites]");
    if (!track || !window.MENU) return;
    const s = seasonAt(nowSD());
    const items = window.MENU.items.filter((it) => it.fav);
    track.innerHTML = items.map((it) => {
      const seasonTag = it.season === "langostino"
        ? `<span class="season-tag" data-season="${s.closed ? "closed" : "open"}">${seasonLabel(s)}</span>` : "";
      return `<li class="dish-card">
        <a href="menu.html#${it.id}" style="display:contents">
          <div class="dish-card__media">
            ${img(it.img, { sizes: "(min-width: 1280px) 290px, (min-width: 1024px) 390px, (min-width: 768px) 42vw, 78vw", alt: itemName(it) })}
            ${seasonTag}
            <span class="price-tag">${it.sizes ? t("price.from") + " " : ""}${fmtPrice(minPrice(it))}</span>
          </div>
          <div class="dish-card__body">
            <h3 class="dish-card__name">${itemName(it)}</h3>
            <p class="dish-card__desc">${itemDesc(it)}</p>
            <span class="dish-card__more">${t("fav.more")}<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></span>
          </div>
        </a>
      </li>`;
    }).join("");
  }

  function wireCarousel(rootEl) {
    const track = rootEl.querySelector(".carousel__track");
    const scope = rootEl.closest("section") || document;
    const prevs = scope.querySelectorAll("[data-prev]");
    const nexts = scope.querySelectorAll("[data-next]");
    const bar = scope.querySelector(".progress span");
    const smooth = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const vis = Math.min(1, track.clientWidth / track.scrollWidth);
      const r = max > 0 ? track.scrollLeft / max : 0;
      if (bar) {
        bar.style.width = vis * 100 + "%";
        bar.style.transform = `translateX(${r * (1 / vis - 1) * 100}%)`;
      }
      prevs.forEach((b) => (b.disabled = track.scrollLeft <= 2));
      nexts.forEach((b) => (b.disabled = track.scrollLeft >= max - 2));
    };
    const page = (dir) => {
      const cards = track.children;
      if (cards.length < 2) return;
      const pitch = cards[1].offsetLeft - cards[0].offsetLeft;
      const per = Math.max(1, Math.round((track.clientWidth + 1) / pitch));
      track.scrollBy({ left: dir * pitch * per, behavior: smooth });
    };
    prevs.forEach((b) => b.addEventListener("click", () => page(-1)));
    nexts.forEach((b) => b.addEventListener("click", () => page(1)));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // Arrastre con el mouse en escritorio
    let startX = 0, startLeft = 0, down = false, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add("is-dragging"); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      if (moved) {
        const cards = [...track.children];
        const near = cards.reduce((a, c) => (Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft) < Math.abs(a.offsetLeft - track.offsetLeft - track.scrollLeft) ? c : a), cards[0]);
        track.classList.remove("is-dragging");
        track.scrollTo({ left: near.offsetLeft - cards[0].offsetLeft, behavior: smooth });
        setTimeout(() => { moved = false; }, 0);
      }
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener("dragstart", (e) => e.preventDefault());
    update();
  }

  /* ------------------------------------------ "¿Hay langostinos hoy?" */
  function renderPan() {
    const host = document.querySelector("[data-pan]");
    if (!host) return;
    const n = nowSD();
    const s = seasonAt(n);
    const { closedFrom: [fm], closedTo: [tm] } = C.langostinoSeason;
    const cx = 170, cy = 170, r = 128, sw = 26;
    const pt = (a, rad) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const monthFmt = new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: "UTC" });
    let arcs = "";
    for (let i = 0; i < 12; i++) {
      const a0 = -Math.PI / 2 + (i / 12) * 2 * Math.PI + 0.025;
      const a1 = -Math.PI / 2 + ((i + 1) / 12) * 2 * Math.PI - 0.025;
      const [x0, y0] = pt(a0, r);
      const [x1, y1] = pt(a1, r);
      const veda = i + 1 >= fm && i + 1 <= tm;
      const isNow = i + 1 === n.m;
      arcs += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${veda ? "#2b3570" : "#e9b522"}" stroke-width="${sw}" fill="none"${veda ? ' stroke-dasharray="3 3"' : ""}/>`;
      const am = (a0 + a1) / 2;
      const [lx, ly] = pt(am, r);
      const label = monthFmt.format(new Date(Date.UTC(2024, i, 15))).replace(".", "").toUpperCase().slice(0, 4);
      arcs += `<text class="pan__month" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" fill="${veda ? "#aeb6d6" : "#1f1c1a"}"${isNow ? ' font-weight="800"' : ""}>${label}</text>`;
    }
    // Marcador de hoy
    const doy = (Date.UTC(n.y, n.m - 1, n.d) - Date.UTC(n.y, 0, 1)) / 864e5;
    const daysInYear = (Date.UTC(n.y + 1, 0, 1) - Date.UTC(n.y, 0, 1)) / 864e5;
    const ad = -Math.PI / 2 + ((doy + 0.5) / daysInYear) * 2 * Math.PI;
    const [mx, my] = pt(ad, r + sw / 2 + 9);
    const [tx, ty] = pt(ad, r - sw / 2 - 2);
    const answer = s.closed ? t("season.no") : t("season.yes");
    const sub = s.closed
      ? (s.days === 1 ? t("season.backTomorrow") : t("season.back", { n: s.days }))
      : (s.days === 1 ? t("season.lastDay") : t("season.daysLeft", { n: s.days }));
    host.innerHTML = `
      <svg viewBox="0 0 400 340" role="img" aria-label="${t("season.aria", { date: longDate(n), answer: s.closed ? t("season.ariaNo") : t("season.ariaYes") })}">
        <defs>
          <radialGradient id="pan-floor" cx="45%" cy="40%" r="70%">
            <stop offset="0" stop-color="${s.closed ? "#262d55" : "#3b3420"}"/>
            <stop offset="1" stop-color="#0c0f24"/>
          </radialGradient>
        </defs>
        <rect x="300" y="157" width="94" height="26" rx="13" fill="#090b1c" stroke="rgba(255,255,255,.12)"/>
        <circle cx="374" cy="170" r="5" fill="#141b3d"/>
        <circle cx="${cx}" cy="${cy}" r="158" fill="#090b1c" stroke="rgba(255,255,255,.12)" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="${r - sw / 2 - 1}" fill="url(#pan-floor)"/>
        ${arcs}
        <line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${pt(ad, r + sw / 2 + 2)[0].toFixed(1)}" y2="${pt(ad, r + sw / 2 + 2)[1].toFixed(1)}" stroke="#fbf8f3" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="7" fill="#ffd98a" stroke="#141b3d" stroke-width="2"/>
      </svg>
      <div class="pan__center">
        <p class="pan__answer" data-season="${s.closed ? "closed" : "open"}">${answer}</p>
        <p class="pan__sub">${sub}</p>
      </div>`;
    const status = document.querySelector("[data-season-status]");
    if (status) {
      status.dataset.season = s.closed ? "closed" : "open";
      status.textContent = s.closed ? t("season.statusClosed") : t("season.statusOpen");
    }
    const cta = document.querySelector("[data-season-cta]");
    if (cta) {
      cta.querySelector("span").textContent = s.closed ? t("season.cta.closed") : t("season.cta.open");
      if (s.closed) cta.href = "menu.html#camarones-papi";
      else { cta.href = "#reservar"; cta.setAttribute("data-reserve", ""); }
    }
  }

  /* ------------------------------------------------------- Cierre dinámico */
  function renderClosing() {
    const el = document.querySelector("[data-closing-title]");
    if (!el) return;
    const now = nowSD();
    const { offset, n } = nextBookable(now);
    if (offset === 0) el.textContent = t("closing.tonight");
    else if (offset === 1) el.textContent = t("closing.tomorrow");
    else el.textContent = t("closing.day", { day: dayName(dowOf(n.y, n.m, n.d)) });
  }

  /* ---------------------------------------------------------------- Mapa */
  function wireMap() {
    document.querySelectorAll("[data-map-load]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const box = btn.closest(".map");
        const q = encodeURIComponent("La Casita de Papi, Cabarete");
        const iframe = document.createElement("iframe");
        iframe.src = `https://maps.google.com/maps?q=${q}&ll=${C.geo.lat},${C.geo.lng}&z=17&hl=${lang}&output=embed`;
        iframe.title = t("map.title");
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        iframe.allowFullscreen = true;
        box.querySelectorAll("img, .map__credit").forEach((x) => x.remove());
        box.appendChild(iframe);
        btn.remove();
      });
    });
  }

  /* ------------------------------------------------------------- Aparición */
  function wireReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* -------------------------------------------------------------- Inicio */
  window.Casita = { t, lang, LOCALE, nowSD, statusAt, statusText, seasonAt, seasonLabel, fmtPrice, fmtTime, img, itemName, itemDesc, minPrice, openDialog, applyI18n, ready: false };

  function init() {
    applyI18n();
    wireLang();
    renderStatus();
    renderHours();
    renderFavorites();
    document.querySelectorAll("[data-carousel]").forEach(wireCarousel);
    renderPan();
    renderClosing();
    wireDialogs();
    wireReservation();
    wireScroll();
    wireMap();
    wireReveal();
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = nowSD().y));
    root.classList.remove("i18n-pending");
    setInterval(renderStatus, 60 * 1000);
    window.Casita.ready = true;
    document.dispatchEvent(new Event("casita:ready"));
  }

  // Si la página está en inglés o francés, espera a que cargue el diccionario
  const dictScript = document.querySelector("script[data-i18n-src]");
  if (lang !== "es" && !dict() && dictScript) {
    dictScript.addEventListener("load", init, { once: true });
    dictScript.addEventListener("error", init, { once: true });
  } else {
    init();
  }
})();
