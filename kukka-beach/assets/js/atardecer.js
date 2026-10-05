/* Kukka Beach — "El atardecer de hoy".
   Calcula la puesta de sol real en la playa de Dominicus para hoy y los próximos
   6 días, dibuja el arco del sol y propone la hora de reserva para verlo. */
(function () {
  "use strict";
  var K = window.Kukka;
  var seccion = document.querySelector("[data-atardecer]");
  if (!K || !seccion) return;

  var t = K.t;
  var titulo = seccion.querySelector("[data-sol-titulo]");
  var lead = seccion.querySelector("[data-sol-lead]");
  var cta = seccion.querySelector("[data-sol-cta]");
  var botonCta = seccion.querySelector("[data-reservar-atardecer]");
  var semana = seccion.querySelector("[data-semana]");
  var horizonte = seccion.querySelector("[data-horizonte]");
  var punto = seccion.querySelector("[data-sol-punto]");
  var dorada = seccion.querySelector("[data-dorada]");
  var etqSale = seccion.querySelector("[data-sol-sale]");
  var etqPone = seccion.querySelector("[data-sol-pone]");

  // Elipse del arco en el SVG (viewBox 400 × 230): centro (200, 170), radios 170 × 140.
  var CX = 200, CY = 170, RX = 170, RY = 140;
  function puntoArco(f) {
    var a = Math.PI * Math.max(0, Math.min(1, f));
    return { x: CX - RX * Math.cos(a), y: CY - RY * Math.sin(a) };
  }

  var hoy = K.enRD(new Date()).iso;
  var seleccion = null;

  function pintar(iso) {
    seleccion = iso;
    var s = K.sol(iso);
    var info = K.horaAtardecer(iso);
    var pone = K.formatoHora(K.minutosDeInstante(s.pone));
    var sale = K.formatoHora(K.minutosDeInstante(s.sale));
    var hora = '<span class="sol-hora">' + pone + "</span>";

    var frase;
    if (iso === hoy) frase = t("sol_titulo_hoy", "Hoy el sol se pone a las {h}", { h: hora });
    else if (iso === K.sumarDias(hoy, 1)) frase = t("sol_titulo_manana", "Mañana el sol se pone a las {h}", { h: hora });
    else frase = t("sol_titulo_dia", "El {dia} el sol se pone a las {h}", { dia: K.nombreDia(iso, "long"), h: hora });
    titulo.innerHTML = K.capitalizar(frase);

    if (info) {
      lead.textContent = t("sol_lead", "La luz dorada empieza a las {dorada}: reserva a las {reserva} y lo ves completo desde tu mesa en la arena.", {
        dorada: K.formatoHora(info.dorada), reserva: K.formatoHora(info.reserva)
      });
      var h = K.formatoHora(info.reserva);
      if (iso === hoy) cta.textContent = t("sol_cta_hoy", "Reservar hoy a las {h}", { h: h });
      else if (iso === K.sumarDias(hoy, 1)) cta.textContent = t("sol_cta_manana", "Reservar a las {h}", { h: h });
      else cta.textContent = t("sol_cta_dia", "Reservar a las {h}", { h: h });
      botonCta.dataset.fecha = iso;
      botonCta.dataset.hora = String(info.reserva);
    }

    etqSale.textContent = sale;
    etqPone.textContent = pone;

    // Arco de la hora dorada y posición del sol
    var total = s.pone - s.sale;
    var fDorada = (s.dorada - s.sale) / total;
    var a = puntoArco(fDorada), b = puntoArco(1);
    dorada.setAttribute("d", "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) + " A" + RX + " " + RY + " 0 0 1 " + b.x.toFixed(1) + " " + b.y.toFixed(1));

    var f;
    if (iso === hoy) {
      f = (Date.now() - s.sale) / total;
      horizonte.toggleAttribute("data-noche", f < 0 || f > 1);
    } else {
      f = fDorada + (1 - fDorada) * 0.5;
      horizonte.removeAttribute("data-noche");
    }
    var p = puntoArco(f);
    punto.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");

    semana.querySelectorAll("button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.dataset.fecha === iso ? "true" : "false");
    });
  }

  function construirSemana() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 7; i++) {
      var iso = K.sumarDias(hoy, i);
      var s = K.sol(iso);
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.fecha = iso;
      var dia = i === 0 ? t("sol_hoy", "Hoy") : K.nombreDia(iso, "short").replace(".", "");
      var numero = parseInt(iso.slice(8), 10);
      var pone = K.formatoHora(K.minutosDeInstante(s.pone));
      btn.innerHTML =
        '<span class="semana-dia">' + dia + "</span>" +
        '<span class="semana-fecha">' + numero + '<span class="sr"> · ' + K.fechaLarga(iso) + "</span></span>" +
        '<span class="semana-hora"><span class="sr">' + t("sol_aria", "el sol se pone a las {h}", { h: "" }) + "</span>" + pone + "</span>";
      btn.addEventListener("click", function (ev) { pintar(ev.currentTarget.dataset.fecha); });
      li.appendChild(btn);
      frag.appendChild(li);
    }
    semana.appendChild(frag);
  }

  function pintarAvisos() {
    var s = K.sol(hoy);
    var ahora = Date.now();
    var iso = ahora > s.pone ? K.sumarDias(hoy, 1) : hoy;
    var pone = K.formatoHora(K.minutosDeInstante(K.sol(iso).pone));
    var hero = document.querySelector("[data-sol-hero]");
    if (hero) {
      hero.textContent = iso === hoy
        ? t("sol_hero_hoy", "Hoy el sol se pone a las {h}", { h: pone })
        : t("sol_hero_manana", "Mañana el sol se pone a las {h}", { h: pone });
    }
    var momento = document.querySelector("[data-sol-momento]");
    if (momento) momento.textContent = t("sol_momento", "Atardecer · {h}", { h: pone });
    return iso;
  }

  botonCta.addEventListener("click", function () {
    K.abrirReserva({ fecha: botonCta.dataset.fecha, hora: parseInt(botonCta.dataset.hora, 10), area: "arena" });
  });

  construirSemana();
  pintar(pintarAvisos());
  setInterval(function () { if (seleccion === hoy) pintar(hoy); pintarAvisos(); }, 5 * 60000);
})();
