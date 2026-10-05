/* The Deck · comportamiento común a todas las páginas.
   - Estado abierto/cerrado en hora de Santo Domingo (no la del teléfono)
   - Navegación móvil, cabecera, barra inferior
   - Reservas y cotización de eventos por WhatsApp
   - Carrusel de favoritos, mapa bajo demanda y recorrido «Al final de la calle» */
(() => {
  "use strict";

  const C = window.DECK;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ Horario */
  const TZ = "America/Santo_Domingo";
  const WEEK = 7 * 1440;
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  /* 450 -> "7:30 a. m." · 1380 -> "11:00 p. m." (formato dominicano) */
  const fmt = (min) => {
    const t = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(t / 60);
    const m = t % 60;
    // Espacios no separables: la hora nunca se parte en dos líneas
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
  };
  const art = (hora) => (hora.startsWith("1:") ? "la" : "las");

  function nowDR(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type).value;
    const hour = Number(get("hour")) % 24;
    return {
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
      min: hour * 60 + Number(get("minute")),
      iso: `${get("year")}-${get("month")}-${get("day")}`
    };
  }

  /* Turnos de toda la semana en minutos desde el domingo 00:00.
     Si un turno cierra después de medianoche (ej. 18:00–01:00) se extiende al día siguiente. */
  function turnosDe(horario) {
    const lista = [];
    for (let d = 0; d < 7; d++) {
      for (const [abre, cierra] of horario[d] || []) {
        const s = d * 1440 + toMin(abre);
        let e = d * 1440 + toMin(cierra);
        if (e <= s) e += 1440;
        lista.push({ s, e });
      }
    }
    return lista;
  }
  const turnosNegocio = turnosDe(C.hours);

  /* El tercer parámetro permite probar otros horarios (ej. uno que cierra a la 1:00 a. m.) */
  function status(day, min, horario) {
    const turnos = horario ? turnosDe(horario) : turnosNegocio;
    const t = day * 1440 + min;
    for (const tu of turnos) {
      for (const tt of [t, t + WEEK]) {
        if (tt >= tu.s && tt < tu.e) {
          const hora = fmt(tu.e);
          if (tu.e - tt <= 30) {
            return { state: "soon", long: `Cierra pronto · a ${art(hora)} ${hora}`, short: `Cierra pronto · ${hora}` };
          }
          return { state: "open", long: `Abierto ahora · hasta ${art(hora)} ${hora}`, short: `Abierto · hasta ${hora}` };
        }
      }
    }
    let falta = Infinity;
    for (const tu of turnos) falta = Math.min(falta, tu.s > t ? tu.s - t : tu.s + WEEK - t);
    if (!Number.isFinite(falta)) return { state: "closed", long: "Cerrado", short: "Cerrado" };
    const abs = t + falta;
    const dias = Math.floor(abs / 1440) - day;
    const hora = fmt(abs);
    if (dias === 0) return { state: "closed", long: `Cerrado · abre hoy a ${art(hora)} ${hora}`, short: `Abre hoy · ${hora}` };
    if (dias === 1) return { state: "closed", long: `Cerrado · abre mañana a ${art(hora)} ${hora}`, short: `Abre mañana · ${hora}` };
    const dia = DIAS[Math.floor(abs / 1440) % 7];
    return { state: "closed", long: `Cerrado · abre el ${dia} a ${art(hora)} ${hora}`, short: `Abre el ${dia} · ${hora}` };
  }

  /* Para probar otras horas desde la consola: DeckHours.status(5, 23 * 60 + 40) */
  window.DeckHours = { status, nowDR, fmt, toMin, pintar: (day, min) => pintarEstado({ day, min, iso: nowDR().iso }) };

  function pintarEstado(simulado) {
    const n = simulado || nowDR();
    const s = status(n.day, n.min);
    $$("[data-status]").forEach((el) => {
      el.dataset.state = s.state;
      const txt = $("[data-status-text]", el);
      if (!txt) return;
      txt.textContent = el.dataset.status === "short" ? s.short : s.long;
      // Si el texto largo no cabe (pantallas de 360 px), se usa el corto: la pastilla nunca se parte
      if (el.dataset.status !== "short" && el.parentElement && el.scrollWidth > el.parentElement.clientWidth) txt.textContent = s.short;
    });
    $$(".horario tr[data-day]").forEach((tr) => tr.classList.toggle("is-hoy", Number(tr.dataset.day) === n.day));

    // Momento del día (solo si está abierto)
    let momento = "";
    if (s.state !== "closed") {
      momento = n.min < toMin(C.breakfastUntil) ? "manana" : n.min < 17 * 60 ? "mediodia" : "noche";
    }
    $$("[data-momento]").forEach((li) => {
      const chip = $(".momento-ahora", li);
      if (chip) chip.hidden = li.dataset.momento !== momento;
    });

    // Cierre: «¿Te guardamos una mesa esta noche / hoy / mañana / el lunes?»
    const cierre = $("[data-cierre]");
    if (cierre) {
      const ultima = toMin(C.kitchenClose) - C.lastSeatingBeforeKitchen;
      const hoyAbre = (C.hours[n.day] || []).length > 0 && n.min < ultima;
      let cuando;
      if (hoyAbre) cuando = n.min >= 15 * 60 ? "esta noche" : "hoy";
      else {
        let d = 1;
        while (d < 8 && !(C.hours[(n.day + d) % 7] || []).length) d++;
        cuando = d === 1 ? "mañana" : `el ${DIAS[(n.day + d) % 7]}`;
      }
      cierre.textContent = `¿Te guardamos una mesa ${cuando}?`;
    }
  }
  pintarEstado();
  setInterval(pintarEstado, 60 * 1000);

  /* ------------------------------------------------------------ Diálogos */
  const abrirDialogo = (d) => {
    if (!d || d.open) return;
    d.showModal();
    document.body.classList.add("has-dialogo");
  };
  window.DeckDialog = abrirDialogo;
  // La barra inferior se oculta mientras haya un diálogo abierto (se cierre como se cierre)
  const sincronizar = () => {
    document.body.classList.toggle("has-dialogo", !!$("dialog[open]"));
    const nav = $("#hoja-nav");
    const boton = $("[data-abrir-nav]");
    if (nav && boton) boton.setAttribute("aria-expanded", String(nav.open));
  };
  new MutationObserver(sincronizar).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  $$("dialog").forEach((d) => {
    // Clic fuera del contenido (en el fondo) cierra
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    });
    $$("[data-cerrar]", d).forEach((b) => b.addEventListener("click", () => d.close()));
  });

  /* ------------------------------------------------------------ Cabecera y navegación */
  const cabecera = $("[data-cabecera]");
  const hojaNav = $("#hoja-nav");
  const abrirNav = $("[data-abrir-nav]");
  if (abrirNav && hojaNav) {
    abrirNav.addEventListener("click", () => abrirDialogo(hojaNav));
    $$("[data-cerrar-al-ir]", hojaNav).forEach((a) => a.addEventListener("click", () => hojaNav.close()));
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches && hojaNav.open) hojaNav.close();
    });
  }

  /* ------------------------------------------------------------ Scroll: cabecera, barra y recorrido */
  const barra = $("[data-barra]");
  const ruta = $("[data-ruta]");
  const rutaPasos = ruta && $(".ruta-pasos", ruta);
  const rutaItems = ruta ? $$(".ruta-paso", ruta) : [];
  let ultimoY = window.scrollY;
  let pendiente = false;

  function alHacerScroll() {
    pendiente = false;
    const y = window.scrollY;
    if (cabecera) cabecera.classList.toggle("is-scrolled", y > 8);

    if (barra) {
      const alFinal = window.innerHeight + y >= document.documentElement.scrollHeight - 48;
      if (alFinal || y < 120 || y < ultimoY - 6) barra.classList.remove("is-oculta");
      else if (y > ultimoY + 6) barra.classList.add("is-oculta");
    }
    ultimoY = y;

    if (rutaPasos && !reduce) {
      const r = rutaPasos.getBoundingClientRect();
      const linea = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (linea - r.top) / Math.max(1, r.height - 46)));
      rutaPasos.style.setProperty("--progreso", p.toFixed(3));
      rutaItems.forEach((li) => li.classList.toggle("is-alcanzado", li.getBoundingClientRect().top + 14 < linea));
    }
  }
  window.addEventListener("scroll", () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(alHacerScroll);
    }
  }, { passive: true });
  window.addEventListener("resize", alHacerScroll);
  if (rutaPasos && reduce) {
    rutaPasos.style.setProperty("--progreso", "1");
    rutaItems.forEach((li) => li.classList.add("is-alcanzado"));
  }
  alHacerScroll();

  /* ------------------------------------------------------------ Fechas y horas válidas */
  const pad = (n) => String(n).padStart(2, "0");
  const diaDeISO = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
  const sumarDias = (iso, n) => {
    const d = new Date(`${iso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  };
  const fechaLarga = (iso) => {
    const txt = new Intl.DateTimeFormat("es-DO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
      .format(new Date(`${iso}T12:00:00Z`)).replace(",", "");
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  };

  /* Horas para reservar ese día: cada 30 min desde que abre hasta 30 min antes de que cierre la cocina */
  function horasPara(iso) {
    const n = nowDR();
    const cocina = toMin(C.kitchenClose);
    const lista = [];
    for (const [abre, cierra] of C.hours[diaDeISO(iso)] || []) {
      const ini = Math.ceil(toMin(abre) / 30) * 30;
      let fin = toMin(cierra);
      if (fin <= toMin(abre)) fin += 1440;
      const ultima = Math.min(fin, cocina > toMin(abre) ? cocina : cocina + 1440) - C.lastSeatingBeforeKitchen;
      for (let m = ini; m <= ultima; m += 30) {
        if (iso === n.iso && m < n.min + 30) continue;
        lista.push(m);
      }
    }
    return lista;
  }

  function primerDiaConHoras() {
    let iso = nowDR().iso;
    for (let i = 0; i < 8; i++, iso = sumarDias(iso, 1)) if (horasPara(iso).length) return iso;
    return nowDR().iso;
  }

  function llenarHoras(select, iso, { opcional = false } = {}) {
    const previa = select.value;
    const horas = iso ? horasPara(iso) : [];
    select.innerHTML = "";
    if (opcional) select.add(new Option("Por definir", ""));
    else if (!iso) select.add(new Option("Elige la fecha", ""));
    horas.forEach((m) => select.add(new Option(fmt(m), fmt(m))));
    if (!opcional && iso && !horas.length) select.add(new Option("Sin horas ese día", ""));
    if (horas.map(fmt).includes(previa)) select.value = previa;
    select.disabled = !opcional && !horas.length;
    return horas.length;
  }

  function errorCampo(campo, msg) {
    const p = document.getElementById(`${campo.id}-error`);
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    if (p) {
      p.textContent = msg || "";
      p.hidden = !msg;
    }
    return !msg;
  }

  function errorFecha(iso) {
    const hoy = nowDR().iso;
    if (!iso) return "Elige la fecha.";
    if (iso < hoy) return "Esa fecha ya pasó. Elige hoy o un día próximo.";
    if (!(C.hours[diaDeISO(iso)] || []).length) return `Los ${DIAS[diaDeISO(iso)]}s no abrimos. Elige otro día.`;
    if (!horasPara(iso).length) return "Hoy ya no quedan horas para reservar. Elige otro día.";
    return "";
  }

  const abrirWhatsApp = (texto) => {
    const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
  };

  /* ------------------------------------------------------------ Reserva por WhatsApp */
  const dReserva = $("#reservar");
  const fReserva = $("#form-reserva");
  if (dReserva && fReserva) {
    const fecha = $("#r-fecha", fReserva);
    const hora = $("#r-hora", fReserva);
    const personas = $("#r-personas", fReserva);
    const area = $("#r-area", fReserva);
    const nombre = $("#r-nombre", fReserva);
    const aviso = $("[data-aviso-grupo]", fReserva);

    const preparar = (areaElegida) => {
      const hoy = nowDR().iso;
      fecha.min = hoy;
      fecha.max = sumarDias(hoy, 90);
      if (!fecha.value || fecha.value < hoy) fecha.value = primerDiaConHoras();
      llenarHoras(hora, fecha.value);
      if (areaElegida) area.value = areaElegida;
      errorCampo(fecha, "");
      errorCampo(hora, "");
    };

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-reservar]");
      if (!b) return;
      e.preventDefault();
      if (hojaNav && hojaNav.open) hojaNav.close();
      preparar(b.dataset.area);
      abrirDialogo(dReserva);
    });

    fecha.addEventListener("change", () => {
      llenarHoras(hora, fecha.value);
      errorCampo(fecha, errorFecha(fecha.value));
    });
    hora.addEventListener("change", () => errorCampo(hora, ""));
    nombre.addEventListener("input", () => {
      if (nombre.getAttribute("aria-invalid") === "true") errorCampo(nombre, "");
    });
    personas.addEventListener("change", () => {
      aviso.hidden = personas.value !== "13+";
    });

    fReserva.addEventListener("submit", (e) => {
      e.preventDefault();
      const okFecha = errorCampo(fecha, errorFecha(fecha.value));
      const okHora = errorCampo(hora, okFecha && !hora.value ? "Elige la hora." : "");
      const okNombre = errorCampo(nombre, nombre.value.trim().length < 2 ? "Escribe tu nombre para la reserva." : "");
      if (!(okFecha && okHora && okNombre)) {
        $("[aria-invalid='true']", fReserva)?.focus();
        return;
      }
      const ocasion = fReserva.ocasion.value;
      const nota = fReserva.nota.value.trim();
      const p = personas.value === "13+" ? "13 o más personas" : `${personas.value} ${personas.value === "1" ? "persona" : "personas"}`;
      const lineas = [
        "¡Hola, The Deck! 👋 Quiero reservar una mesa:",
        "",
        `📅 ${fechaLarga(fecha.value)}`,
        `🕗 ${hora.value}`,
        `👥 ${p}`,
        `📍 ${area.value || "Sin preferencia de área"}`,
        ocasion ? `🎉 ${ocasion}` : null,
        `🙋 A nombre de ${nombre.value.trim()}`,
        nota ? `📝 ${nota}` : null,
        "",
        "¿Me confirman, por favor? ¡Gracias!"
      ].filter((l) => l !== null);
      abrirWhatsApp(lineas.join("\n"));
      dReserva.close();
    });
  }

  /* ------------------------------------------------------------ Cotización de eventos */
  const fEvento = $("#form-evento");
  if (fEvento) {
    const fecha = $("#e-fecha", fEvento);
    const hora = $("#e-hora", fEvento);
    const hoy = nowDR().iso;
    fecha.min = sumarDias(hoy, 1);
    fecha.max = sumarDias(hoy, 365);
    llenarHoras(hora, "", { opcional: true });
    fecha.addEventListener("change", () => {
      llenarHoras(hora, fecha.value, { opcional: true });
      errorCampo(fecha, "");
    });
    $$("input, select", fEvento).forEach((el) => el.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") errorCampo(el, "");
    }));

    fEvento.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = fEvento.elements;
      let msgFecha = "";
      if (!fecha.value) msgFecha = "Elige la fecha del evento.";
      else if (fecha.value <= hoy) msgFecha = "Para eventos, elige a partir de mañana.";
      else if (!(C.hours[diaDeISO(fecha.value)] || []).length) msgFecha = `Los ${DIAS[diaDeISO(fecha.value)]}s no abrimos. Elige otro día.`;
      const n = Number(f.personas.value);
      const ok = [
        errorCampo(f.tipo, f.tipo.value ? "" : "Elige el tipo de evento."),
        errorCampo(fecha, msgFecha),
        errorCampo(f.personas, n >= 2 && n <= 300 ? "" : "Escribe cuántas personas serán (2 o más)."),
        errorCampo(f.nombre, f.nombre.value.trim().length < 2 ? "Escribe tu nombre." : "")
      ].every(Boolean);
      if (!ok) {
        $("[aria-invalid='true']", fEvento)?.focus();
        return;
      }
      const lineas = [
        "¡Hola, The Deck! 👋 Quiero cotizar un evento:",
        "",
        `🎉 ${f.tipo.value}`,
        `📅 ${fechaLarga(fecha.value)}`,
        `🕗 ${hora.value || "Hora por definir"}`,
        `👥 ${n} personas`,
        `📍 ${f.area.value || "Área por definir"}`,
        `🍽️ ${f.menu.value || "Menú por definir"}`,
        f.presupuesto.value ? `💵 Presupuesto por persona: ${f.presupuesto.value}` : null,
        `🙋 ${f.nombre.value.trim()}`,
        f.nota.value.trim() ? `📝 ${f.nota.value.trim()}` : null,
        "",
        "¿Me envían una propuesta? ¡Gracias!"
      ].filter((l) => l !== null);
      abrirWhatsApp(lineas.join("\n"));
    });
  }

  /* ------------------------------------------------------------ Carrusel de favoritos */
  $$("[data-carrusel]").forEach((car) => {
    const pista = $("[data-pista]", car);
    const prev = $("[data-prev]", car);
    const next = $("[data-next]", car);
    const barraP = $("[data-progreso]", car);
    const hueco = () => parseFloat(getComputedStyle(pista).columnGap) || 0;

    const actualizar = () => {
      const max = pista.scrollWidth - pista.clientWidth;
      const visto = (pista.scrollLeft + pista.clientWidth) / pista.scrollWidth;
      barraP.style.setProperty("--p", Math.min(1, visto).toFixed(3));
      if (prev) prev.disabled = pista.scrollLeft <= 2;
      if (next) next.disabled = pista.scrollLeft >= max - 2;
    };
    const mover = (dir) => pista.scrollBy({ left: dir * (pista.clientWidth + hueco()), behavior: reduce ? "auto" : "smooth" });
    prev && prev.addEventListener("click", () => mover(-1));
    next && next.addEventListener("click", () => mover(1));
    pista.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    actualizar();

    // Arrastre con el mouse (escritorio)
    let x0 = 0;
    let s0 = 0;
    let arrastrando = false;
    let movio = false;
    pista.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      arrastrando = true;
      movio = false;
      x0 = e.clientX;
      s0 = pista.scrollLeft;
      pista.setPointerCapture(e.pointerId);
    });
    pista.addEventListener("pointermove", (e) => {
      if (!arrastrando) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 4 && !movio) {
        movio = true;
        pista.classList.add("is-arrastrando");
      }
      if (movio) pista.scrollLeft = s0 - dx;
    });
    const soltar = () => {
      if (!arrastrando) return;
      arrastrando = false;
      if (!movio) return;
      // Acomodar a la tarjeta más cercana
      const tarjetas = [...pista.children];
      const base = tarjetas[0].offsetLeft;
      const cerca = tarjetas.reduce((a, t) => (Math.abs(t.offsetLeft - base - pista.scrollLeft) < Math.abs(a.offsetLeft - base - pista.scrollLeft) ? t : a));
      pista.scrollTo({ left: cerca.offsetLeft - base, behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => pista.classList.remove("is-arrastrando"), 350);
    };
    pista.addEventListener("pointerup", soltar);
    pista.addEventListener("pointercancel", soltar);
    pista.addEventListener("dragstart", (e) => e.preventDefault());
  });

  /* ------------------------------------------------------------ Mapa bajo demanda */
  $$("[data-cargar-mapa]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const caja = btn.closest("[data-mapa]");
      const f = document.createElement("iframe");
      f.src = `https://www.google.com/maps?q=${C.geo.lat},${C.geo.lng}&hl=es&z=17&output=embed`;
      f.title = "Mapa de The Deck en Google Maps";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.allowFullscreen = true;
      caja.replaceChildren(f);
    });
  });

  /* ------------------------------------------------------------ Varios */
  $$("[data-anio]").forEach((el) => {
    el.textContent = nowDR().iso.slice(0, 4);
  });
})();
