/* La Casita de Mary · navegación, estado abierto/cerrado, reservas, pedido,
   barra móvil, carrusel, "¿A qué hora sale tu lancha?", galería y mapa. */
(function () {
  "use strict";

  var C = window.CASITA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var LANG = params.get("lang") === "en" ? "en" : "es";
  var EN = LANG === "en";

  /* ---------- Textos dinámicos (ES / EN) ---------- */
  var S = {
    es: {
      days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      am: "a. m.", pm: "p. m.",
      openUntil: function (t, art) { return "Abierto ahora · hasta " + art + " " + t; },
      soon: function (t, art) { return "Cierra pronto · a " + art + " " + t; },
      opensToday: function (t, art) { return "Abre hoy a " + art + " " + t; },
      opensTomorrow: function (t, art) { return "Abre mañana a " + art + " " + t; },
      opensDay: function (d, t, art) { return "Abre el " + d + " a " + art + " " + t; },
      closedTxt: "Cerrado", today: "Hoy", tomorrow: "Mañana", rests: "descansa",
      add: "Agregar", added: "Agregado", noPhoto: "Receta de la casa",
      origin: { ve: "Venezolana", mar: "Del mar" },
      tags: { popular: "Lo más pedido", chef: "De la casa", nuevo: "Nuevo", veg: "Vegetariano", picante: "Picante" },
      asap: "Lo antes posible", whenOpen: "Cuando abran",
      errDate: "Elige una fecha.", errPast: "Esa fecha ya pasó.", errClosed: "Ese día la casita descansa. Elige otro.",
      errTime: "Elige una hora.", errName: "Escribe tu nombre para la reserva.", errAddr: "Escribe la dirección o el hotel.",
      errEmpty: "Agrega al menos un plato.", errForm: "Revisa los campos marcados.",
      noSlots: "No quedan horas hoy", now: "Ahora"
    },
    en: {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      am: "a.m.", pm: "p.m.",
      openUntil: function (t) { return "Open now · until " + t; },
      soon: function (t) { return "Closing soon · at " + t; },
      opensToday: function (t) { return "Opens today at " + t; },
      opensTomorrow: function (t) { return "Opens tomorrow at " + t; },
      opensDay: function (d, t) { return "Opens " + d + " at " + t; },
      closedTxt: "Closed", today: "Today", tomorrow: "Tomorrow", rests: "closed",
      add: "Add", added: "Added", noPhoto: "House recipe",
      origin: { ve: "Venezuelan", mar: "From the sea" },
      tags: { popular: "Most ordered", chef: "House special", nuevo: "New", veg: "Vegetarian", picante: "Spicy" },
      asap: "As soon as possible", whenOpen: "When you open",
      errDate: "Pick a date.", errPast: "That date has passed.", errClosed: "We're closed that day. Pick another one.",
      errTime: "Pick a time.", errName: "Add your name for the booking.", errAddr: "Add the address or hotel.",
      errEmpty: "Add at least one dish.", errForm: "Please check the highlighted fields.",
      noSlots: "No times left today", now: "Now"
    }
  }[LANG];

  /* ---------- Hora de Santo Domingo ---------- */
  function toMin(hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; }

  function sdNow() {
    // ?now=2026-10-06T22:40 permite simular una hora (hora de Santo Domingo)
    var sim = params.get("now");
    if (sim && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sim)) {
      var a = sim.split(/[-T:]/).map(Number);
      var dow = new Date(Date.UTC(a[0], a[1] - 1, a[2])).getUTCDay();
      return { y: a[0], m: a[1], d: a[2], dow: dow, min: a[3] * 60 + a[4] };
    }
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: C.timezone, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
    return { y: +parts.year, m: +parts.month, d: +parts.day, dow: wd, min: (+parts.hour % 24) * 60 + +parts.minute };
  }

  function dateOffset(now, k) {
    var dt = new Date(Date.UTC(now.y, now.m - 1, now.d + k));
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), dow: dt.getUTCDay() };
  }
  function iso(o) { return o.y + "-" + String(o.m).padStart(2, "0") + "-" + String(o.d).padStart(2, "0"); }
  function longDate(o) {
    return EN ? S.days[o.dow] + ", " + S.months[o.m - 1] + " " + o.d : S.days[o.dow] + " " + o.d + " de " + S.months[o.m - 1];
  }

  // 7:00 a. m. · 9:30 p. m. · 12:00 p. m.
  function fmt(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? S.am : S.pm);
  }
  function art(min) { min = ((min % 1440) + 1440) % 1440; var h = Math.floor(min / 60) % 12; return h === 1 ? "la" : "las"; }

  function spansFor(dow) { return (C.hours[String(dow)] || []).map(function (s) { var o = toMin(s[0]), c = toMin(s[1]); return [o, c <= o ? c + 1440 : c]; }); }

  function intervals(now) {
    var out = [];
    for (var k = -1; k <= 7; k++) {
      var dow = ((now.dow + k) % 7 + 7) % 7;
      spansFor(dow).forEach(function (s) { out.push({ s: k * 1440 + s[0], e: k * 1440 + s[1] }); });
    }
    return out.sort(function (a, b) { return a.s - b.s; });
  }

  function computeStatus(now) {
    now = now || sdNow();
    var list = intervals(now), t = now.min, i;
    for (i = 0; i < list.length; i++) {
      if (list[i].s <= t && t < list[i].e) {
        var left = list[i].e - t;
        return left <= 30
          ? { state: "soon", text: S.soon(fmt(list[i].e), art(list[i].e)) }
          : { state: "open", text: S.openUntil(fmt(list[i].e), art(list[i].e)) };
      }
    }
    for (i = 0; i < list.length; i++) {
      if (list[i].s > t) {
        var k = Math.floor(list[i].s / 1440), at = list[i].s;
        var txt = k === 0 ? S.opensToday(fmt(at), art(at))
          : k === 1 ? S.opensTomorrow(fmt(at), art(at))
          : S.opensDay(S.days[(now.dow + k) % 7], fmt(at), art(at));
        return { state: "closed", text: txt };
      }
    }
    return { state: "closed", text: S.closedTxt };
  }
  window.casitaStatus = computeStatus; // útil para probar horarios

  function paintStatus() {
    var st = computeStatus();
    $$("[data-status]").forEach(function (el) {
      el.dataset.state = st.state;
      var t = $("[data-status-text]", el);
      if (t) t.textContent = st.text;
    });
    paintHours();
    paintMoments();
    paintClosing(st);
  }

  /* ---------- Tabla de horario ---------- */
  function paintHours() {
    var body = $("[data-hours] tbody");
    if (!body) return;
    var now = sdNow(), order = [1, 2, 3, 4, 5, 6, 0], html = "";
    order.forEach(function (dow) {
      var spans = spansFor(dow);
      var val = spans.length
        ? spans.map(function (s) { return fmt(s[0]) + " – " + fmt(s[1]); }).join(" · ")
        : '<span class="closed">' + S.closedTxt + "</span>";
      var name = S.days[dow].charAt(0).toUpperCase() + S.days[dow].slice(1);
      html += '<tr class="' + (dow === now.dow ? "is-today" : "") + '"><th scope="row">' + name + "</th><td>" + val + "</td></tr>";
    });
    body.innerHTML = html;
  }

  /* ---------- Momentos del día ---------- */
  function paintMoments() {
    var items = $$("[data-moment]");
    if (!items.length) return;
    var now = sdNow(), m = now.min, open = spansFor(now.dow).some(function (s) { return s[0] <= m && m < s[1]; });
    var cur = !open ? null : m < 11 * 60 ? "desayuno" : m < 17 * 60 ? "almuerzo" : "noche";
    items.forEach(function (li) {
      var on = li.dataset.moment === cur;
      li.classList.toggle("is-now", on);
      var tag = $(".moment__now", li);
      if (on && !tag) { tag = document.createElement("span"); tag.className = "moment__now"; tag.textContent = EN ? "Right now" : "Ahora mismo"; li.appendChild(tag); }
      if (!on && tag) tag.remove();
    });
  }

  function paintClosing(st) {
    var h = $("[data-closing-title]");
    if (!h) return;
    var now = sdNow(), tonight = spansFor(now.dow).some(function (s) { return s[1] > 17 * 60 && now.min < s[1] - 60; });
    h.textContent = EN
      ? (tonight ? "Shall we save you a table tonight?" : "Shall we save you a table tomorrow?")
      : (tonight ? "¿Te guardamos una mesa esta noche?" : "¿Te guardamos una mesa para mañana?");
  }

  /* ---------- Encabezado y barra inferior ---------- */
  var header = $("[data-header]"), tabbar = $("[data-tabbar]"), lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (tabbar) {
      var atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 40;
      var hide = y > lastY + 4 && y > 220 && !atEnd;
      var show = y < lastY - 4 || atEnd || y < 120;
      if (hide) { tabbar.classList.add("is-hidden"); document.body.classList.add("tabbar-hidden"); }
      else if (show) { tabbar.classList.remove("is-hidden"); document.body.classList.remove("tabbar-hidden"); }
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Diálogos ---------- */
  function openDialog(d) {
    if (!d || d.open) return;
    d.showModal();
    document.body.classList.add("has-dialog");
  }
  window.casitaOpenDialog = openDialog;
  $$("dialog").forEach(function (d) {
    d.addEventListener("close", function () {
      if (!$("dialog[open]")) document.body.classList.remove("has-dialog");
    });
    d.addEventListener("click", function (e) {
      if (e.target === d && !d.classList.contains("nav-sheet") && !d.classList.contains("lightbox")) d.close();
      if (e.target.closest("[data-close]")) d.close();
    });
  });

  var navSheet = $("#nav-sheet");
  $$("[data-open-nav]").forEach(function (b) { b.addEventListener("click", function () { openDialog(navSheet); }); });
  if (navSheet) $$("a", navSheet).forEach(function (a) { a.addEventListener("click", function () { navSheet.close(); }); });

  /* ---------- Stepper genérico ---------- */
  function initStepper(el, onChange) {
    var out = $("[data-value]", el), min = +el.dataset.min || 1, max = +el.dataset.max || 99;
    el.value = +out.textContent || min;
    $$("[data-step]", el).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = Math.min(max, Math.max(min, el.value + +b.dataset.step));
        el.value = v; out.textContent = v;
        if (onChange) onChange(v);
      });
    });
  }

  /* ---------- WhatsApp ---------- */
  function openWA(text) {
    var url = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text);
    var w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
    return url;
  }
  window.casitaWA = function (text) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text); };

  /* ---------- Reservas ---------- */
  var dlgRes = $("#dlg-reserva"), formRes = $("#form-reserva");
  function slotsFor(dateIso, now) {
    var p = dateIso.split("-").map(Number);
    var dow = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
    var isToday = dateIso === iso(now), out = [];
    spansFor(dow).forEach(function (s) {
      for (var t = s[0]; t <= s[1] - 60; t += 30) {
        if (!isToday || t >= now.min + 30) out.push(t);
      }
    });
    return { dow: dow, slots: out, closed: !spansFor(dow).length };
  }
  function fillRes() {
    if (!formRes) return;
    var now = sdNow(), f = formRes.fecha;
    f.min = iso(now);
    f.max = iso(dateOffset(now, 90));
    if (!f.value) {
      for (var k = 0; k < 8; k++) { var c = iso(dateOffset(now, k)); if (slotsFor(c, now).slots.length) { f.value = c; break; } }
    }
    fillTimes();
  }
  function fillTimes() {
    var now = sdNow(), sel = formRes.hora, prev = sel.value, info = slotsFor(formRes.fecha.value || iso(now), now);
    sel.innerHTML = "";
    if (!info.slots.length) {
      sel.innerHTML = '<option value="">' + (info.closed ? S.closedTxt : S.noSlots) + "</option>";
      return;
    }
    // por defecto, la cena: 7:30 p. m. si existe
    info.slots.forEach(function (t) {
      var o = document.createElement("option");
      o.value = fmtEs(t); o.textContent = fmt(t);
      sel.appendChild(o);
    });
    var pref = fmtEs(19 * 60 + 30);
    sel.value = prev && $$("option", sel).some(function (o) { return o.value === prev; }) ? prev
      : $$("option", sel).some(function (o) { return o.value === pref; }) ? pref : sel.options[0].value;
  }
  function setErr(form, name, msg) {
    var field = $('[data-field="' + name + '"]', form);
    if (!field) return;
    field.classList.toggle("is-invalid", !!msg);
    var input = $("input, select", field);
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    $(".field__err", field).textContent = msg || "";
  }
  if (formRes) {
    var resPeople = $("[data-stepper]", formRes);
    initStepper(resPeople, function (v) { $("[data-group-hint]", formRes).hidden = v < 13; });
    formRes.fecha.addEventListener("change", function () { setErr(formRes, "fecha", ""); fillTimes(); });
    formRes.nombre.addEventListener("input", function () { setErr(formRes, "nombre", ""); });
    formRes.addEventListener("submit", function (e) {
      e.preventDefault();
      var now = sdNow(), f = formRes.fecha.value, ok = true, first = null;
      var dErr = "", tErr = "", nErr = "";
      if (!f) dErr = S.errDate;
      else if (f < iso(now)) dErr = S.errPast;
      else if (slotsFor(f, now).closed) dErr = S.errClosed;
      if (!dErr && !formRes.hora.value) tErr = S.errTime;
      if (formRes.nombre.value.trim().length < 2) nErr = S.errName;
      setErr(formRes, "fecha", dErr); setErr(formRes, "hora", tErr); setErr(formRes, "nombre", nErr);
      [["fecha", dErr], ["hora", tErr], ["nombre", nErr]].forEach(function (p) { if (p[1]) { ok = false; first = first || formRes[p[0]]; } });
      var msgEl = $("[data-form-msg]", dlgRes);
      msgEl.textContent = ok ? "" : S.errForm;
      if (!ok) { first.focus(); return; }
      var p = f.split("-").map(Number), dObj = { y: p[0], m: p[1], d: p[2], dow: new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() };
      var n = resPeople.value, area = (formRes.querySelector('input[name="area"]:checked') || {}).value;
      var lines = [
        "¡Hola, Casita de Mary! 👋 Quisiera reservar una mesa:",
        "",
        "📅 " + cap(longDateEs(dObj)),
        "🕖 " + formRes.hora.value,
        "👥 " + n + (n === 1 ? " persona" : " personas"),
        "🪑 " + area
      ];
      if (formRes.ocasion.value) lines.push("🎉 " + formRes.ocasion.value);
      lines.push("🙋 A nombre de: " + formRes.nombre.value.trim());
      if (formRes.nota.value.trim()) lines.push("📝 " + formRes.nota.value.trim());
      lines.push("", "¿Me la confirman, por favor? ¡Gracias!");
      openWA(lines.join("\n"));
      dlgRes.close();
    });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function longDateEs(o) {
    var d = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    var m = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return d[o.dow] + " " + o.d + " de " + m[o.m - 1];
  }
  function fmtEs(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60, h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? "a. m." : "p. m.");
  }
  $$("[data-open-reserva]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (navSheet && navSheet.open) navSheet.close();
      fillRes();
      openDialog(dlgRes);
    });
  });

  /* ---------- Pedido (carrito) ---------- */
  var KEY = "casita-pedido", cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { cart = []; }
  var ITEMS = {};
  if (window.MENU) window.MENU.categories.forEach(function (c) { c.items.forEach(function (it) { ITEMS[it.id] = it; }); });
  cart = cart.filter(function (l) { return ITEMS[l.id] && l.qty > 0; });

  function money(n) { return "RD$ " + n.toLocaleString("en-US"); }
  window.casitaMoney = money;
  function itemName(it) { return EN && it.en ? it.en : it.name; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* sin almacenamiento */ } }
  function total() { return cart.reduce(function (s, l) { return s + ITEMS[l.id].price * l.qty; }, 0); }
  function count() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }

  function addToCart(id, btn) {
    var line = cart.find(function (l) { return l.id === id; });
    if (line) line.qty++; else cart.push({ id: id, qty: 1 });
    save(); paintCart(true);
    if (btn) {
      btn.classList.add("is-added");
      var lbl = $("[data-add-label]", btn);
      if (lbl) lbl.textContent = S.added;
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.classList.remove("is-added"); if (lbl) lbl.textContent = S.add; }, 1300);
    }
  }
  window.casitaAdd = addToCart;
  function setQty(id, q) {
    cart = cart.map(function (l) { return l.id === id ? { id: id, qty: q } : l; }).filter(function (l) { return l.qty > 0; });
    save(); paintCart();
  }

  var cartBar = $("[data-cart-bar]"), dlgCart = $("#dlg-pedido"), formCart = $("#form-pedido");
  function paintCart(bump) {
    var n = count();
    if (cartBar) {
      cartBar.hidden = n === 0;
      document.body.classList.toggle("has-cart", n > 0);
      $("[data-cart-count]", cartBar).textContent = n + (EN ? (n === 1 ? " item" : " items") : (n === 1 ? " plato" : " platos"));
      $("[data-cart-bar-total]", cartBar).textContent = money(total());
      if (bump) { cartBar.classList.remove("is-bump"); void cartBar.offsetWidth; cartBar.classList.add("is-bump"); }
    }
    if (!dlgCart) return;
    var list = $("[data-cart-list]", dlgCart);
    list.innerHTML = cart.map(function (l) {
      var it = ITEMS[l.id];
      return '<li class="cart-line"><b>' + esc(itemName(it)) + "</b><small>" + money(it.price) + " × " + l.qty + " = " + money(it.price * l.qty) + "</small>" +
        '<div class="stepper"><button type="button" data-qty="' + l.id + '" data-d="-1" aria-label="Quitar uno">−</button><output>' + l.qty +
        '</output><button type="button" data-qty="' + l.id + '" data-d="1" aria-label="Agregar uno">+</button></div></li>';
    }).join("");
    $("[data-cart-empty]", dlgCart).hidden = n > 0;
    $("[data-cart-form]", dlgCart).hidden = n === 0;
    $("[data-cart-foot]", dlgCart).hidden = n === 0;
    $("[data-cart-total]", dlgCart).textContent = money(total());
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add, add); return; }
    var q = e.target.closest("[data-qty]");
    if (q) {
      var line = cart.find(function (l) { return l.id === q.dataset.qty; });
      if (line) setQty(line.id, line.qty + +q.dataset.d);
    }
  });

  function fillWhen() {
    if (!formCart) return;
    var sel = formCart.cuando, now = sdNow(), st = computeStatus(now), html = "";
    if (st.state !== "closed") {
      html += '<option value="Lo antes posible">' + S.asap + "</option>";
      spansFor(now.dow).forEach(function (s) {
        var start = Math.ceil((now.min + 45) / 30) * 30;
        for (var t = start; t <= s[1] - 30; t += 30) html += '<option value="' + fmtEs(t) + '">' + fmt(t) + "</option>";
      });
    } else {
      html += '<option value="Cuando abran">' + S.whenOpen + " · " + st.text.replace(/^Abre |^Opens /, "") + "</option>";
    }
    sel.innerHTML = html;
  }
  if (cartBar) cartBar.addEventListener("click", function () { fillWhen(); paintCart(); openDialog(dlgCart); });
  if (formCart) {
    $$('input[name="entrega"]', formCart).forEach(function (r) {
      r.addEventListener("change", function () { $("[data-address]", formCart).hidden = formCart.entrega.value !== "Delivery"; });
    });
    formCart.addEventListener("submit", function (e) {
      e.preventDefault();
      var msgEl = $("[data-form-msg]", dlgCart), first = null;
      if (!cart.length) { msgEl.textContent = S.errEmpty; return; }
      var deliv = formCart.entrega.value === "Delivery";
      var aErr = deliv && formCart.direccion.value.trim().length < 4 ? S.errAddr : "";
      var nErr = formCart.nombre.value.trim().length < 2 ? S.errName : "";
      setErr(formCart, "direccion", aErr); setErr(formCart, "nombre", nErr);
      if (aErr) first = formCart.direccion; else if (nErr) first = formCart.nombre;
      msgEl.textContent = first ? S.errForm : "";
      if (first) { first.focus(); return; }
      var lines = ["¡Hola, Casita de Mary! 👋 Quiero hacer un pedido:", ""];
      cart.forEach(function (l) { var it = ITEMS[l.id]; lines.push("• " + l.qty + " × " + it.name + " — " + money(it.price * l.qty)); });
      lines.push("", "Total: " + money(total()) + " (impuestos no incluidos)");
      lines.push(deliv ? "🛵 Delivery a: " + formCart.direccion.value.trim() : "🏠 Lo recojo en la casita");
      lines.push("🕒 Para: " + formCart.cuando.value);
      lines.push("💳 Pago: " + formCart.pago.value);
      lines.push("🙋 A nombre de: " + formCart.nombre.value.trim());
      if (formCart.nota.value.trim()) lines.push("📝 " + formCart.nota.value.trim());
      lines.push("", "¡Gracias!");
      openWA(lines.join("\n"));
      cart = []; save(); paintCart(); dlgCart.close();
    });
    formCart.nombre.addEventListener("input", function () { setErr(formCart, "nombre", ""); });
    formCart.direccion.addEventListener("input", function () { setErr(formCart, "direccion", ""); });
  }

  /* ---------- Favoritos (carrusel) ---------- */
  function srcset(name) {
    var d = window.IMG && window.IMG[name];
    if (!d) return null;
    var base = d.w.filter(function (w) { return w <= 800; }).pop() || d.w[0];
    return {
      src: "/propuestas/la-casita-de-mary/assets/img/" + name + "-" + base + ".webp",
      set: d.w.map(function (w) { return "/propuestas/la-casita-de-mary/assets/img/" + name + "-" + w + ".webp " + w + "w"; }).join(", "),
      w: base, h: Math.round(base * d.r)
    };
  }
  window.casitaSrcset = srcset;
  function flagSvg(o) { return o === "ve" ? '<svg aria-hidden="true"><use href="#flag-ve"/></svg>' : o === "mar" ? '<svg aria-hidden="true" style="width:14px;height:14px;color:var(--mar)"><use href="#i-boat"/></svg>' : ""; }

  var favTrack = $("[data-fav-track]");
  if (favTrack && window.MENU) {
    var favs = [];
    window.MENU.categories.forEach(function (c) { c.items.forEach(function (it) { if (it.fav) favs.push(it); }); });
    favTrack.innerHTML = favs.map(function (it) {
      var im = it.img && srcset(it.img), media;
      if (im) {
        media = '<img src="' + im.src + '" srcset="' + im.set + '" sizes="(min-width: 1280px) 300px, (min-width: 1024px) 380px, 78vw" width="' + im.w + '" height="' + im.h + '" alt="' + esc(itemName(it)) + '" loading="lazy" decoding="async">';
      } else {
        media = '<div class="dish__type pizarra"><small>' + (it.origin === "mar" ? S.origin.mar : S.noPhoto) + "</small><b>" + esc(itemName(it)) + "</b></div>";
      }
      var desc = EN && it.descEn ? it.descEn : it.desc;
      return '<li class="dish"><div class="dish__media">' + media + '<span class="dish__price">' + money(it.price) + "</span></div>" +
        '<div class="dish__body"><h3>' + esc(itemName(it)) + "</h3><p>" + esc(desc) + "</p>" +
        '<div class="dish__foot"><span class="origin">' + flagSvg(it.origin) + (it.origin ? S.origin[it.origin] : "") + "</span>" +
        '<button class="add-btn" type="button" data-add="' + it.id + '" aria-label="' + S.add + ": " + esc(itemName(it)) + '"><svg aria-hidden="true"><use href="#i-plus"/></svg><span data-add-label>' + S.add + "</span></button></div></div></li>";
    }).join("");
  }

  $$("[data-carousel]").forEach(function (root) {
    var track = $(".carousel__track", root), bar = $("[data-bar]", root), prev = $("[data-prev]", root), next = $("[data-next]", root);
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var frac = track.clientWidth / track.scrollWidth;
      var pos = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = Math.max(12, frac * 100) + "%";
      bar.style.marginLeft = (pos * (100 - Math.max(12, frac * 100))) + "%";
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: track.clientWidth, behavior: "smooth" }); });
    // arrastre con el mouse en escritorio
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("button")) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
      if (moved) { track.scrollLeft = sl - dx; e.preventDefault(); }
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      if (!moved) return;
      track.classList.remove("is-dragging");
      // ajusta a la tarjeta más cercana
      var cards = $$(".dish", track), best = 0, bd = Infinity, pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - pad - track.scrollLeft); if (d < bd) { bd = d; best = i; } });
      if (cards[best]) track.scrollTo({ left: cards[best].offsetLeft - pad, behavior: "smooth" });
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    update();
    setTimeout(update, 300);
  });

  /* ---------- ¿A qué hora sale tu lancha? ---------- */
  var boatDays = $("[data-boat-days]");
  if (boatDays) {
    var bNow = sdNow(), state = { k: 1, dep: "08:00", dest: "Isla Saona", n: 2 };
    var BUFFER = 20, WALK = C.port.walkMin, EAT = 35;
    var html = "";
    for (var k = 0; k < 7; k++) {
      var o = dateOffset(bNow, k), closed = !spansFor(o.dow).length;
      var label = k === 0 ? S.today : k === 1 ? S.tomorrow : S.daysShort[o.dow] + " " + o.d;
      html += '<button class="chip' + (closed ? " is-closed" : "") + '" type="button" aria-pressed="false" data-k="' + k + '">' + label + (closed ? " <small>· " + S.rests + "</small>" : "") + "</button>";
    }
    boatDays.innerHTML = html;
    // por defecto: mañana (o el próximo día abierto)
    for (var j = 1; j < 7; j++) { if (spansFor(dateOffset(bNow, j).dow).length) { state.k = j; break; } }

    function pick(group, attr, val) { $$(".chip", group).forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset[attr] === String(val))); }); }
    boatDays.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; state.k = +c.dataset.k; plan(true); });
    $("[data-boat-times]").addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; state.dep = c.dataset.v; plan(true); });
    $("[data-boat-dest]").addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; state.dest = c.dataset.v; plan(false); });
    initStepper($("[data-boat-people]"), function (v) { state.n = v; plan(false); });

    var SUG = EN
      ? { "Isla Saona": "a reina pepiada and a fresh juice", "Isla Catalina": "a cheese arepa and brewed coffee", "a bucear": "something light: empanadas and coffee", "de excursión": "empanadas and brewed coffee" }
      : { "Isla Saona": "una reina pepiada y un jugo natural", "Isla Catalina": "una arepa de queso y un café colado", "a bucear": "algo ligero: empanadas y café colado", "de excursión": "empanadas y un café colado" };
    var DEST = EN
      ? { "Isla Saona": "You sail to Saona Island", "Isla Catalina": "You sail to Catalina Island", "a bucear": "You head out diving", "de excursión": "Your boat leaves" }
      : { "Isla Saona": "Zarpas rumbo a Isla Saona", "Isla Catalina": "Zarpas rumbo a Isla Catalina", "a bucear": "Sales a bucear", "de excursión": "Sale tu excursión" };

    function li(t, title, sub) { return "<li><time>" + fmt(t) + "</time><div><b>" + title + "</b><span>" + sub + "</span></div></li>"; }

    function plan(animate) {
      pick(boatDays, "k", state.k);
      pick($("[data-boat-times]"), "v", state.dep);
      pick($("[data-boat-dest]"), "v", state.dest);
      var now = sdNow(), day = dateOffset(now, state.k), spans = spansFor(day.dow);
      var dep = toMin(state.dep), atPort = dep - BUFFER, leave = atPort - WALK;
      var tl = $("[data-boat-timeline]"), note = $("[data-boat-note]"), wa = $("[data-boat-wa]");
      var dayTxt = (state.k === 0 ? (EN ? "today" : "hoy") : state.k === 1 ? (EN ? "tomorrow" : "mañana") : (EN ? "on " : "el ") + longDate(day));
      var dayEs = state.k === 0 ? "hoy" : state.k === 1 ? "mañana" : "el " + longDateEs(day);
      var who = state.n === 1 ? (EN ? "You" : "Desayunas") : (EN ? "The " + state.n + " of you" : "Los " + state.n + " desayunan");
      var msg;

      if (!spans.length) {
        tl.innerHTML = "";
        var nd = null;
        for (var q = 1; q <= 7 && !nd; q++) { var cand = dateOffset(now, state.k + q); if (spansFor(cand.dow).length) nd = cand; }
        var ndOpen = nd ? fmt(spansFor(nd.dow)[0][0]) : "";
        note.textContent = EN
          ? "We're closed that day. See you " + (nd ? S.days[nd.dow] + " from " + ndOpen : "soon")
          : "Ese día la casita descansa. Te esperamos el " + (nd ? S.days[nd.dow] + " desde las " + ndOpen : "día siguiente");
        msg = "¡Hola, Casita de Mary! 👋 " + cap(dayEs) + " salimos " + destEs(state.dest) + ". ¿Qué nos recomiendan para el desayuno?";
        wa.href = window.casitaWA(msg);
        return;
      }
      var open = spans[0][0];
      var arrive = Math.floor((leave - EAT) / 5) * 5;
      if (state.k === 0 && now.min > arrive) arrive = Math.ceil(now.min / 5) * 5;
      if (arrive < open) arrive = open;
      var time = leave - arrive;

      if (state.k === 0 && now.min >= dep) {
        tl.innerHTML = "";
        note.textContent = EN ? "That boat has already left. Pick another time or day." : "Esa lancha ya salió. Elige otra hora u otro día.";
        wa.href = window.casitaWA("¡Hola, Casita de Mary! 👋 ¿Qué tienen hoy para desayunar?");
        return;
      }
      var togo = time < 20;
      var sug = SUG[state.dest] || SUG["de excursión"];
      var html = "";
      if (togo) {
        var pickUp = Math.max(open, Math.floor((leave - 5) / 5) * 5);
        if (state.k === 0 && now.min > pickUp) pickUp = Math.ceil(now.min / 5) * 5;
        html += li(pickUp, EN ? "Pick up breakfast to go" : "Recoges tu desayuno para llevar", EN ? "Order it on WhatsApp and it'll be ready: " + sug + "." : "Encárgalo por WhatsApp y te lo tenemos listo: " + sug + ".");
        leave = pickUp + 2;
        note.textContent = EN ? "Your boat leaves early, so breakfast to go is the safest bet." : "Tu lancha sale temprano: lo más seguro es el desayuno para llevar.";
        msg = "¡Hola, Casita de Mary! 👋 " + cap(dayEs) + " salimos " + destEs(state.dest) + " en la lancha de las " + fmtEs(dep) + " (somos " + state.n + "). ¿Nos pueden preparar el desayuno para llevar? Pasamos a recogerlo a las " + fmtEs(pickUp) + " ¡Gracias!";
      } else {
        html += li(arrive, EN ? "You arrive at the casita" : "Llegas a la casita", (EN ? "Order " : "Pide ") + sug + ". " + who + (EN ? " eat without rushing." : " sin prisa."));
        note.textContent = time < 30 ? (EN ? "Tight but doable: order as soon as you sit down." : "Un desayuno exprés: pide apenas te sientes.") : "";
        msg = "¡Hola, Casita de Mary! 👋 " + cap(dayEs) + " salimos " + destEs(state.dest) + " en la lancha de las " + fmtEs(dep) + " (somos " + state.n + "). ¿Nos tienen el desayuno listo a las " + fmtEs(arrive) + "? ¡Gracias!";
      }
      html += li(leave, EN ? "Walk to the port" : "Sales caminando al puerto", EN ? "190 m along Calle La Bahía, about 3 minutes." : "190 m por la calle La Bahía, unos 3 minutos.");
      html += li(leave + WALK, EN ? "You're at Bayahíbe port" : "Llegas al Puerto de Bayahíbe", EN ? "With time to spare to find your group." : "Con margen para encontrar a tu grupo.");
      html += li(dep, DEST[state.dest] || DEST["de excursión"], EN ? "Have a great day! Lunch is here too when you get back." : "¡Buen viaje! A la vuelta, el almuerzo también está aquí.");
      tl.innerHTML = html;
      wa.href = window.casitaWA(msg);

      var map = $("[data-boat-map]");
      if (animate && map) { map.classList.remove("is-walking"); void map.offsetWidth; map.classList.add("is-walking"); }
    }
    function destEs(d) { return d === "Isla Saona" ? "para Isla Saona" : d === "Isla Catalina" ? "para Isla Catalina" : d; }
    plan(false);
    var bm = $("[data-boat-map]");
    if ("IntersectionObserver" in window && bm) {
      var io0 = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { bm.classList.add("is-walking"); io0.disconnect(); } }, { threshold: 0.5 });
      io0.observe(bm);
    } else if (bm) bm.classList.add("is-walking");
  }

  /* ---------- Mapa bajo demanda ---------- */
  $$("[data-map-load]").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = b.closest("[data-map]"), f = document.createElement("iframe");
      f.src = box.dataset.embed; f.title = "Mapa de La Casita de Mary en Bayahíbe"; f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade"; f.allowFullscreen = true;
      box.innerHTML = ""; box.appendChild(f);
    });
  });

  /* ---------- Galería y visor ---------- */
  var gal = $("[data-gallery]");
  if (gal) {
    var lb = $("#lightbox"), lbImg = $("[data-lb-img]"), idx = 0, visible = [];
    var filters = $("[data-gal-filters]");
    filters.addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      $$(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      $$("li", gal).forEach(function (li) { li.hidden = !(c.dataset.filter === "all" || li.dataset.cat === c.dataset.filter); });
    });
    function show(i) {
      visible = $$("li:not([hidden]) [data-full]", gal);
      idx = (i + visible.length) % visible.length;
      var b = visible[idx], name = b.dataset.full, thumb = $("img", b), d = window.IMG[name];
      lbImg.src = "/propuestas/la-casita-de-mary/assets/img/" + name + "-" + d.w[d.w.length - 1] + ".webp";
      lbImg.alt = thumb.alt;
      $("[data-lb-cap]").textContent = thumb.alt;
      $("[data-lb-count]").textContent = (idx + 1) + " / " + visible.length;
    }
    gal.addEventListener("click", function (e) {
      var b = e.target.closest("[data-full]"); if (!b) return;
      visible = $$("li:not([hidden]) [data-full]", gal);
      show(visible.indexOf(b)); openDialog(lb);
    });
    $("[data-lb-prev]").addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    var tx = null;
    var stage = $("[data-lb-stage]");
    stage.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener("click", function (e) { if (e.target === stage) lb.close(); });
  }

  /* ---------- Imprimir carta ---------- */
  $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });

  /* ---------- Aparición sutil ---------- */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Inglés (?lang=en) ---------- */
  if (EN && window.I18N_EN) {
    var D = window.I18N_EN;
    document.documentElement.lang = "en";
    $$("[data-i18n]").forEach(function (el) { var v = D[el.dataset.i18n]; if (v) el.textContent = v; });
    $$("[data-i18n-html]").forEach(function (el) { var v = D[el.dataset.i18nHtml]; if (v) el.innerHTML = v; });
    $$("[data-i18n-ph]").forEach(function (el) { var v = D[el.dataset.i18nPh]; if (v) el.placeholder = v; });
    $$('a[href^="/"]').forEach(function (a) {
      var h = a.getAttribute("href");
      if (a.dataset.lang) return;
      var parts = h.split("#");
      a.setAttribute("href", parts[0] + (parts[0].indexOf("?") > -1 ? "&" : "?") + "lang=en" + (parts[1] ? "#" + parts[1] : ""));
    });
  }
  $$("[data-lang]").forEach(function (a) { a.setAttribute("aria-current", String(a.dataset.lang === LANG)); });

  paintStatus();
  paintCart();
  onScroll();
  setInterval(paintStatus, 60000);
})();
