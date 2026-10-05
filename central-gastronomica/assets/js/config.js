/* Datos del negocio: un solo lugar para actualizar teléfono, WhatsApp y horario. */
window.CG_CONFIG = {
  // WhatsApp de reservas, solo dígitos con código de país
  whatsapp: '18094290000',
  timeZone: 'America/Santo_Domingo',
  mapEmbed: 'https://maps.google.com/maps?q=Central%20Gastron%C3%B3mica%2C%20Av.%20Tiradentes%2011%2C%20Santo%20Domingo&z=16&output=embed',

  // Minutos desde las 00:00. Un cierre mayor que 1440 significa después de medianoche.
  // 0 = domingo … 6 = sábado
  hours: {
    0: [720, 1440], // domingo   12:00 p. m. – 12:00 a. m.
    1: [720, 1440], // lunes
    2: [720, 1440], // martes
    3: [720, 1440], // miércoles
    4: [720, 1440], // jueves
    5: [720, 1500], // viernes   12:00 p. m. – 1:00 a. m.
    6: [720, 1500], // sábado
  },

  // Última reserva: 60 minutos antes del cierre
  lastSeatingBeforeClose: 60,
  // A partir de este número de personas se sugiere la página de eventos
  bigGroupFrom: 13,
};
