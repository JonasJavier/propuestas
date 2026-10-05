/* ==========================================================================
   Paladart · main.js
   Idioma, estado abierto/cerrado (hora de Santo Domingo), horario, reservas y
   cotizaciones por WhatsApp, navegación, barra móvil, carrusel, mapa y la
   balanza (precio estimado de los cortes por libra).
   Para probar otras horas: ?now=2026-10-06T22:45 (hora de Santo Domingo).
   ========================================================================== */
(() => {
  "use strict";

  const C = window.NEGOCIO;
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  root.classList.add("js");

  /* ---------------------------------------------------------------- Idioma */
  const lang = root.lang === "en" ? "en" : "es";
  const LOCALE = lang === "en" ? "en-US" : "es-DO";

  // Textos que genera JavaScript (español). Inglés: i18n-en.js
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
    "price.perLb": "/ lb",
    "fav.more": "Ver en la carta",
    "closing.tonight": "¿Te guardamos una mesa cerca de la parrilla esta noche?",
    "closing.tomorrow": "¿Te guardamos una mesa cerca de la parrilla para mañana?",
    "closing.day": "¿Te guardamos una mesa cerca de la parrilla para el {day}?",
    "res.peopleN": "{n} personas",
    "res.person": "1 persona",
    "res.more": "Más de {n} personas",
    "res.noTimes": "Ese día no quedan horas para reservar. Elige otra fecha.",
    "res.closedDay": "Los lunes la parrilla descansa. Elige otra fecha.",
    "res.err.name": "Escribe a nombre de quién va la reserva.",
    "res.err.date": "Elige una fecha de hoy en adelante.",
    "res.err.time": "Elige una hora.",
    "res.summary": "{date} · {time} · {people} · {area}",
    "res.msg.hello": "¡Hola, Paladart! 👋",
    "res.msg.intro": "Quiero reservar una mesa:",
    "res.msg.date": "📅 {v}",
    "res.msg.time": "🕖 {v}",
    "res.msg.people": "👥 {v}",
    "res.msg.area": "📍 Mesa: {v}",
    "res.msg.occasion": "🎉 Ocasión: {v}",
    "res.msg.name": "🙋 A nombre de: {v}",
    "res.msg.notes": "📝 Nota: {v}",
    "res.msg.bye": "¿Me la confirman? ¡Gracias!",
    "res.sent": "Listo: te abrimos WhatsApp con tu reserva. Envía el mensaje y te confirmamos por ahí.",
    "bal.people1": "Rinde para 1 persona",
    "bal.people12": "Rinde para 1 o 2 personas",
    "bal.people2": "Rinde para 2 personas",
    "bal.people23": "Rinde para 2 o 3 personas",
    "bal.people34": "Rinde para 3 o 4 personas",
    "bal.lb": "lb",
    "bal.live": "{cut}, {w} libras, {done}: {price}. Aproximadamente {total} con ITBIS y servicio.",
    "bal.reserveNote": "Quisiera apartar un {cut} de unas {w} lb, {done}.",
    "bal.pickupMsg": "¡Hola, Paladart! 👋\nQuisiera pedir para recoger (pick up):\n\n🥩 {cut} · unas {w} lb · {done}\n💵 Estimado: {price} + ITBIS y servicio\n\n¿A qué hora puedo pasar? ¡Gracias!",
    "bal.aria": "Balanza: {w} libras",
    "done.jugoso": "jugoso",
    "done.punto": "a punto",
    "done.cocido": "bien cocido",
    "q.err.name": "Escribe tu nombre.",
    "q.err.date": "Elige una fecha a partir de mañana.",
    "q.err.guests": "Indica cuántas personas, desde 6.",
    "q.msg.hello": "¡Hola, Paladart! 👋",
    "q.msg.intro": "Quisiera cotizar un evento:",
    "q.msg.type": "🎉 Tipo: {v}",
    "q.msg.where": "📍 Dónde: {v}",
    "q.msg.date": "📅 Fecha: {v}",
    "q.msg.time": "🕖 Horario: {v}",
    "q.msg.guests": "👥 Invitados: {v}",
    "q.msg.food": "🍽️ Nos interesa: {v}",
    "q.msg.budget": "💵 Presupuesto por persona: {v}",
    "q.msg.name": "🙋 Nombre: {v}",
    "q.msg.notes": "📝 Detalles: {v}",
    "q.msg.bye": "¿Me envían una propuesta? ¡Gracias!",
    "q.sent": "Listo: te abrimos WhatsApp con los datos del evento. Envía el mensaje y te respondemos con una propuesta.",
    "menu.emptyQuery": "No encontramos «{q}» en la carta.",
    "menu.emptyFilter": "No hay platos con ese filtro.",
    "tag.popular": "Los más pedidos",
    "tag.chef": "De la casa",
    "tag.veg": "Vegetariano",
    "tag.nuevo": "Nuevo",
    "tag.picante": "Picante",
    "menu.weigh": "Calcular en la balanza",
    "lb.label": "Galería de fotos",
    "lb.prev": "Foto anterior",
    "lb.next": "Foto siguiente",
    "lb.close": "Cerrar",
    "map.title": "Mapa de Paladart en el boulevard de Juan Dolio",
  };
  const dict = () => (lang === "en" ? window.I18N_EN : null);

  function t(key, vars) {
    const D = dict();
    let s = (D && D[key]) || ES[key] || key;
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }

  function applyI18n(scope = document) {
    const D = dict();
    if (!D) return;
    scope.querySelectorAll("[data-i18n]").forEach((el) => { const v = D[el.dataset.i18n]; if (v != null) el.textContent = v; });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => { const v = D[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    scope.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (D[key] != null) el.setAttribute(attr.trim(), D[key]);
      });
    });
    const page = document.body.dataset.page;
    if (D["meta." + page + ".title"]) document.title = D["meta." + page + ".title"];
    const desc = document.querySelector('meta[name="description"]');
    if (desc && D["meta." + page + ".desc"]) desc.content = D["meta." + page + ".desc"];
  }

  /* ------------------------------------------------- Tiempo en Santo Domingo */
  const pad = (n) => String(n).padStart(2, "0");
  const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
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
    const h12 = h % 12 || 12;
    if (lang === "en") return `${h12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
    return `${h12}:${pad(m)} ${h < 12 ? "a. m." : "p. m."}`;
  }
  // "la 1:00 p. m." / "las 11:00 p. m." en español
  function atTime(min) {
    if (lang !== "es") return fmtTime(min);
    const h12 = Math.floor((((min % 1440) + 1440) % 1440) / 60) % 12 || 12;
    return (h12 === 1 ? "la " : "las ") + fmtTime(min);
  }
  function dayName(dow, style = "long") {
    return new Intl.DateTimeFormat(LOCALE, { weekday: style, timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + dow)));
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function longDate(n) {
    return cap(new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(n.y, n.m - 1, n.d))));
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
    return { state: dayDiff === 0 ? "later" : "closed", open: best.s % 1440, dayDiff, openDow: Math.floor(best.s / 1440) % 7 };
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
    const short = t("short." + st.state);
    document.querySelectorAll("[data-status]").forEach((el) => {
      el.dataset.state = st.state;
      el.innerHTML = `<span class="status__bulb" aria-hidden="true"></span><span class="status__long">${long}</span><span class="status__short" aria-hidden="true">${short}</span>`;
      if (el.dataset.status === "short") el.title = long;
    });
  }

  /* ---------------------------------------------------------- Horario */
  function dayHours(dow) {
    const list = C.hours[dow] || [];
    if (!list.length) return null;
    return list.map(([o, c]) => `${fmtTime(toMin(o))} – ${fmtTime(toMin(c))}`).join(", ");
  }
  function renderHours() {
    const n = nowSD();
    const today = dowOf(n.y, n.m, n.d);
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
  const fmtPrice = (n) => `RD$ ${nf.format(Math.round(n))}`;
  function itemName(it) { return (lang === "en" && it.en && it.en.name) || it.name; }
  function itemDesc(it) { return (lang === "en" && it.en && it.en.desc != null ? it.en.desc : it.desc) || ""; }
  function minPrice(it) { return it.sizes ? Math.min(...it.sizes.map((s) => s.price)) : it.price; }
  function priceLabel(it) {
    if (it.sizes) return `${t("price.from")} ${fmtPrice(minPrice(it))}`;
    return fmtPrice(it.price) + (it.perLb ? ` <small>${t("price.perLb")}</small>` : "");
  }

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
      if (opener) { e.preventDefault(); openDialog(document.getElementById(opener.dataset.open), opener); }
    });
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
    document.querySelectorAll("[data-lang] a").forEach((a) => a.setAttribute("aria-current", a.hreflang === lang ? "true" : "false"));
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
  function openWhatsApp(text) {
    const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
    return url;
  }

  function wireReservation() {
    const dlg = document.getElementById("reservar");
    if (!dlg) return;
    const form = dlg.querySelector("form");
    const f = (name) => form.elements[name];
    const notice = dlg.querySelector("[data-res-notice]");
    const summary = dlg.querySelector("[data-res-summary]");
    const sent = dlg.querySelector("[data-res-sent]");

    f("personas").innerHTML = Array.from({ length: C.maxPartySize }, (_, i) => i + 1)
      .map((n) => `<option value="${n}"${n === 2 ? " selected" : ""}>${n === 1 ? t("res.person") : t("res.peopleN", { n })}</option>`)
      .join("") + `<option value="mas">${t("res.more", { n: C.maxPartySize })}</option>`;

    function areaLabel() {
      const r = form.querySelector('input[name="area"]:checked');
      return r ? r.closest("label").querySelector("strong").textContent.trim() : "";
    }
    function updateSummary() {
      const date = f("fecha").value;
      const time = f("hora").value;
      if (!date || !time) { summary.hidden = true; return; }
      const [y, m, d] = date.split("-").map(Number);
      summary.textContent = t("res.summary", { date: longDate({ y, m, d }), time: fmtTime(Number(time)), people: f("personas").selectedOptions[0]?.textContent || "", area: areaLabel() });
      summary.hidden = false;
    }
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
    function setError(input, msg) {
      const id = (input.getAttribute("aria-describedby") || "").split(" ").find((x) => x.endsWith("-err"));
      const err = id && document.getElementById(id);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }
    function validate() {
      const now = nowSD();
      let first = null;
      const bad = (input, msg) => { setError(input, msg); if (msg && !first) first = input; };
      bad(f("nombre"), f("nombre").value.trim().length < 2 ? t("res.err.name") : "");
      bad(f("fecha"), !f("fecha").value || f("fecha").value < isoOf(now) ? t("res.err.date") : "");
      bad(f("hora"), f("fecha").value && !f("hora").value ? t("res.err.time") : "");
      if (first) first.focus();
      return !first;
    }
    function open(opener, area, note) {
      const now = nowSD();
      const { n } = nextBookable(now);
      const date = f("fecha");
      date.min = isoOf(now);
      date.max = isoOf(addDays(now, 180));
      if (!date.value || date.value < date.min) date.value = isoOf(n);
      if (area) { const r = form.querySelector(`input[name="area"][value="${area}"]`); if (r) r.checked = true; }
      if (note) f("nota").value = note;
      form.hidden = false;
      sent.hidden = true;
      fillTimes();
      openDialog(dlg, opener);
    }

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-reserve]");
      if (!trigger) return;
      e.preventDefault();
      open(trigger, trigger.dataset.area, trigger.dataset.note);
    });
    f("fecha").addEventListener("change", () => { setError(f("fecha"), ""); fillTimes(); });
    form.addEventListener("change", (e) => { if (e.target.name !== "fecha") updateSummary(); });
    f("nombre").addEventListener("input", () => setError(f("nombre"), ""));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      const [y, m, d] = f("fecha").value.split("-").map(Number);
      const occ = f("ocasion");
      const lines = [t("res.msg.hello"), t("res.msg.intro"), "",
        t("res.msg.date", { v: longDate({ y, m, d }) }),
        t("res.msg.time", { v: fmtTime(Number(f("hora").value)).replace(/ /g, " ") }),
        t("res.msg.people", { v: f("personas").selectedOptions[0].textContent }),
        t("res.msg.area", { v: areaLabel() })];
      if (occ.value) lines.push(t("res.msg.occasion", { v: occ.selectedOptions[0].textContent }));
      lines.push(t("res.msg.name", { v: f("nombre").value.trim() }));
      if (f("nota").value.trim()) lines.push(t("res.msg.notes", { v: f("nota").value.trim() }));
      lines.push("", t("res.msg.bye"));
      openWhatsApp(lines.join("\n"));
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("p").textContent = t("res.sent");
      sent.querySelector("button")?.focus();
    });
    window.Sitio.openReserve = open;
  }

  /* ------------------------------------------------------- Cotización (eventos) */
  function wireQuote() {
    const form = document.querySelector("[data-quote]");
    if (!form) return;
    const f = (name) => form.elements[name];
    const sent = document.querySelector("[data-quote-sent]");
    const now = nowSD();
    f("q-fecha").min = isoOf(addDays(now, 1));
    f("q-fecha").max = isoOf(addDays(now, 365));
    const setError = (input, msg) => {
      const err = document.getElementById(input.id + "-err");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let first = null;
      const bad = (input, msg) => { setError(input, msg); if (msg && !first) first = input; };
      const guests = Number(f("q-invitados").value);
      bad(f("q-nombre"), f("q-nombre").value.trim().length < 2 ? t("q.err.name") : "");
      bad(f("q-fecha"), !f("q-fecha").value || f("q-fecha").value < f("q-fecha").min ? t("q.err.date") : "");
      bad(f("q-invitados"), !guests || guests < 6 ? t("q.err.guests") : "");
      if (first) { first.focus(); return; }
      const [y, m, d] = f("q-fecha").value.split("-").map(Number);
      const label = (name) => {
        const el = form.querySelector(`[name="${name}"]:checked`);
        if (!el) return "";
        const lbl = el.closest("label");
        const sub = lbl.querySelector("span");
        return lbl.querySelector("strong").textContent.trim() + (sub ? ` (${sub.textContent.trim().toLowerCase()})` : "");
      };
      const food = [...form.querySelectorAll('[name="q-comida"]:checked')].map((c) => c.closest("label").textContent.trim());
      const lines = [t("q.msg.hello"), t("q.msg.intro"), "",
        t("q.msg.type", { v: f("q-tipo").selectedOptions[0].textContent }),
        t("q.msg.where", { v: label("q-lugar") }),
        t("q.msg.date", { v: longDate({ y, m, d }) }),
        t("q.msg.time", { v: f("q-horario").selectedOptions[0].textContent }),
        t("q.msg.guests", { v: guests })];
      if (food.length) lines.push(t("q.msg.food", { v: food.join(", ") }));
      if (f("q-presupuesto").value) lines.push(t("q.msg.budget", { v: f("q-presupuesto").selectedOptions[0].textContent }));
      lines.push(t("q.msg.name", { v: f("q-nombre").value.trim() }));
      if (f("q-notas").value.trim()) lines.push(t("q.msg.notes", { v: f("q-notas").value.trim() }));
      lines.push("", t("q.msg.bye"));
      openWhatsApp(lines.join("\n"));
      sent.hidden = false;
      sent.querySelector("p").textContent = t("q.sent");
      sent.focus();
    });
  }

  /* ------------------------------------------------------------- Carrusel */
  function renderFavorites() {
    const track = document.querySelector("[data-favorites]");
    if (!track || !window.MENU) return;
    track.innerHTML = window.MENU.items.filter((it) => it.fav).map((it) => `<li class="dish-card">
        <a href="menu.html#${it.id}" style="display:contents">
          <div class="dish-card__media">
            ${img(it.img, { sizes: "(min-width: 1280px) 290px, (min-width: 1024px) 390px, (min-width: 768px) 42vw, 78vw", alt: itemName(it) })}
            <span class="price-tag">${priceLabel(it)}</span>
          </div>
          <div class="dish-card__body">
            <h3 class="dish-card__name">${itemName(it)}</h3>
            <p class="dish-card__desc">${itemDesc(it)}</p>
            <span class="dish-card__more">${t("fav.more")}<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></span>
          </div>
        </a>
      </li>`).join("");
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
      if (bar) { bar.style.width = vis * 100 + "%"; bar.style.transform = `translateX(${r * (1 / vis - 1) * 100}%)`; }
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
    let startX = 0, startLeft = 0, down = false, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
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

  /* ---------------------------------------------------------- La balanza */
  const DONENESS = { jugoso: "#b4323a", punto: "#b5654e", cocido: "#6a4331" };
  const MAX_LB = 4;
  function peopleFor(w) {
    if (w <= 1) return t("bal.people1");
    if (w <= 1.5) return t("bal.people12");
    if (w <= 2.25) return t("bal.people2");
    if (w <= 3) return t("bal.people23");
    return t("bal.people34");
  }
  const fmtLb = (w) => String(w); // formato dominicano: punto decimal (2.5 lb), coma de miles

  function dialSVG() {
    const cx = 200, cy = 210, r = 172;
    const pt = (deg, rad) => [cx + rad * Math.cos((deg * Math.PI) / 180), cy + rad * Math.sin((deg * Math.PI) / 180)];
    let ticks = "";
    for (let i = 0; i <= MAX_LB * 4; i++) {
      const w = i / 4;
      const deg = 180 + (w / MAX_LB) * 180;
      const major = i % 4 === 0;
      const half = i % 2 === 0;
      const [x1, y1] = pt(deg, r - 12);
      const [x2, y2] = pt(deg, r - (major ? 34 : half ? 26 : 20));
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#1d1714" stroke-width="${major ? 3 : 1.5}" stroke-linecap="round"/>`;
      if (major) {
        const [lx, ly] = pt(deg, r - 54);
        const lift = w === 0 || w === MAX_LB ? 18 : 0; // el 0 y el 4 no se esconden tras la base
        ticks += `<text x="${lx.toFixed(1)}" y="${(ly + 7 - lift).toFixed(1)}" text-anchor="middle" font-family="Rokkitt, Georgia, serif" font-weight="800" font-size="22" fill="#1d1714">${w}</text>`;
      }
    }
    const [ax, ay] = pt(180, r + 2);
    const [bx, by] = pt(360, r + 2);
    return `<svg viewBox="0 0 400 236" aria-hidden="true">
      <path d="M${ax} ${ay} A${r + 2} ${r + 2} 0 0 1 ${bx} ${by}" fill="#fff" stroke="#1d1714" stroke-width="10"/>
      <path d="M${cx - r - 22} ${cy} H${cx + r + 22}" stroke="#1d1714" stroke-width="10" stroke-linecap="round"/>
      <path class="balanza__zone" d="" fill="none" stroke="#f08a4b" stroke-width="10" stroke-linecap="round" opacity=".55"/>
      ${ticks}
      <g class="balanza__needle" style="transform-origin:${cx}px ${cy}px">
        <path d="M${cx - 5} ${cy} L${cx} ${cy - r + 26} L${cx + 5} ${cy} Z" fill="#b9471a"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="12" fill="#1d1714"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#efe6d6"/>
    </svg>`;
  }

  function wireBalanza() {
    const host = document.querySelector("[data-balanza]");
    if (!host || !window.MENU) return;
    const cuts = window.MENU.items.filter((it) => it.cut);
    const picker = host.querySelector("[data-cuts]");
    const dial = host.querySelector("[data-dial]");
    const out = host.querySelector("[data-weight]");
    const minus = host.querySelector("[data-minus]");
    const plus = host.querySelector("[data-plus]");
    const priceEl = host.querySelector("[data-bal-price]");
    const subEl = host.querySelector("[data-bal-sub]");
    const bill = host.querySelector("[data-bal-bill]");
    const live = host.querySelector("[data-bal-live]");
    const reserveBtn = host.querySelector("[data-bal-reserve]");
    const pickupBtn = host.querySelector("[data-bal-pickup]");
    dial.insertAdjacentHTML("afterbegin", dialSVG());
    const needle = dial.querySelector(".balanza__needle");
    const zone = dial.querySelector(".balanza__zone");

    const first = cuts.find((c) => c.id === params.get("corte")) || cuts[0];
    const state = { cut: first, w: first.id === "tomahawk" ? 2 : 1 };

    picker.innerHTML = cuts.map((c) => `<li><button type="button" data-cut="${c.id}" aria-pressed="false">${itemName(c)}<small>${fmtPrice(c.price)}/lb</small></button></li>`).join("");

    function doneKey() { const r = host.querySelector('input[name="punto"]:checked'); return r ? r.value : "punto"; }

    function render() {
      const { cut, w } = state;
      const sub = cut.price * w;
      const total = sub * (1 + C.taxes.itbis + C.taxes.service);
      picker.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cut === cut.id ? "true" : "false"));
      out.innerHTML = `${fmtLb(w)} <small>${t("bal.lb")}</small>`;
      minus.disabled = w <= 0.5;
      plus.disabled = w >= MAX_LB;
      const deg = -90 + (w / MAX_LB) * 180;
      needle.style.transform = `rotate(${deg}deg)`;
      // arco de la porción
      const cx = 200, cy = 210, r = 174;
      const a = (180 * Math.PI) / 180, b = ((180 + (w / MAX_LB) * 180) * Math.PI) / 180;
      zone.setAttribute("d", `M${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} A${r} ${r} 0 0 1 ${(cx + r * Math.cos(b)).toFixed(1)} ${(cy + r * Math.sin(b)).toFixed(1)}`);
      zone.setAttribute("stroke", DONENESS[doneKey()]);
      priceEl.textContent = fmtPrice(sub);
      subEl.textContent = peopleFor(w);
      bill.innerHTML = `<dl>
        <dt>${itemName(cut)} · ${fmtLb(w)} lb × ${fmtPrice(cut.price)}</dt><dd>${fmtPrice(sub)}</dd>
        <dt>ITBIS 18 %</dt><dd>${fmtPrice(sub * C.taxes.itbis)}</dd>
        <dt>${lang === "en" ? "Service 10%" : "Servicio 10 %"}</dt><dd>${fmtPrice(sub * C.taxes.service)}</dd>
        <dt class="total">${lang === "en" ? "Estimated total" : "Total estimado"}</dt><dd class="total">${fmtPrice(total)}</dd>
      </dl>`;
      const done = t("done." + doneKey());
      live.textContent = t("bal.live", { cut: itemName(cut), w: fmtLb(w), done, price: fmtPrice(sub), total: fmtPrice(total) });
      dial.setAttribute("aria-label", t("bal.aria", { w: fmtLb(w) }));
      reserveBtn.dataset.note = t("bal.reserveNote", { cut: itemName(cut), w: fmtLb(w), done });
    }

    picker.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cut]");
      if (!b) return;
      state.cut = cuts.find((c) => c.id === b.dataset.cut);
      render();
    });
    minus.addEventListener("click", () => { state.w = Math.max(0.5, state.w - 0.25); render(); });
    plus.addEventListener("click", () => { state.w = Math.min(MAX_LB, state.w + 0.25); render(); });
    host.addEventListener("change", (e) => { if (e.target.name === "punto") render(); });
    pickupBtn.addEventListener("click", () => {
      const { cut, w } = state;
      openWhatsApp(t("bal.pickupMsg", { cut: itemName(cut), w: fmtLb(w), done: t("done." + doneKey()), price: fmtPrice(cut.price * w) }));
    });
    render();
  }

  /* ------------------------------------------------------- Cierre dinámico */
  function renderClosing() {
    const el = document.querySelector("[data-closing-title]");
    if (!el) return;
    const { offset, n } = nextBookable(nowSD());
    if (offset === 0) el.textContent = t("closing.tonight");
    else if (offset === 1) el.textContent = t("closing.tomorrow");
    else el.textContent = t("closing.day", { day: dayName(dowOf(n.y, n.m, n.d)) });
  }

  /* ---------------------------------------------------------------- Mapa */
  function wireMap() {
    document.querySelectorAll("[data-map-load]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const box = btn.closest(".map");
        const iframe = document.createElement("iframe");
        iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent("Paladart, Juan Dolio")}&ll=${C.geo.lat},${C.geo.lng}&z=17&hl=${lang}&output=embed`;
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
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* -------------------------------------------------------------- Inicio */
  window.Sitio = { t, lang, LOCALE, nowSD, statusAt, statusText, fmtPrice, fmtTime, img, itemName, itemDesc, minPrice, priceLabel, openDialog, applyI18n, ready: false };

  function init() {
    applyI18n();
    wireLang();
    renderStatus();
    renderHours();
    renderFavorites();
    document.querySelectorAll("[data-carousel]").forEach(wireCarousel);
    renderClosing();
    wireDialogs();
    wireReservation();
    wireBalanza();
    wireQuote();
    wireScroll();
    wireMap();
    wireReveal();
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = nowSD().y));
    root.classList.remove("i18n-pending");
    setInterval(renderStatus, 60 * 1000);
    window.Sitio.ready = true;
    document.dispatchEvent(new Event("sitio:ready"));
  }

  const dictScript = document.querySelector("script[data-i18n-src]");
  if (lang !== "es" && !dict() && dictScript) {
    dictScript.addEventListener("load", init, { once: true });
    dictScript.addEventListener("error", init, { once: true });
  } else {
    init();
  }
})();
