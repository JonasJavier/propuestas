/* Kukka Beach — navegación, estado abierto/cerrado, reservas, barra móvil y atardecer.
   Sin dependencias. Los datos del negocio salen de config.js. */
(function () {
  "use strict";

  var CFG = window.KUKKA_CONFIG;
  var DICC = window.KUKKA_I18N || {};
  var raiz = document.documentElement;
  var LANG = raiz.getAttribute("data-lang") || "es";
  var LOCALE = { es: "es-DO", en: "en-US", it: "it-IT" }[LANG];
  var ZONA = CFG.zonaHoraria;
  var NBSP = " ";

  /* ---------------------------------------------------------- textos */
  function t(clave, defecto, vars) {
    var texto = DICC["js." + clave] != null ? DICC["js." + clave] : defecto;
    if (vars) {
      Object.keys(vars).forEach(function (k) { texto = texto.split("{" + k + "}").join(vars[k]); });
    }
    return texto;
  }

  /* ---------------------------------------------------------- hora de Santo Domingo */
  var formatoPartes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA, hourCycle: "h23", weekday: "short",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });
  var DIAS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /** Devuelve la fecha y hora de pared en Santo Domingo para un instante dado. */
  function enRD(fecha) {
    var p = {};
    formatoPartes.formatToParts(fecha || new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = parseInt(p.hour, 10) % 24;
    return {
      dow: DIAS_EN.indexOf(p.weekday),
      min: h * 60 + parseInt(p.minute, 10),
      y: parseInt(p.year, 10), m: parseInt(p.month, 10), d: parseInt(p.day, 10),
      iso: p.year + "-" + p.month + "-" + p.day
    };
  }

  /** Instante (Date) de una hora de pared en Santo Domingo (UTC−4, sin horario de verano). */
  function instanteRD(iso, minutos) {
    var partes = iso.split("-").map(Number);
    return new Date(Date.UTC(partes[0], partes[1] - 1, partes[2], 4, 0) + (minutos || 0) * 60000);
  }

  function sumarDias(iso, n) {
    var p = iso.split("-").map(Number);
    var f = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n, 12));
    return f.toISOString().slice(0, 10);
  }

  function diaSemana(iso) {
    var p = iso.split("-").map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)).getUTCDay();
  }

  /** 7:00 a. m. · 9:30 p. m. (es) — 9:30 PM (en) — 21:30 (it) */
  function formatoHora(minutos) {
    minutos = ((Math.round(minutos) % 1440) + 1440) % 1440;
    var h = Math.floor(minutos / 60), m = minutos % 60;
    var mm = (m < 10 ? "0" : "") + m;
    if (LANG === "it") return (h < 10 ? "0" : "") + h + ":" + mm;
    var h12 = h % 12 || 12;
    if (LANG === "en") return h12 + ":" + mm + NBSP + (h < 12 ? "AM" : "PM");
    return h12 + ":" + mm + NBSP + (h < 12 ? "a." + NBSP + "m." : "p." + NBSP + "m.");
  }

  function minutosDeInstante(fecha) { return enRD(fecha).min; }

  function nombreDia(iso, estilo) {
    return new Intl.DateTimeFormat(LOCALE, { weekday: estilo || "long", timeZone: "UTC" })
      .format(new Date(iso + "T12:00:00Z"));
  }

  function fechaLarga(iso) {
    return new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
      .format(new Date(iso + "T12:00:00Z"));
  }

  /* ---------------------------------------------------------- horario */
  function tramosDelDia(dow) { return CFG.horario[String(dow)] || []; }

  /** Calcula el estado para un instante. Soporta cierres después de medianoche (cierre > 1440). */
  function estado(fecha) {
    var ahora = enRD(fecha);
    var min = ahora.min;
    var abiertos = [];
    tramosDelDia(ahora.dow).forEach(function (r) { abiertos.push([r[0], r[1]]); });
    tramosDelDia((ahora.dow + 6) % 7).forEach(function (r) {
      if (r[1] > 1440) abiertos.push([r[0] - 1440, r[1] - 1440]);
    });
    for (var i = 0; i < abiertos.length; i++) {
      var a = abiertos[i];
      if (min >= a[0] && min < a[1]) {
        var cierre = formatoHora(a[1]);
        var esLaUna = LANG === "es" && Math.floor((a[1] % 1440) / 60) % 12 === 1;
        if (a[1] - min <= 30) {
          return { tipo: "pronto", texto: esLaUna ? t("pronto_1", "Cierra pronto · a la {h}", { h: cierre }) : t("pronto", "Cierra pronto · a las {h}", { h: cierre }) };
        }
        return { tipo: "abierto", texto: esLaUna ? t("abierto_1", "Abierto ahora · hasta la {h}", { h: cierre }) : t("abierto", "Abierto ahora · hasta las {h}", { h: cierre }) };
      }
    }
    var hoy = tramosDelDia(ahora.dow).filter(function (r) { return r[0] > min; });
    if (hoy.length) {
      return { tipo: "cerrado", texto: articulo("abre_hoy", "Abre hoy a las {h}", hoy[0][0]) };
    }
    for (var n = 1; n <= 7; n++) {
      var dow = (ahora.dow + n) % 7;
      var tramos = tramosDelDia(dow);
      if (tramos.length) {
        if (n === 1) return { tipo: "cerrado", texto: articulo("abre_manana", "Abre mañana a las {h}", tramos[0][0]) };
        var dia = new Intl.DateTimeFormat(LOCALE, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + dow, 12)));
        return { tipo: "cerrado", texto: articulo("abre_dia", "Abre el {dia} a las {h}", tramos[0][0], dia) };
      }
    }
    return { tipo: "cerrado", texto: t("cerrado", "Cerrado") };
  }

  function articulo(clave, defecto, minutos, dia) {
    var h = formatoHora(minutos);
    var vars = { h: h, dia: dia || "" };
    if (LANG === "es" && Math.floor(minutos / 60) % 12 === 1) {
      return t(clave, defecto, vars).replace("a las " + h, "a la " + h);
    }
    return t(clave, defecto, vars);
  }

  function pintarEstado() {
    var e = estado(new Date());
    document.querySelectorAll("[data-estado]").forEach(function (nodo) {
      nodo.setAttribute("data-tipo", e.tipo);
      var texto = nodo.querySelector("[data-estado-texto]");
      if (texto) texto.textContent = e.texto;
    });
    var hoy = enRD(new Date()).dow;
    document.querySelectorAll("[data-horario] tr").forEach(function (fila) {
      var esHoy = fila.getAttribute("data-dia") === String(hoy);
      fila.classList.toggle("hoy", esHoy);
      var th = fila.querySelector("th");
      if (th) {
        if (esHoy) { th.setAttribute("data-hoy", t("hoy", "Hoy")); fila.setAttribute("aria-current", "date"); }
        else { th.removeAttribute("data-hoy"); fila.removeAttribute("aria-current"); }
      }
    });
  }

  /* ---------------------------------------------------------- sol (fórmulas astronómicas de SunCalc, BSD) */
  var RAD = Math.PI / 180, DIA_MS = 864e5, J1970 = 2440588, J2000 = 2451545, J0 = 0.0009, E = RAD * 23.4397;
  function aDias(f) { return f.valueOf() / DIA_MS - 0.5 + J1970 - J2000; }
  function deJuliano(j) { return new Date((j + 0.5 - J1970) * DIA_MS); }
  function anomalia(d) { return RAD * (357.5291 + 0.98560028 * d); }
  function longitudEcliptica(M) {
    var C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    return M + C + RAD * 102.9372 + Math.PI;
  }
  function declinacion(L) { return Math.asin(Math.sin(E) * Math.sin(L)); }
  function transito(ds, M, L) { return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L); }

  /** Salida, puesta y comienzo de la hora dorada para un día (iso) en las coordenadas del restaurante. */
  function sol(iso) {
    var lat = CFG.coordenadas.lat, lng = CFG.coordenadas.lng;
    var lw = RAD * -lng, phi = RAD * lat;
    var d = aDias(instanteRD(iso, 12 * 60));
    var n = Math.round(d - J0 - lw / (2 * Math.PI));
    var ds = J0 + lw / (2 * Math.PI) + n;
    var M = anomalia(ds), L = longitudEcliptica(M), dec = declinacion(L);
    var mediodia = transito(ds, M, L);
    function ocaso(h) {
      var w = Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
      return transito(J0 + (w + lw) / (2 * Math.PI) + n, M, L);
    }
    var puesta = ocaso(-0.833 * RAD);
    var dorada = ocaso(6 * RAD);
    return {
      sale: deJuliano(mediodia - (puesta - mediodia)),
      pone: deJuliano(puesta),
      dorada: deJuliano(dorada)
    };
  }

  /** Hora de reserva sugerida para ver el atardecer: 30 min antes, redondeada a la media hora. */
  function horaAtardecer(iso) {
    var s = sol(iso);
    var min = minutosDeInstante(s.pone) - 30;
    min = Math.floor(min / CFG.reservas.intervaloMin) * CFG.reservas.intervaloMin;
    var huecos = huecosDelDia(iso, false);
    if (!huecos.length) return null;
    if (huecos.indexOf(min) === -1) {
      var previos = huecos.filter(function (h) { return h <= min; });
      min = previos.length ? previos[previos.length - 1] : huecos[0];
    }
    return { reserva: min, pone: minutosDeInstante(s.pone), dorada: minutosDeInstante(s.dorada) };
  }

  /* ---------------------------------------------------------- reservas */
  /** Horas válidas para reservar un día: desde la apertura hasta una hora antes del cierre. */
  function huecosDelDia(iso, quitarPasadas) {
    var dow = diaSemana(iso);
    var paso = CFG.reservas.intervaloMin;
    var margen = CFG.reservas.ultimaReservaAntesDelCierreMin;
    var lista = [];
    tramosDelDia(dow).forEach(function (r) {
      for (var m = Math.ceil(r[0] / paso) * paso; m <= r[1] - margen; m += paso) lista.push(m);
    });
    if (quitarPasadas !== false) {
      var ahora = enRD(new Date());
      if (iso === ahora.iso) lista = lista.filter(function (m) { return m >= ahora.min + 30; });
      if (iso < ahora.iso) lista = [];
    }
    return lista;
  }

  var dialogoReserva = document.getElementById("reserva");
  var formReserva = document.querySelector("[data-form-reserva]");

  function primeraFechaConHuecos() {
    var iso = enRD(new Date()).iso;
    for (var i = 0; i < 14; i++) {
      if (huecosDelDia(iso).length) return iso;
      iso = sumarDias(iso, 1);
    }
    return iso;
  }

  function llenarHoras(iso, preferida) {
    var select = formReserva.elements.hora;
    var huecos = huecosDelDia(iso);
    select.innerHTML = "";
    if (!huecos.length) {
      var vacia = document.createElement("option");
      vacia.value = "";
      vacia.textContent = t("sin_horas", "Sin horas libres ese día");
      select.appendChild(vacia);
      select.disabled = true;
      return;
    }
    select.disabled = false;
    var s = sol(iso);
    var pone = minutosDeInstante(s.pone);
    huecos.forEach(function (m) {
      var op = document.createElement("option");
      op.value = String(m);
      op.textContent = formatoHora(m) + (m <= pone && pone - m <= 60 ? " · " + t("atardecer_corto", "atardecer") : "");
      select.appendChild(op);
    });
    var elegido = preferida != null && huecos.indexOf(preferida) !== -1 ? preferida : null;
    if (elegido == null) {
      var sugerida = horaAtardecer(iso);
      var porDefecto = huecos.indexOf(19 * 60 + 30) !== -1 ? 19 * 60 + 30 : (sugerida && huecos.indexOf(sugerida.reserva) !== -1 ? sugerida.reserva : huecos[0]);
      elegido = porDefecto;
    }
    select.value = String(elegido);
  }

  function pintarAvisoSol() {
    var aviso = document.querySelector("[data-aviso-sol]");
    if (!aviso) return;
    var iso = formReserva.elements.fecha.value;
    if (!iso) { aviso.hidden = true; return; }
    var info = horaAtardecer(iso);
    if (!info) { aviso.hidden = true; return; }
    aviso.hidden = false;
    aviso.textContent = t("aviso_sol", "Ese día el sol se pone a las {pone}; para verlo desde la mesa, reserva a las {reserva}", {
      pone: formatoHora(info.pone), reserva: formatoHora(info.reserva)
    });
  }

  function prepararReserva() {
    if (!formReserva) return;
    var f = formReserva.elements;
    var hoy = enRD(new Date()).iso;
    f.fecha.min = hoy;
    f.fecha.max = sumarDias(hoy, 180);
    var personas = formReserva.querySelector("[data-personas]");
    for (var i = 1; i <= CFG.reservas.maxPersonas; i++) {
      var op = document.createElement("option");
      op.value = String(i);
      op.textContent = i === 1 ? t("persona", "1 persona") : t("personas", "{n} personas", { n: i });
      personas.appendChild(op);
    }
    var mas = document.createElement("option");
    mas.value = "+" + CFG.reservas.maxPersonas;
    mas.textContent = t("personas_mas", "Más de {n}", { n: CFG.reservas.maxPersonas });
    personas.appendChild(mas);
    personas.value = "2";

    f.fecha.addEventListener("change", function () {
      limpiarError(f.fecha);
      if (f.fecha.value) llenarHoras(f.fecha.value);
      pintarAvisoSol();
    });
    f.hora.addEventListener("change", function () { limpiarError(f.hora); });
    f.nombre.addEventListener("input", function () { limpiarError(f.nombre); });

    formReserva.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;
      var hoyIso = enRD(new Date()).iso;
      if (!f.fecha.value) ok = marcarError(f.fecha, t("error_fecha", "Elige el día de tu reserva.")) && ok;
      else if (f.fecha.value < hoyIso) ok = marcarError(f.fecha, t("error_pasada", "Esa fecha ya pasó. Elige hoy o un día próximo.")) && ok;
      if (!f.hora.value) ok = marcarError(f.hora, t("error_hora", "Ese día ya no quedan horas. Prueba con otra fecha.")) && ok;
      if (f.nombre.value.trim().length < 2) ok = marcarError(f.nombre, t("error_nombre", "Escribe tu nombre.")) && ok;
      if (!ok) {
        var primero = formReserva.querySelector("[aria-invalid='true']");
        if (primero) primero.focus();
        return;
      }
      var area = formReserva.querySelector("input[name='area']:checked");
      var etiquetaArea = area ? area.parentNode.querySelector("span").textContent : "";
      var ocasion = f.ocasion.value ? f.ocasion.options[f.ocasion.selectedIndex].text : "";
      var personasTxt = f.personas.options[f.personas.selectedIndex].text;
      var lineas = [
        t("msg_saludo", "¡Hola, Kukka Beach! Quisiera reservar una mesa:"),
        "",
        "*" + t("msg_fecha", "Fecha") + ":* " + capitalizar(fechaLarga(f.fecha.value)),
        "*" + t("msg_hora", "Hora") + ":* " + formatoHora(parseInt(f.hora.value, 10)).split(NBSP).join(" "),
        "*" + t("msg_personas", "Personas") + ":* " + personasTxt,
        "*" + t("msg_area", "Mesa") + ":* " + etiquetaArea
      ];
      if (ocasion) lineas.push("*" + t("msg_ocasion", "Ocasión") + ":* " + ocasion);
      lineas.push("*" + t("msg_nombre", "A nombre de") + ":* " + f.nombre.value.trim());
      if (f.notas.value.trim()) lineas.push("*" + t("msg_notas", "Nota") + ":* " + f.notas.value.trim());
      lineas.push("", t("msg_cierre", "¿Me confirman, por favor? ¡Gracias!"));
      abrirWhatsApp(lineas.join("\n"));
    });
  }

  function capitalizar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function marcarError(campo, mensaje) {
    campo.setAttribute("aria-invalid", "true");
    var error = document.getElementById(campo.id + "-error");
    if (error) { error.textContent = mensaje; error.hidden = false; }
    return false;
  }
  function limpiarError(campo) {
    campo.removeAttribute("aria-invalid");
    var error = document.getElementById(campo.id + "-error");
    if (error) { error.textContent = ""; error.hidden = true; }
  }

  function abrirWhatsApp(texto) {
    var url = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(texto);
    window.KUKKA_ULTIMO_WA = url;
    var nueva = window.open(url, "_blank", "noopener");
    if (!nueva) window.location.href = url;
  }

  /** Abre la hoja de reserva. Opciones: { fecha, hora, area } */
  function abrirReserva(opciones) {
    if (!dialogoReserva || !formReserva) return;
    opciones = opciones || {};
    var f = formReserva.elements;
    var iso = opciones.fecha || f.fecha.value || primeraFechaConHuecos();
    if (iso < f.fecha.min) iso = primeraFechaConHuecos();
    f.fecha.value = iso;
    llenarHoras(iso, opciones.hora);
    if (opciones.area) {
      var radio = formReserva.querySelector("input[name='area'][value='" + opciones.area + "']");
      if (radio) radio.checked = true;
    }
    pintarAvisoSol();
    abrirDialogo(dialogoReserva);
  }

  /* ---------------------------------------------------------- diálogos */
  var ultimoFoco = null;
  function abrirDialogo(d) {
    if (!d || d.open) return;
    ultimoFoco = document.activeElement;
    d.showModal();
    document.body.classList.add("dialogo-abierto");
  }
  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("close", function () {
      if (!document.querySelector("dialog[open]")) document.body.classList.remove("dialogo-abierto");
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    });
    d.addEventListener("click", function (ev) {
      if (ev.target === d) d.close();
      var cerrar = ev.target.closest("[data-cerrar]");
      if (cerrar) d.close();
    });
  });
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-abrir-reserva]");
    if (b) {
      ev.preventDefault();
      var nav = document.getElementById("hoja-nav");
      if (nav && nav.open) nav.close();
      abrirReserva();
    }
    var n = ev.target.closest("[data-abrir-nav]");
    if (n) abrirDialogo(document.getElementById("hoja-nav"));
    var enlaceNav = ev.target.closest("#hoja-nav a[href]");
    if (enlaceNav) document.getElementById("hoja-nav").close();
  });

  /* ---------------------------------------------------------- barra móvil */
  function prepararBarra() {
    var barra = document.querySelector("[data-barra]");
    if (!barra) return;
    var ultimoY = window.scrollY;
    var pendiente = false;
    function actualizar() {
      pendiente = false;
      var y = window.scrollY;
      var alFinal = window.innerHeight + y >= document.documentElement.scrollHeight - 48;
      if (alFinal || y < 120) barra.classList.remove("oculta");
      else if (y > ultimoY + 8) barra.classList.add("oculta");
      else if (y < ultimoY - 8) barra.classList.remove("oculta");
      if (Math.abs(y - ultimoY) > 8 || alFinal) ultimoY = y;
    }
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; window.requestAnimationFrame(actualizar); }
    }, { passive: true });
  }

  /* ---------------------------------------------------------- mapa bajo demanda */
  function prepararMapa() {
    document.querySelectorAll("[data-mapa]").forEach(function (mapa) {
      var boton = mapa.querySelector("[data-cargar-mapa]");
      if (!boton) return;
      boton.addEventListener("click", function () {
        var iframe = document.createElement("iframe");
        iframe.src = mapa.getAttribute("data-mapa-src");
        iframe.title = t("mapa_titulo", "Mapa de Kukka Beach en la playa de Dominicus");
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        iframe.allowFullscreen = true;
        mapa.querySelector("img").replaceWith(iframe);
        mapa.classList.add("cargado");
        iframe.focus();
      });
    });
  }

  /* ---------------------------------------------------------- carrusel */
  function prepararCarrusel() {
    var pista = document.querySelector("[data-carrusel-pista]");
    if (!pista) return;
    var prev = document.querySelector("[data-carrusel-prev]");
    var next = document.querySelector("[data-carrusel-next]");
    var barra = document.querySelector("[data-carrusel-progreso]");
    function paso() {
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      return pista.clientWidth + gap - parseFloat(getComputedStyle(pista).paddingLeft) - parseFloat(getComputedStyle(pista).paddingRight);
    }
    function actualizar() {
      var max = pista.scrollWidth - pista.clientWidth;
      var x = pista.scrollLeft;
      if (prev) prev.disabled = x <= 4;
      if (next) next.disabled = x >= max - 4;
      if (barra) {
        var visible = Math.min(1, pista.clientWidth / pista.scrollWidth);
        barra.style.width = (visible * 100) + "%";
        var recorrido = max > 0 ? x / max : 0;
        barra.style.transform = "translateX(" + (recorrido * (1 / visible - 1) * 100) + "%)";
      }
    }
    if (prev) prev.addEventListener("click", function () { pista.scrollBy({ left: -paso(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { pista.scrollBy({ left: paso(), behavior: "smooth" }); });
    pista.addEventListener("scroll", function () { window.requestAnimationFrame(actualizar); }, { passive: true });
    window.addEventListener("resize", actualizar);
    actualizar();

    // Arrastre con el ratón en escritorio
    var arrastre = null;
    var recienArrastrado = false;
    pista.addEventListener("pointerdown", function (ev) {
      if (ev.pointerType !== "mouse" || ev.button !== 0) return;
      arrastre = { x: ev.clientX, inicio: pista.scrollLeft, movio: false };
    });
    window.addEventListener("pointermove", function (ev) {
      if (!arrastre) return;
      var dx = ev.clientX - arrastre.x;
      if (!arrastre.movio && Math.abs(dx) > 6) {
        arrastre.movio = true;
        pista.classList.add("arrastrando");
      }
      if (arrastre.movio) pista.scrollLeft = arrastre.inicio - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!arrastre) return;
      var movio = arrastre.movio;
      arrastre = null;
      if (!movio) return;
      recienArrastrado = true;
      setTimeout(function () { recienArrastrado = false; }, 0);
      pista.classList.remove("arrastrando");
      // Ajusta a la tarjeta más cercana al borde de inicio
      var borde = pista.getBoundingClientRect().left + parseFloat(getComputedStyle(pista).paddingLeft);
      var mejor = null;
      pista.querySelectorAll(".fav-card").forEach(function (c) {
        var d = c.getBoundingClientRect().left - borde;
        if (mejor === null || Math.abs(d) < Math.abs(mejor)) mejor = d;
      });
      if (mejor) pista.scrollBy({ left: mejor, behavior: "smooth" });
    });
    pista.addEventListener("click", function (ev) {
      if (recienArrastrado) { ev.preventDefault(); ev.stopPropagation(); }
    }, true);
    pista.addEventListener("dragstart", function (ev) { ev.preventDefault(); });
  }

  /* ---------------------------------------------------------- aparición suave */
  function prepararAparicion() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var nodos = document.querySelectorAll(".seccion .titulo-seccion, .momento, .cita, .espacio, .tipo, .ruta, .pasos-lista li");
    if (!nodos.length) return;
    raiz.classList.add("js-animar");
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    nodos.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // lo que ya se ve no se anima
      n.classList.add("revelar");
      obs.observe(n);
    });
  }

  /* ---------------------------------------------------------- idioma preferido */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest(".idiomas a[data-lang]");
    if (!a) return;
    try { localStorage.setItem("kukka-idioma", a.getAttribute("data-lang")); } catch (e) { /* sin almacenamiento */ }
  });

  /* ---------------------------------------------------------- API para otras partes */
  window.Kukka = {
    t: t, enRD: enRD, sumarDias: sumarDias, formatoHora: formatoHora, fechaLarga: fechaLarga,
    nombreDia: nombreDia, sol: sol, horaAtardecer: horaAtardecer, minutosDeInstante: minutosDeInstante,
    abrirReserva: abrirReserva, abrirDialogo: abrirDialogo, abrirWhatsApp: abrirWhatsApp,
    marcarError: marcarError, limpiarError: limpiarError, capitalizar: capitalizar,
    estado: estado, huecosDelDia: huecosDelDia, LANG: LANG, LOCALE: LOCALE
  };

  pintarEstado();
  setInterval(pintarEstado, 60000);
  prepararReserva();
  prepararBarra();
  prepararMapa();
  prepararCarrusel();
  prepararAparicion();
})();
