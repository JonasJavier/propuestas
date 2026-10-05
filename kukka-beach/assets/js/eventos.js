/* Kukka Beach — formulario de cotización de eventos por WhatsApp. */
(function () {
  "use strict";
  var K = window.Kukka;
  var form = document.querySelector("[data-form-evento]");
  if (!K || !form) return;
  var t = K.t;
  var f = form.elements;
  var hoy = K.enRD(new Date()).iso;
  f.fecha.min = K.sumarDias(hoy, 1);
  f.fecha.max = K.sumarDias(hoy, 540);

  ["fecha", "personas", "nombre"].forEach(function (n) {
    f[n].addEventListener("input", function () { K.limpiarError(f[n]); });
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = true;
    if (!f.fecha.value) ok = K.marcarError(f.fecha, t("ev_error_fecha", "Elige la fecha del evento.")) && ok;
    else if (f.fecha.value <= hoy) ok = K.marcarError(f.fecha, t("ev_error_pasada", "Para eventos necesitamos al menos un día de margen.")) && ok;
    var n = parseInt(f.personas.value, 10);
    if (!n || n < 2) ok = K.marcarError(f.personas, t("ev_error_personas", "Indica cuántas personas vienen (mínimo 2).")) && ok;
    if (f.nombre.value.trim().length < 2) ok = K.marcarError(f.nombre, t("error_nombre", "Escribe tu nombre.")) && ok;
    if (!ok) { form.querySelector("[aria-invalid='true']").focus(); return; }

    var espacio = form.querySelector("input[name='espacio']:checked");
    var lineas = [
      t("ev_saludo", "¡Hola, Kukka Beach! Quiero organizar un evento con ustedes:"),
      "",
      "*" + t("ev_tipo", "Evento") + ":* " + f.tipo.value,
      "*" + t("msg_fecha", "Fecha") + ":* " + K.capitalizar(K.fechaLarga(f.fecha.value)) + " · " + f.momento.value.toLowerCase(),
      "*" + t("msg_personas", "Personas") + ":* " + n,
      "*" + t("ev_espacio", "Espacio") + ":* " + espacio.parentNode.querySelector("span").textContent
    ];
    if (f.presupuesto.value) lineas.push("*" + t("ev_presupuesto", "Presupuesto por persona") + ":* " + f.presupuesto.value);
    lineas.push("*" + t("msg_nombre", "A nombre de") + ":* " + f.nombre.value.trim());
    if (f.detalles.value.trim()) lineas.push("*" + t("ev_detalles", "Detalles") + ":* " + f.detalles.value.trim());
    lineas.push("", t("ev_cierre", "¿Me envían una propuesta? ¡Gracias!"));
    K.abrirWhatsApp(lineas.join("\n"));
  });
})();
