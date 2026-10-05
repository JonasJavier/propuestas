/* Puerta del Sol · navegación, estado abierto/cerrado, reservas, barra móvil, carrusel y mapa.
   Los datos del negocio vienen de config.js (window.SITE). */
(function () {
  "use strict";
  var SITE = window.SITE;
  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- Hora de Santo Domingo ---------- */
  var TZ = SITE.timezone || "America/Santo_Domingo";
  var DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var partsFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });

  function drNow(date) {
    var p = {};
    partsFmt.formatToParts(date || new Date()).forEach(function (x) { p[x.type] = x.value; });
    var hour = parseInt(p.hour, 10) % 24;
    return {
      day: WEEKDAY[p.weekday],
      minutes: hour * 60 + parseInt(p.minute, 10),
      iso: p.year + "-" + p.month + "-" + p.day
    };
  }

  function toMin(hhmm) { var a = hhmm.split(":"); return +a[0] * 60 + +a[1]; }

  /* 7:00 a. m. · 9:30 p. m. (formato dominicano) */
  function fmtTime(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    var suf = h < 12 ? "a. m." : "p. m.";
    var h12 = h % 12 || 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + suf;
  }
  function art(min) { var h = Math.floor((((min % 1440) + 1440) % 1440) / 60) % 12 || 12; return h === 1 ? "la" : "las"; }

  /* Calcula el estado para un instante dado. Exportada para probar horas simuladas. */
  function getStatus(date, hours) {
    hours = hours || SITE.hours;
    var now = drNow(date), d = now.day, m = now.minutes;
    var yesterday = hours[String((d + 6) % 7)] || [];
    var today = hours[String(d)] || [];
    var closeAt = null, i, a, b;

    for (i = 0; i < yesterday.length; i++) {          // turno de ayer que cruza medianoche
      a = toMin(yesterday[i][0]); b = toMin(yesterday[i][1]);
      if (b <= a && m < b) closeAt = b;
    }
    for (i = 0; closeAt === null && i < today.length; i++) {
      a = toMin(today[i][0]); b = toMin(today[i][1]);
      if (b > a && m >= a && m < b) closeAt = b;
      if (b <= a && m >= a) closeAt = b + 1440;
    }
    if (closeAt !== null) {
      var left = closeAt - m;
      var t = art(closeAt) + " " + fmtTime(closeAt);
      if (left <= 30) return { state: "soon", short: "Cierra pronto", text: "Cierra pronto · a " + t };
      return { state: "open", short: "Abierto ahora", text: "Abierto ahora · hasta " + t };
    }
    for (i = 0; i < today.length; i++) {               // aún no abre hoy
      a = toMin(today[i][0]);
      if (a > m) return { state: "closed", short: "Cerrado", text: "Cerrado · abre hoy a " + art(a) + " " + fmtTime(a) };
    }
    for (var k = 1; k <= 7; k++) {                     // próximo día con horario
      var spans = hours[String((d + k) % 7)] || [];
      if (spans.length) {
        a = toMin(spans[0][0]);
        var when = k === 1 ? "mañana" : "el " + DAY_NAMES[(d + k) % 7];
        return { state: "closed", short: "Cerrado", text: "Cerrado · abre " + when + " a " + art(a) + " " + fmtTime(a) };
      }
    }
    return { state: "closed", short: "Cerrado", text: "Cerrado temporalmente" };
  }

  function paintStatus() {
    var s = getStatus();
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.setAttribute("data-state", s.state);
      var txt = el.querySelector("[data-status-text]");
      if (txt) txt.textContent = el.hasAttribute("data-short") ? s.short : s.text;
      if (el.hasAttribute("data-short")) el.setAttribute("title", s.text);
    });
    var day = drNow().day;
    document.querySelectorAll("[data-hours] tr").forEach(function (tr) {
      var isToday = tr.getAttribute("data-day") === String(day);
      tr.classList.toggle("is-today", isToday);
      if (isToday) tr.setAttribute("aria-current", "date"); else tr.removeAttribute("aria-current");
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- Diálogos ---------- */
  var tabbar = document.querySelector("[data-tabbar]");
  function syncDialogState() {
    var open = !!document.querySelector("dialog[open]");
    document.body.classList.toggle("has-dialog", open);
    if (tabbar) tabbar.classList.toggle("is-hidden", open || tabbar.dataset.scrollHidden === "1");
  }
  function openDialog(dlg) {
    if (!dlg || dlg.open) return;
    document.querySelectorAll("dialog[open]").forEach(function (d) { d.close(); });
    dlg.showModal();
    syncDialogState();
  }
  document.querySelectorAll("dialog").forEach(function (dlg) {
    dlg.addEventListener("close", syncDialogState);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // clic en el fondo
    dlg.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
  });

  var nav = document.getElementById("nav-sheet");
  var navToggle = document.querySelector("[data-open-nav]");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () { openDialog(nav); navToggle.setAttribute("aria-expanded", "true"); });
    nav.addEventListener("close", function () { navToggle.setAttribute("aria-expanded", "false"); });
    nav.querySelectorAll("[data-close-nav]").forEach(function (a) { a.addEventListener("click", function () { nav.close(); }); });
  }

  /* ---------- Barra inferior: se oculta al bajar, vuelve al subir ---------- */
  if (tabbar) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, dy = y - lastY;
        var atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (atEnd || y < 120 || dy < -6) tabbar.dataset.scrollHidden = "0";
        else if (dy > 6) tabbar.dataset.scrollHidden = "1";
        lastY = y; ticking = false;
        syncDialogState();
      });
    }, { passive: true });
  }

  /* ---------- Utilidades de fecha para formularios ---------- */
  function addDays(iso, n) {
    var p = iso.split("-").map(Number);
    var dt = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return dt.toISOString().slice(0, 10);
  }
  function dayOf(iso) { var p = iso.split("-").map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
  var longDate = new Intl.DateTimeFormat("es-DO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  function prettyDate(iso) {
    var p = iso.split("-").map(Number);
    return longDate.format(new Date(Date.UTC(p[0], p[1] - 1, p[2]))).replace(",", "");
  }
  function setError(field, msg) {
    var err = document.getElementById(field.getAttribute("aria-describedby"));
    if (msg) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
    if (err) err.textContent = msg || "";
    return !msg;
  }
  function openWhatsApp(text) {
    var url = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text);
    window.PDS.lastWhatsApp = url;
    var w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
    return url;
  }

  /* ---------- Reservas ---------- */
  var reserva = document.getElementById("reserva");
  var form = document.querySelector("[data-reserva-form]");

  function slotsFor(iso) {
    var spans = SITE.hours[String(dayOf(iso))] || [];
    var last = toMin(SITE.lastReservation || "23:30");
    var now = drNow(), out = [];
    spans.forEach(function (s) {
      var a = toMin(s[0]), b = toMin(s[1]);
      var end = (b <= a ? b + 1440 : b) - 60;
      var stop = Math.min(end, last < a ? last + 1440 : last);
      for (var t = a; t <= stop; t += 30) {
        if (iso === now.iso && t < now.minutes + 30) continue;
        out.push(t);
      }
    });
    return out;
  }

  if (form) {
    var fFecha = form.querySelector("#r-fecha");
    var fHora = form.querySelector("#r-hora");
    var fNombre = form.querySelector("#r-nombre");

    var fillHours = function () {
      var keep = fHora.value;
      fHora.innerHTML = "";
      if (!fFecha.value) return;
      var slots = slotsFor(fFecha.value);
      if (!slots.length) {
        fHora.innerHTML = '<option value="">Sin horarios</option>';
        setError(fHora, fFecha.value === drNow().iso ? "Para hoy ya no quedan horarios. Elige otra fecha." : "Ese día no abrimos. Elige otra fecha.");
        return;
      }
      setError(fHora, "");
      slots.forEach(function (t) {
        var o = document.createElement("option");
        o.value = fmtTime(t).replace(/ /g, " ");
        o.textContent = o.value;
        fHora.appendChild(o);
      });
      var pref = Array.prototype.find.call(fHora.options, function (o) { return o.value === keep; }) ||
        Array.prototype.find.call(fHora.options, function (o) { return o.value === "8:00 p. m."; });
      if (pref) fHora.value = pref.value;
    };

    var prepare = function () {
      var today = drNow().iso;
      fFecha.min = today;
      fFecha.max = addDays(today, 90);
      if (!fFecha.value || fFecha.value < today) fFecha.value = slotsFor(today).length ? today : addDays(today, 1);
      fillHours();
    };

    fFecha.addEventListener("change", function () {
      if (fFecha.value && fFecha.value < drNow().iso) setError(fFecha, "Elige hoy o una fecha futura.");
      else setError(fFecha, "");
      fillHours();
    });
    fNombre.addEventListener("input", function () { if (fNombre.value.trim().length >= 2) setError(fNombre, ""); });

    document.querySelectorAll("[data-open-reserva]").forEach(function (btn) {
      btn.addEventListener("click", function () { prepare(); openDialog(reserva); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var today = drNow().iso, ok = true;
      if (!fFecha.value) ok = setError(fFecha, "Elige la fecha de tu visita.") && ok;
      else if (fFecha.value < today) ok = setError(fFecha, "Elige hoy o una fecha futura.") && ok;
      else setError(fFecha, "");
      if (!fHora.value) ok = setError(fHora, "Elige una hora disponible.") && ok;
      if (fNombre.value.trim().length < 2) ok = setError(fNombre, "Escribe el nombre para la reserva.") && ok;
      if (!ok) { var bad = form.querySelector("[aria-invalid='true']"); if (bad) bad.focus(); return; }

      var data = new FormData(form);
      var lines = [
        "¡Hola, Puerta del Sol! 👋 Quisiera reservar una mesa:",
        "",
        "📅 Fecha: " + prettyDate(fFecha.value),
        "🕗 Hora: " + fHora.value,
        "👥 Personas: " + data.get("personas"),
        "📍 Área: " + data.get("area")
      ];
      if (data.get("ocasion")) lines.push("🎉 Ocasión: " + data.get("ocasion"));
      lines.push("🙋 A nombre de: " + fNombre.value.trim());
      var nota = (data.get("nota") || "").trim();
      if (nota) lines.push("📝 Nota: " + nota);
      lines.push("", "¿Me confirman, por favor? ¡Gracias!");
      openWhatsApp(lines.join("\n"));
      reserva.close();
    });
  }

  /* ---------- Cotización de eventos ---------- */
  var evForm = document.querySelector("[data-evento-form]");
  if (evForm) {
    var eFecha = evForm.querySelector("#e-fecha");
    var eNombre = evForm.querySelector("#e-nombre");
    eFecha.min = addDays(drNow().iso, 1);
    evForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      if (!eFecha.value) ok = setError(eFecha, "Elige la fecha del evento.") && ok;
      else if (eFecha.value < eFecha.min) ok = setError(eFecha, "Elige una fecha a partir de mañana.") && ok;
      else setError(eFecha, "");
      if (eNombre.value.trim().length < 2) ok = setError(eNombre, "Escribe tu nombre.") && ok;
      else setError(eNombre, "");
      if (!ok) { evForm.querySelector("[aria-invalid='true']").focus(); return; }
      var d = new FormData(evForm);
      var interes = d.getAll("interes");
      var lines = [
        "¡Hola, Puerta del Sol! 🎉 Quiero cotizar un evento:",
        "",
        "• Tipo: " + d.get("tipo"),
        "• Fecha: " + prettyDate(eFecha.value),
        "• Invitados: " + d.get("invitados"),
        "• Espacio: " + d.get("espacio"),
        "• Horario: " + d.get("horario")
      ];
      if (interes.length) lines.push("• Nos interesa: " + interes.join(", "));
      lines.push("• Nombre: " + eNombre.value.trim());
      var det = (d.get("nota") || "").trim();
      if (det) lines.push("• Detalles: " + det);
      lines.push("", "¿Me envían opciones y precio? ¡Gracias!");
      openWhatsApp(lines.join("\n"));
    });
  }

  /* ---------- Carrusel ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (box) {
    var track = box.querySelector(".carousel-track");
    var bar = box.querySelector("[data-carousel-bar]");
    var prev = document.querySelector('[data-carousel-prev][aria-controls="' + track.id + '"]');
    var next = document.querySelector('[data-carousel-next][aria-controls="' + track.id + '"]');

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      if (bar) {
        bar.style.width = Math.min(100, (track.clientWidth / track.scrollWidth) * 100) + "%";
        bar.style.transform = "translateX(" + (track.scrollLeft / track.clientWidth) * 100 + "%)";
      }
    }
    function page(dir) {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: dir * (track.clientWidth + gap), behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { page(-1); });
    if (next) next.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    // Arrastre con el mouse en escritorio
    var startX = 0, startLeft = 0, down = false, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add("is-dragging"); }
      if (moved) { track.scrollLeft = startLeft - dx; e.preventDefault(); }
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      if (!moved) return;
      var cards = track.children, best = 0, bestDist = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var dist = Math.abs(cards[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - track.scrollLeft);
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      var target = cards[best].offsetLeft - cards[0].offsetLeft;
      track.classList.remove("is-dragging");
      track.scrollTo({ left: target, behavior: "smooth" });
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
  });

  /* ---------- Mapa bajo demanda ---------- */
  document.querySelectorAll("[data-map-load]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest("[data-map]");
      var f = document.createElement("iframe");
      f.src = btn.getAttribute("data-src");
      f.title = "Mapa de Puerta del Sol en la zona monumental de Santiago";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.setAttribute("allowfullscreen", "");
      box.innerHTML = "";
      box.appendChild(f);
    });
  });

  /* ---------- Aparición sutil (solo lo que está debajo del primer pantallazo) ---------- */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".section-head, .vista-head, .vista-item, .bk-grid, .about-copy, .quote, .exp-card, .steps li")
      .forEach(function (el, i) {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.classList.add("reveal");
        if (el.classList.contains("vista-item")) el.style.transitionDelay = (i % 3) * 90 + "ms";
        io.observe(el);
      });
  }

  window.PDS = window.PDS || {};
  window.PDS.getStatus = getStatus;
  window.PDS.drNow = drNow;
  window.PDS.slotsFor = slotsFor;
  window.PDS.fmtTime = fmtTime;
})();
