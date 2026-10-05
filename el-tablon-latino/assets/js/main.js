/* =====================================================================
   El Tablón Latino · comportamiento general
   Idioma (ES/EN), estado abierto/cerrado, navegación, barra móvil,
   reservas por WhatsApp, «Arma tu tablón», carrusel, galería y mapa.
   Los datos (horario, teléfono, WhatsApp) salen de config.js.
   ===================================================================== */
(() => {
  "use strict";

  const S = window.SITIO;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const raiz = document.documentElement;
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const comportamiento = sinMovimiento ? "auto" : "smooth";

  /* ------------------------------------------------------------ idioma */
  let LANG = raiz.lang === "en" ? "en" : "es";
  let EN = {};
  const norm = (s) => String(s).replace(/\s+/g, " ").trim();
  const t = (es) => (LANG === "en" && EN[norm(es)]) || es;

  function aplicarIdioma() {
    if (LANG !== "en") return;
    $$("[data-i18n]").forEach((el) => {
      if (el.dataset.i18n === "html") {
        const v = EN[norm(el.innerHTML)];
        if (v) el.innerHTML = v;
      } else {
        const v = EN[norm(el.textContent)];
        if (v) el.textContent = v;
      }
    });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(",").forEach((a) => {
        a = a.trim();
        const v = EN[norm(el.getAttribute(a) || "")];
        if (v) el.setAttribute(a, v);
      });
    });
    $$("[data-en]").forEach((el) => {
      if (el.dataset.en) el.textContent = el.dataset.en;
    });
    $$("[data-cierre-finde]").forEach((el) => { el.textContent = textoCierreFinde(); });
    $$(".horario__tabla tr").forEach((tr) => { const th = tr.querySelector("th"); if (th) th.dataset.hoy = "Today"; });
    document.title = EN[norm(document.title)] || document.title;
  }

  function prepararSelectorIdioma() {
    $$("[data-idioma]").forEach((a) => {
      const destino = LANG === "en" ? "es" : "en";
      a.href = "?lang=" + destino;
      a.hreflang = destino;
      a.lang = destino;
      a.textContent = a.classList.contains("idioma--hoja") ? (destino === "en" ? "English" : "Español") : destino.toUpperCase();
      a.setAttribute("aria-label", destino === "en" ? "Read in English" : "Ver en español");
    });
  }

  function cargarIdioma(listo) {
    prepararSelectorIdioma();
    if (LANG !== "en") return listo();
    const src = document.currentScript?.dataset.i18nSrc || $("script[data-i18n-src]")?.dataset.i18nSrc;
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => { EN = window.I18N_EN || {}; aplicarIdioma(); raiz.classList.remove("i18n-cargando"); listo(); };
    s.onerror = () => { raiz.classList.remove("i18n-cargando"); listo(); };
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------ horas */
  const aMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const aHorario = (lista) => lista.map((d) => (d ? { abre: aMin(d.abre), cierra: aMin(d.cierra) } : null));
  const HORARIO_SITIO = aHorario(S.horario);
  const HORARIO = HORARIO_SITIO;
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const DIAS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const MESES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /** Fecha y hora actuales en Santo Domingo, sin importar la hora del teléfono. */
  function ahoraSD(fecha = new Date()) {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: S.zonaHoraria, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(fecha);
    const p = (tipo) => partes.find((x) => x.type === tipo).value;
    const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const hora = Number(p("hour")) % 24;
    return { dia: dias[p("weekday")], min: hora * 60 + Number(p("minute")), y: Number(p("year")), m: Number(p("month")), d: Number(p("day")) };
  }

  /** 7:00 a. m. · 9:30 p. m. · medianoche (o 7:00 AM en inglés) */
  function fmtHora(min) {
    if (min % 1440 === 0) return LANG === "en" ? "midnight" : "medianoche";
    const m = ((min % 1440) + 1440) % 1440;
    const h24 = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, "0");
    const h12 = h24 % 12 || 12;
    if (LANG === "en") return `${h12}:${mm} ${h24 < 12 ? "AM" : "PM"}`;
    return `${h12}:${mm} ${h24 < 12 ? "a. m." : "p. m."}`;
  }
  /** «la 1:00» / «las 2:00» / «la medianoche» */
  const art = (min) => (min % 1440 === 0 || Math.floor((min % 1440) / 60) % 12 === 1 ? "la" : "las");
  const conArt = (min) => (LANG === "en" ? fmtHora(min) : `${art(min)} ${fmtHora(min)}`);

  /** Estado del restaurante para una fecha dada (por defecto, ahora). */
  function calcularEstado(fecha = new Date(), HORARIO = HORARIO_SITIO) {
    const { dia, min } = ahoraSD(fecha);
    const ayer = HORARIO[(dia + 6) % 7];
    let cierre = null;
    if (ayer && ayer.cierra > 1440 && min < ayer.cierra - 1440) cierre = ayer.cierra - 1440;
    const hoy = HORARIO[dia];
    if (cierre === null && hoy && min >= hoy.abre && min < hoy.cierra) cierre = hoy.cierra;
    if (cierre !== null) {
      const resta = cierre - min;
      if (resta <= 30) {
        return { tipo: "pronto", corto: LANG === "en" ? "Closing soon" : "Cierra pronto", texto: LANG === "en" ? `Closing soon · at ${fmtHora(cierre)}` : `Cierra pronto · a ${conArt(cierre)}` };
      }
      return { tipo: "abierto", corto: LANG === "en" ? "Open now" : "Abierto ahora", texto: LANG === "en" ? `Open now · until ${fmtHora(cierre)}` : `Abierto ahora · hasta ${conArt(cierre)}` };
    }
    if (hoy && min < hoy.abre) {
      return { tipo: "cerrado", corto: LANG === "en" ? `Opens ${fmtHora(hoy.abre)}` : `Abre ${fmtHora(hoy.abre)}`, texto: LANG === "en" ? `Opens today at ${fmtHora(hoy.abre)}` : `Abre hoy a ${conArt(hoy.abre)}` };
    }
    for (let k = 1; k <= 7; k++) {
      const d = (dia + k) % 7;
      if (HORARIO[d]) {
        const cuando = k === 1 ? (LANG === "en" ? "tomorrow" : "mañana") : (LANG === "en" ? DIAS_EN[d] : "el " + DIAS[d]);
        return { tipo: "cerrado", corto: LANG === "en" ? "Closed now" : "Cerrado ahora", texto: LANG === "en" ? `Opens ${cuando} at ${fmtHora(HORARIO[d].abre)}` : `Abre ${cuando} a ${conArt(HORARIO[d].abre)}` };
      }
    }
    return { tipo: "cerrado", corto: t("Cerrado"), texto: t("Cerrado") };
  }
  // Para probar: tablonEstado(new Date("2026-10-09T23:45:00-04:00")), con un horario opcional (formato de config.js)
  window.tablonEstado = (fecha, horario) => calcularEstado(fecha, horario ? aHorario(horario) : HORARIO_SITIO);

  function textoCierreFinde() {
    const tarde = HORARIO.filter(Boolean).reduce((a, b) => (b.cierra > a.cierra ? b : a));
    if (tarde.cierra <= 1440) return "";
    const dias = HORARIO.map((h, i) => (h && h.cierra === tarde.cierra ? i : -1)).filter((i) => i >= 0);
    const nombres = dias.map((d) => (LANG === "en" ? DIAS_EN[d] : DIAS[d]));
    const lista = nombres.length > 1 ? nombres.slice(0, -1).join(", ") + (LANG === "en" ? " and " : " y ") + nombres.at(-1) : nombres[0];
    const cap = lista.charAt(0).toUpperCase() + lista.slice(1);
    const txt = LANG === "en" ? `${cap}, until ${fmtHora(tarde.cierra)}` : `${cap}, hasta ${conArt(tarde.cierra)}`;
    return txt.endsWith(".") ? txt : txt + ".";
  }

  function pintarEstado() {
    const e = calcularEstado();
    $$("[data-estado]").forEach((el) => {
      el.dataset.tipo = e.tipo;
      const txt = el.querySelector("[data-estado-texto]");
      if (txt) txt.textContent = e.texto;
      const corto = el.querySelector("[data-estado-corto]");
      if (corto) corto.textContent = e.corto;
    });
    const { dia } = ahoraSD();
    $$(".horario__tabla tr").forEach((tr) => {
      const esHoy = Number(tr.dataset.dia) === dia;
      tr.classList.toggle("es-hoy", esHoy);
      const th = tr.querySelector("th");
      if (th) th.dataset.hoy = LANG === "en" ? "Today" : "Hoy";
      if (esHoy) tr.setAttribute("aria-current", "date"); else tr.removeAttribute("aria-current");
    });
  }

  /* ------------------------------------------------------------ utilidades */
  const precio = (n) => "RD$ " + Math.round(n).toLocaleString("en-US");
  let avisoTimer;
  function avisar(texto) {
    const el = $("[data-aviso]");
    if (!el) return;
    el.textContent = texto;
    el.classList.add("visible");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => el.classList.remove("visible"), 2400);
  }
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } };
  const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const abrirWhatsApp = (texto) => {
    const url = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(texto)}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
    return url;
  };
  window.tablonUltimoWhatsApp = null;

  /* ------------------------------------------------------------ diálogos */
  function abrirDialogo(dlg) {
    if (!dlg || dlg.open) return;
    dlg.showModal();
    document.body.classList.add("con-dialogo");
  }
  function prepararDialogos() {
    $$("dialog").forEach((dlg) => {
      dlg.addEventListener("close", () => {
        if (!$$("dialog").some((d) => d.open)) document.body.classList.remove("con-dialogo");
      });
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg && !dlg.classList.contains("visor")) dlg.close();
        if (e.target.closest("[data-cerrar]")) dlg.close();
      });
    });
  }

  /* ------------------------------------------------------------ navegación móvil */
  function prepararNav() {
    const hoja = $("#hoja-nav");
    const boton = $("[data-abrir-nav]");
    if (!hoja || !boton) return;
    boton.addEventListener("click", () => { abrirDialogo(hoja); boton.setAttribute("aria-expanded", "true"); });
    hoja.addEventListener("close", () => { boton.setAttribute("aria-expanded", "false"); });
    $$("a", hoja).forEach((a) => a.addEventListener("click", () => hoja.close()));
    matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches && hoja.open) hoja.close(); });
  }

  /* ------------------------------------------------------------ barra inferior */
  function prepararBarra() {
    const barra = $("[data-barra]");
    if (!barra) return;
    let ultimo = scrollY;
    let pendiente = false;
    const revisar = () => {
      const y = scrollY;
      const alFinal = innerHeight + y >= document.documentElement.scrollHeight - 40;
      if (alFinal || y < 120 || y < ultimo - 6) barra.classList.remove("oculta");
      else if (y > ultimo + 6) barra.classList.add("oculta");
      ultimo = y;
      pendiente = false;
    };
    addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(revisar); } }, { passive: true });
  }

  /* ------------------------------------------------------------ el tablón */
  const Tablon = (() => {
    const CLAVE = "tablon-v1";
    const guardado = leer(CLAVE);
    const estado = guardado && typeof guardado === "object" && guardado.items ? guardado : { items: {}, personas: 4 };
    const oyentes = [];
    const avisar = () => { guardar(CLAVE, estado); oyentes.forEach((fn) => fn(estado)); };
    return {
      estado,
      lista: () => Object.values(estado.items).filter((x) => x.cant > 0),
      cuenta: () => Object.values(estado.items).reduce((a, x) => a + x.cant, 0),
      total: () => Object.values(estado.items).reduce((a, x) => a + x.cant * x.precio, 0),
      agregar(d) {
        const it = estado.items[d.id] || { id: d.id, nombre: d.nombre, en: d.en || d.nombre, precio: Number(d.precio) || 0, foto: d.foto || "", cant: 0, orden: Date.now() };
        it.cant = Math.min(it.cant + 1, 20);
        estado.items[d.id] = it;
        avisar();
      },
      poner(id, cant) {
        if (!estado.items[id]) return;
        if (cant <= 0) delete estado.items[id]; else estado.items[id].cant = Math.min(cant, 20);
        avisar();
      },
      personas(n) { estado.personas = Math.max(1, Math.min(20, n || 1)); avisar(); },
      vaciar() { estado.items = {}; avisar(); },
      escuchar(fn) { oyentes.push(fn); fn(estado); },
    };
  })();
  window.Tablon = Tablon;

  const nombrePlato = (it) => (LANG === "en" ? it.en || it.nombre : it.nombre);
  const guiaPlatos = (p) => {
    const a = Math.max(2, Math.round(p * 0.75));
    const b = Math.max(a + 1, p);
    return LANG === "en" ? `For ${p} ${p === 1 ? "person" : "people"}, ${a} to ${b} plates to share.` : `Para ${p} ${p === 1 ? "persona" : "personas"}, de ${a} a ${b} platos para compartir.`;
  };
  const textoCuenta = (n) => (LANG === "en" ? `${n} ${n === 1 ? "plate" : "plates"}` : `${n} ${n === 1 ? "plato" : "platos"}`);
  /** Nombre corto para escribir dentro del plato: «Mofongo», «Tacos birria», «Queso fundido». */
  const nombreCorto = (nombre) => {
    const conectores = ["de", "del", "con", "y", "al", "a", "la", "el", "with", "and", "&"];
    const out = [];
    for (const p of nombre.split(/\s+/)) {
      if (conectores.includes(p.toLowerCase())) continue;
      out.push(p);
      if (out.join(" ").length >= 6) break;
    }
    return out.join(" ");
  };
  const hashGiro = (id) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0; return ((Math.abs(h) % 15) - 7); };

  function posiciones(n) {
    const filas = n <= 4 ? 1 : 2;
    const porFila = Math.ceil(n / filas);
    const d = filas === 1 ? Math.min(30, 84 / Math.max(n, 2.6)) : Math.min(21, 86 / porFila);
    const pos = [];
    for (let i = 0; i < n; i++) {
      const fila = filas === 1 ? 0 : (i < porFila ? 0 : 1);
      const enFila = fila === 0 ? Math.min(porFila, n) : n - porFila;
      const k = fila === 0 ? i : i - porFila;
      const paso = 88 / enFila;
      let x = 6 + paso * (k + 0.5);
      if (filas === 2 && fila === 1 && enFila === porFila) x += paso * 0.22;
      if (filas === 2 && fila === 0) x -= paso * 0.12;
      const y = filas === 1 ? 50 : (fila === 0 ? 30 : 70);
      pos.push({ x, y, d });
    }
    return pos;
  }

  let ultimoAgregado = null;
  function pintarTabla() {
    const tabla = $("[data-tabla]");
    if (!tabla) return;
    const lista = Tablon.lista().sort((a, b) => a.orden - b.orden);
    const ul = $("[data-tabla-platos]", tabla);
    $("[data-tabla-vacia]", tabla).hidden = lista.length > 0;
    const max = 10;
    const visibles = lista.length > max ? lista.slice(0, max - 1) : lista;
    const resto = lista.length - visibles.length;
    const pos = posiciones(visibles.length + (resto ? 1 : 0));
    ul.innerHTML = "";
    visibles.forEach((it, i) => {
      const p = pos[i];
      const li = document.createElement("li");
      li.className = "plato-tabla" + (it.id === ultimoAgregado ? " nuevo" : "");
      li.style.cssText = `--x:${p.x}%;--y:${p.y}%;--d:${p.d}%;--r:${hashGiro(it.id)}deg;--dn:${p.d}`;
      const foto = it.foto ? `<img src="/propuestas/el-tablon-latino/assets/img/${it.foto}-480.webp" alt="" width="480" height="480" decoding="async">` : `<span class="plato-tabla__nombre"${Math.max(...nombreCorto(nombrePlato(it)).split(" ").map((w) => w.length)) > 7 ? " data-largo" : ""}>${nombreCorto(nombrePlato(it))}</span>`;
      const quitar = LANG === "en" ? `Remove one ${nombrePlato(it)}` : `Quitar uno: ${nombrePlato(it)}`;
      li.innerHTML = `<button class="plato-tabla__btn" type="button" data-quitar="${it.id}" aria-label="${quitar} (${it.cant})">${foto}</button>${it.cant > 1 ? `<span class="plato-tabla__cant" aria-hidden="true">${it.cant}</span>` : ""}`;
      ul.appendChild(li);
    });
    if (resto) {
      const p = pos[pos.length - 1];
      const li = document.createElement("li");
      li.className = "plato-tabla plato-tabla--mas";
      li.style.cssText = `--x:${p.x}%;--y:${p.y}%;--d:${p.d}%;--dn:${p.d}`;
      li.innerHTML = `<button class="plato-tabla__btn" type="button" data-abrir-tablon><span class="plato-tabla__nombre">+${resto}</span></button>`;
      ul.appendChild(li);
    }
    ultimoAgregado = null;
  }

  function pintarTablon() {
    const cuenta = Tablon.cuenta();
    const total = Tablon.total();
    const p = Tablon.estado.personas;
    $$("[data-tablon-personas]").forEach((i) => { if (Number(i.value) !== p) i.value = p; });
    $$("[data-tablon-guia]").forEach((el) => { el.textContent = guiaPlatos(p); });
    $$("[data-tablon-cuenta]").forEach((el) => { el.textContent = textoCuenta(cuenta); });
    $$("[data-tablon-total]").forEach((el) => { el.textContent = precio(total); });
    $$("[data-tablon-cuenta-corta]").forEach((el) => { el.textContent = textoCuenta(cuenta); });
    $$("[data-tablon-total-corto]").forEach((el) => { el.textContent = precio(total); });
    $$("[data-reservar-con-tablon], [data-vaciar-tablon], [data-pedir-tablon]").forEach((b) => { b.disabled = cuenta === 0; });
    $$("[data-abrir-tablon].tablon-flotante").forEach((b) => { b.hidden = cuenta === 0; });
    $$("[data-cant-de]").forEach((el) => {
      const it = Tablon.estado.items[el.dataset.cantDe];
      el.textContent = it ? "×" + it.cant : "";
      el.closest(".opcion")?.classList.toggle("tiene", Boolean(it));
    });
    $$("[data-agregar]:not(.opcion)").forEach((b) => b.classList.toggle("agregado", Boolean(Tablon.estado.items[b.dataset.agregar])));
    pintarTabla();
    pintarListaTablon();
  }

  function pintarListaTablon() {
    const cont = $("[data-tablon-lista]");
    if (!cont) return;
    const lista = Tablon.lista().sort((a, b) => a.orden - b.orden);
    if (!lista.length) {
      cont.innerHTML = `<p class="tablon-lista__vacia">${t("Tu tablón está vacío. Toca + en lo que quieras compartir.")}</p>`;
      return;
    }
    const menos = LANG === "en" ? "One less" : "Uno menos";
    const mas = LANG === "en" ? "One more" : "Uno más";
    cont.innerHTML = lista.map((it) => `
      <div class="tablon-fila">
        <span class="tablon-fila__nombre">${nombrePlato(it)}</span>
        <span class="tablon-fila__precio">${precio(it.precio)} × ${it.cant} = ${precio(it.precio * it.cant)}</span>
        <div class="contador contador--chico">
          <button type="button" class="contador__btn" data-fila-menos="${it.id}" aria-label="${menos}: ${nombrePlato(it)}"><svg class="icono" aria-hidden="true"><use href="#i-menos"/></svg></button>
          <input type="number" value="${it.cant}" min="0" max="20" aria-label="${nombrePlato(it)}" data-fila-cant="${it.id}" inputmode="numeric">
          <button type="button" class="contador__btn" data-fila-mas="${it.id}" aria-label="${mas}: ${nombrePlato(it)}"><svg class="icono" aria-hidden="true"><use href="#i-mas"/></svg></button>
        </div>
      </div>`).join("");
  }

  function resumenTablon() {
    const lista = Tablon.lista().sort((a, b) => a.orden - b.orden);
    return lista.map((it) => `- ${it.cant} × ${nombrePlato(it)}`).join("\n");
  }

  function prepararTablon() {
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-agregar]");
      if (add) {
        const d = add.dataset;
        ultimoAgregado = Tablon.estado.items[d.agregar] ? null : d.agregar;
        Tablon.agregar({ id: d.agregar, nombre: d.nombre, en: d.nombreEn, precio: d.precio, foto: d.foto });
        const nombre = LANG === "en" ? d.nombreEn : d.nombre;
        avisar(LANG === "en" ? `${nombre} added to your board` : `${nombre} va al tablón`);
        const flot = $(".tablon-flotante");
        if (flot && !sinMovimiento) { flot.classList.remove("salta"); void flot.offsetWidth; flot.classList.add("salta"); }
        return;
      }
      const quitar = e.target.closest("[data-quitar]");
      if (quitar) {
        const it = Tablon.estado.items[quitar.dataset.quitar];
        if (it) Tablon.poner(it.id, it.cant - 1);
        return;
      }
      const menos = e.target.closest("[data-fila-menos]");
      if (menos) { const it = Tablon.estado.items[menos.dataset.filaMenos]; if (it) Tablon.poner(it.id, it.cant - 1); return; }
      const mas = e.target.closest("[data-fila-mas]");
      if (mas) { const it = Tablon.estado.items[mas.dataset.filaMas]; if (it) Tablon.poner(it.id, it.cant + 1); return; }
      if (e.target.closest("[data-abrir-tablon]")) { abrirDialogo($("#dialogo-tablon")); return; }
      if (e.target.closest("[data-vaciar-tablon]")) { Tablon.vaciar(); avisar(t("Tablón vacío")); return; }
      if (e.target.closest("[data-reservar-con-tablon]")) {
        $("#dialogo-tablon")?.close();
        abrirReserva(true);
        return;
      }
      if (e.target.closest("[data-pedir-tablon]")) {
        const nl = "\n";
        const txt = LANG === "en"
          ? `Hello, El Tablón Latino. I'd like to order for pickup:${nl}${nl}${resumenTablon()}${nl}${nl}Approximate total: ${precio(Tablon.total())}${nl}${nl}When can I pick it up? Thank you!`
          : `Hola, El Tablón Latino. Quisiera pedir para recoger:${nl}${nl}${resumenTablon()}${nl}${nl}Total aproximado: ${precio(Tablon.total())}${nl}${nl}¿A qué hora puedo pasar a buscarlo? ¡Gracias!`;
        window.tablonUltimoWhatsApp = abrirWhatsApp(txt);
      }
    });
    document.addEventListener("change", (e) => {
      const fila = e.target.closest("[data-fila-cant]");
      if (fila) Tablon.poner(fila.dataset.filaCant, parseInt(fila.value, 10) || 0);
      const per = e.target.closest("[data-tablon-personas]");
      if (per) Tablon.personas(parseInt(per.value, 10));
    });
    Tablon.escuchar(pintarTablon);
  }

  /* contadores (− / +) */
  function prepararContadores() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-contador] [data-menos], [data-contador] [data-mas]");
      if (!btn) return;
      const input = btn.closest("[data-contador]").querySelector("input");
      const min = Number(input.min || 1), max = Number(input.max || 20);
      const v = Math.max(min, Math.min(max, (parseInt(input.value, 10) || min) + (btn.hasAttribute("data-mas") ? 1 : -1)));
      input.value = v;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  /* ------------------------------------------------------------ reservas */
  const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const sumarDias = (s, n) => { const [y, m, d] = s.split("-").map(Number); const f = new Date(Date.UTC(y, m - 1, d + n)); return iso(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate()); };
  const diaSemana = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  const hoySD = () => { const a = ahoraSD(); return iso(a.y, a.m, a.d); };
  function fechaLarga(s) {
    const [y, m, d] = s.split("-").map(Number);
    const ds = diaSemana(s);
    return LANG === "en" ? `${DIAS_EN[ds]}, ${MESES_EN[m - 1]} ${d}` : `${DIAS[ds]} ${d} de ${MESES[m - 1]}`;
  }

  /** Horas válidas para reservar ese día (cada 30 min, hasta 1 h antes del cierre). */
  function horasDelDia(fecha) {
    const h = HORARIO[diaSemana(fecha)];
    if (!h) return [];
    const r = S.reservas;
    const ult = h.cierra - r.minutosAntesDelCierre;
    let desde = h.abre;
    if (fecha === hoySD()) {
      const ahora = ahoraSD().min + 30;
      desde = Math.max(desde, Math.ceil(ahora / r.intervalo) * r.intervalo);
    }
    const lista = [];
    for (let m = desde; m <= ult; m += r.intervalo) lista.push(m);
    return lista;
  }

  function rellenarHoras(form) {
    const sel = form.elements.hora;
    const fecha = form.elements.fecha.value;
    const anterior = sel.value;
    const horas = fecha ? horasDelDia(fecha) : [];
    const ayuda = $("[data-hora-ayuda]", form);
    sel.innerHTML = "";
    if (!horas.length) {
      sel.innerHTML = `<option value="">${t("Sin horarios ese día")}</option>`;
      ayuda.textContent = fecha === hoySD() ? t("Por hoy ya no tomamos reservas. Prueba con mañana.") : "";
      return;
    }
    const madrugada = LANG === "en" ? " (after midnight)" : " (madrugada)";
    const etiqueta = (m) => (m === 1440 ? (LANG === "en" ? "Midnight" : "Medianoche") : fmtHora(m) + (m > 1440 ? madrugada : ""));
    sel.innerHTML = `<option value="">${t("Escoge una hora")}</option>` + horas.map((m) => `<option value="${m}">${etiqueta(m)}</option>`).join("");
    if (horas.includes(Number(anterior))) sel.value = anterior;
    const h = HORARIO[diaSemana(fecha)];
    ayuda.textContent = LANG === "en" ? `That day: ${fmtHora(h.abre)} – ${fmtHora(h.cierra)}` : `Ese día: ${fmtHora(h.abre)} – ${fmtHora(h.cierra)}`;
  }

  function error(form, campo, texto) {
    const el = form.elements[campo];
    const caja = el.closest(".campo");
    const p = $(`#${el.id}-error`);
    caja?.classList.toggle("con-error", Boolean(texto));
    if (texto) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    if (p) p.textContent = texto || "";
    return !texto;
  }

  function abrirReserva(conTablon = false) {
    const dlg = $("#dialogo-reserva");
    const form = $("[data-form-reserva]");
    if (!dlg || !form) return;
    const hoy = hoySD();
    const f = form.elements.fecha;
    f.min = hoy;
    f.max = sumarDias(hoy, S.reservas.diasAdelante);
    if (!f.value || f.value < hoy) f.value = horasDelDia(hoy).length ? hoy : sumarDias(hoy, 1);
    form.elements.personas.max = S.reservas.maxPersonas;
    if (conTablon || Tablon.cuenta()) form.elements.personas.value = Tablon.estado.personas;
    rellenarHoras(form);
    const incluir = $("[data-incluir-tablon]", form);
    const cuenta = Tablon.cuenta();
    incluir.hidden = cuenta === 0;
    if (cuenta) {
      $("[data-tablon-resumen]", form).textContent = `(${textoCuenta(cuenta)} · ${precio(Tablon.total())})`;
      form.elements.tablon.checked = true;
    }
    ["fecha", "hora", "nombre"].forEach((c) => error(form, c, ""));
    abrirDialogo(dlg);
  }

  function prepararReservas() {
    const form = $("[data-form-reserva]");
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-abrir-reserva]")) { e.preventDefault(); $("#hoja-nav")?.close(); abrirReserva(); }
    });
    if (!form) return;
    form.elements.fecha.addEventListener("change", () => { rellenarHoras(form); error(form, "fecha", ""); });
    form.elements.hora.addEventListener("change", () => error(form, "hora", ""));
    form.elements.nombre.addEventListener("input", () => error(form, "nombre", ""));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const el = form.elements;
      const hoy = hoySD();
      let ok = true;
      if (!el.fecha.value) ok = error(form, "fecha", t("Elige la fecha.")) && ok;
      else if (el.fecha.value < hoy) ok = error(form, "fecha", t("Esa fecha ya pasó. Elige hoy o un día próximo.")) && ok;
      else if (el.fecha.value > el.fecha.max) ok = error(form, "fecha", t("Reservamos hasta con 60 días de anticipación.")) && ok;
      if (!el.hora.value) ok = error(form, "hora", t("Escoge una hora.")) && ok;
      if (el.nombre.value.trim().length < 2) ok = error(form, "nombre", t("Escribe tu nombre para la reserva.")) && ok;
      const personas = Math.max(1, Math.min(S.reservas.maxPersonas, parseInt(el.personas.value, 10) || 1));
      if (!ok) { form.querySelector("[aria-invalid='true']")?.focus(); return; }
      const nl = "\n";
      const hora = Number(el.hora.value);
      // Después de medianoche ya es el día siguiente: lo aclaramos en el mensaje
      const sig = sumarDias(el.fecha.value, 1);
      const [, , diaSig] = sig.split("-").map(Number);
      const horaTxt = hora >= 1440
        ? (LANG === "en" ? `${fmtHora(hora)} (early ${DIAS_EN[diaSemana(sig)]} ${diaSig})` : `${fmtHora(hora)} (madrugada del ${DIAS[diaSemana(sig)]} ${diaSig})`)
        : fmtHora(hora);
      const area = el.area.value;
      const ocasion = el.ocasion.value;
      const notas = el.notas.value.trim();
      const incluir = !$("[data-incluir-tablon]", form).hidden && el.tablon.checked;
      let txt;
      if (LANG === "en") {
        txt = `Hello, El Tablón Latino! I'd like to book a table:${nl}${nl}` +
          `*Date:* ${fechaLarga(el.fecha.value)}${nl}*Time:* ${horaTxt}${nl}*Guests:* ${personas}${nl}` +
          `*Area:* ${t(area)}${nl}` + (ocasion ? `*Occasion:* ${t(ocasion)}${nl}` : "") +
          `*Name:* ${el.nombre.value.trim()}${nl}` + (notas ? `*Notes:* ${notas}${nl}` : "") +
          (incluir ? `${nl}To share (board for ${Tablon.estado.personas}):${nl}${resumenTablon()}${nl}Approximate total: ${precio(Tablon.total())}${nl}` : "") +
          `${nl}Thank you!`;
      } else {
        txt = `Hola, El Tablón Latino. Quisiera reservar una mesa:${nl}${nl}` +
          `*Fecha:* ${fechaLarga(el.fecha.value)}${nl}*Hora:* ${horaTxt}${nl}*Personas:* ${personas}${nl}` +
          `*Área:* ${area}${nl}` + (ocasion ? `*Ocasión:* ${ocasion}${nl}` : "") +
          `*A nombre de:* ${el.nombre.value.trim()}${nl}` + (notas ? `*Notas:* ${notas}${nl}` : "") +
          (incluir ? `${nl}Para compartir (tablón para ${Tablon.estado.personas}):${nl}${resumenTablon()}${nl}Total aproximado: ${precio(Tablon.total())}${nl}` : "") +
          `${nl}¡Gracias!`;
      }
      window.tablonUltimoWhatsApp = abrirWhatsApp(txt);
      $("#dialogo-reserva").close();
      avisar(t("Abrimos WhatsApp con tu reserva"));
    });
  }

  /* ------------------------------------------------------------ cotización de eventos */
  function prepararEventos() {
    const form = $("[data-form-evento]");
    if (!form) return;
    const hoy = hoySD();
    form.elements.fecha.min = hoy;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const el = form.elements;
      let ok = true;
      if (!el.fecha.value) ok = error(form, "fecha", t("Elige la fecha.")) && ok;
      else if (el.fecha.value < hoy) ok = error(form, "fecha", t("Esa fecha ya pasó. Elige hoy o un día próximo.")) && ok;
      else error(form, "fecha", "");
      const p = parseInt(el.personas.value, 10);
      if (!p || p < 2) ok = error(form, "personas", t("Indica cuántas personas, mínimo 2.")) && ok;
      else error(form, "personas", "");
      if (el.nombre.value.trim().length < 2) ok = error(form, "nombre", t("Escribe tu nombre.")) && ok;
      else error(form, "nombre", "");
      if (!ok) { form.querySelector("[aria-invalid='true']")?.focus(); return; }
      const nl = "\n";
      const det = el.detalles.value.trim();
      const txt = LANG === "en"
        ? `Hello, El Tablón Latino! I'd like a quote for an event:${nl}${nl}*Event:* ${t(el.tipo.value)}${nl}*Date:* ${fechaLarga(el.fecha.value)}${nl}*Guests:* ${p}${nl}*When:* ${t(el.momento.value)}${nl}*Space:* ${t(el.espacio.value)}${nl}*Name:* ${el.nombre.value.trim()}${nl}` + (det ? `*Details:* ${det}${nl}` : "") + `${nl}Thank you!`
        : `Hola, El Tablón Latino. Quisiera cotizar un evento:${nl}${nl}*Evento:* ${el.tipo.value}${nl}*Fecha:* ${fechaLarga(el.fecha.value)}${nl}*Personas:* ${p}${nl}*Momento:* ${el.momento.value}${nl}*Espacio:* ${el.espacio.value}${nl}*A nombre de:* ${el.nombre.value.trim()}${nl}` + (det ? `*Detalles:* ${det}${nl}` : "") + `${nl}¡Gracias!`;
      window.tablonUltimoWhatsApp = abrirWhatsApp(txt);
      avisar(t("Abrimos WhatsApp con tu cotización"));
    });
  }

  /* ------------------------------------------------------------ carrusel */
  function prepararCarruseles() {
    $$("[data-carrusel]").forEach((car) => {
      const pista = $("[data-pista]", car);
      const seccion = car.closest("section") || document;
      const ant = $("[data-flechas] [data-ant]", seccion);
      const sig = $("[data-flechas] [data-sig]", seccion);
      const barra = $("[data-progreso]", car);
      const actualizar = () => {
        const max = pista.scrollWidth - pista.clientWidth;
        if (ant) ant.disabled = pista.scrollLeft <= 2;
        if (sig) sig.disabled = pista.scrollLeft >= max - 2;
        if (barra) barra.style.transform = `scaleX(${Math.min(1, (pista.scrollLeft + pista.clientWidth) / pista.scrollWidth)})`;
      };
      const mover = (dir) => pista.scrollBy({ left: dir * pista.clientWidth, behavior: comportamiento });
      ant?.addEventListener("click", () => mover(-1));
      sig?.addEventListener("click", () => mover(1));
      pista.addEventListener("scroll", () => requestAnimationFrame(actualizar), { passive: true });
      addEventListener("resize", actualizar);
      actualizar();

      // arrastre con el mouse (escritorio)
      let x0 = 0, s0 = 0, activo = false, movio = false;
      pista.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        activo = true; movio = false; x0 = e.clientX; s0 = pista.scrollLeft;
      });
      addEventListener("pointermove", (e) => {
        if (!activo) return;
        const dx = e.clientX - x0;
        if (!movio && Math.abs(dx) > 5) { movio = true; car.classList.add("arrastrando"); }
        if (movio) { pista.scrollLeft = s0 - dx; e.preventDefault(); }
      });
      addEventListener("pointerup", () => {
        if (!activo) return;
        activo = false;
        if (movio) {
          car.classList.remove("arrastrando");
          const tarjeta = pista.firstElementChild;
          if (tarjeta) {
            const paso = tarjeta.getBoundingClientRect().width + parseFloat(getComputedStyle(pista).columnGap || 0);
            pista.scrollTo({ left: Math.round(pista.scrollLeft / paso) * paso, behavior: comportamiento });
          }
        }
      });
      pista.addEventListener("click", (e) => { if (movio) { e.preventDefault(); e.stopPropagation(); movio = false; } }, true);
      pista.addEventListener("dragstart", (e) => e.preventDefault());
    });
  }

  /* ------------------------------------------------------------ galería y visor */
  function prepararGaleria() {
    const visor = $("#visor");
    if (!visor || !$("[data-galeria]")) return;
    const img = $("[data-visor-img]", visor);
    const texto = $("[data-visor-texto]", visor);
    const cuenta = $("[data-visor-cuenta]", visor);
    let lista = [];
    let i = 0;
    const mostrar = (n) => {
      i = (n + lista.length) % lista.length;
      const b = lista[i];
      const mini = b.querySelector("img");
      img.src = b.dataset.grande;
      img.alt = mini.alt;
      texto.textContent = mini.alt;
      cuenta.textContent = `${i + 1} / ${lista.length}`;
      [lista[(i + 1) % lista.length], lista[(i - 1 + lista.length) % lista.length]].forEach((v) => { const p = new Image(); p.src = v.dataset.grande; });
    };
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".mosaico__boton");
      if (!b) return;
      lista = $$(".mosaico__boton", b.closest("[data-galeria]")).filter((x) => !x.closest("li").hidden);
      mostrar(lista.indexOf(b));
      abrirDialogo(visor);
    });
    $("[data-visor-ant]", visor).addEventListener("click", () => mostrar(i - 1));
    $("[data-visor-sig]", visor).addEventListener("click", () => mostrar(i + 1));
    visor.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); mostrar(i - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); mostrar(i + 1); }
    });
    let x0 = null;
    const fig = $(".visor__figura", visor);
    fig.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
    fig.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) mostrar(i + (dx < 0 ? 1 : -1));
    });

    const filtros = $("[data-galeria-filtros]");
    filtros?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filtro]");
      if (!b) return;
      $$("[data-filtro]", filtros).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $$("[data-galeria] li").forEach((li) => { li.hidden = b.dataset.filtro !== "todo" && li.dataset.cat !== b.dataset.filtro; });
    });
  }

  /* ------------------------------------------------------------ mapa bajo demanda */
  function prepararMapa() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cargar-mapa]");
      if (!b) return;
      const caja = b.closest("[data-mapa]");
      const f = document.createElement("iframe");
      f.src = S.enlaces.mapaEmbed;
      f.title = t("Mapa de El Tablón Latino en Google Maps");
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.allowFullscreen = true;
      caja.innerHTML = "";
      caja.appendChild(f);
    });
  }

  /* ------------------------------------------------------------ apariciones suaves */
  function prepararApariciones() {
    if (sinMovimiento || !("IntersectionObserver" in window)) return;
    const els = $$(".seccion .encabezado, .historia__texto, .espacio-card, .cita, .tablon__intro, .espacio-fila");
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight) return;
      el.setAttribute("data-aparece", "");
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------ inicio */
  function iniciar() {
    prepararDialogos();
    prepararNav();
    prepararBarra();
    prepararContadores();
    prepararTablon();
    prepararReservas();
    prepararEventos();
    prepararCarruseles();
    prepararGaleria();
    prepararMapa();
    prepararApariciones();
    pintarEstado();
    setInterval(pintarEstado, 60 * 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) pintarEstado(); });
    window.tablonT = t;
    window.tablonLang = LANG;
    document.dispatchEvent(new CustomEvent("tablon:listo", { detail: { lang: LANG } }));
  }

  cargarIdioma(iniciar);
})();
