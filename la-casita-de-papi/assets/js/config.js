/* ==========================================================================
   La Casita de Papi · datos del negocio
   ÚNICO lugar para cambiar nombre, teléfono, WhatsApp, dirección, coordenadas,
   horario y la URL pública del sitio. tools/build.py también lee SITE_URL de
   aquí para la canonical, Open Graph, JSON-LD y el QR del pie.
   ========================================================================== */
window.CASITA = {
  SITE_URL: "https://lacasitadepapi.netlify.app",

  name: "La Casita de Papi",
  legalName: "La Casita de Don Alfredo",
  founded: 1995,
  tagline: "Mariscos con los pies en la arena",

  // Teléfono y WhatsApp: solo dígitos, con el 1 de República Dominicana
  phone: "18095719244",
  phoneDisplay: "809-571-9244",
  whatsapp: "18095719244",

  address: {
    street: "Carretera Sosúa–Cabarete (calle principal), playa central",
    reference: "En la arena de la playa central, entre las palmas",
    city: "Cabarete",
    province: "Puerto Plata",
    postalCode: "57000",
    country: "DO",
    plusCode: "QH2V+434 Cabarete",
  },
  geo: { lat: 19.7502745, lng: -70.4073077 },

  social: {
    instagram: "https://www.instagram.com/lacasitadepapi/",
    instagramHandle: "@lacasitadepapi",
    facebook: "https://www.facebook.com/lacasitadepapi",
    tripadvisor: "https://www.tripadvisor.com/Restaurant_Review-g317144-d1652063-Reviews-La_Casita_De_Papi-Cabarete_Puerto_Plata_Province_Dominican_Republic.html",
  },

  timeZone: "America/Santo_Domingo",

  /* Horario por día (0 = domingo … 6 = sábado), en hora de Santo Domingo.
     Cada día admite varios turnos ["HH:MM", "HH:MM"]. Si el cierre es menor que
     la apertura (p. ej. ["18:00", "01:00"]), el turno termina al día siguiente.
     Fuente: TripAdvisor, octubre 2026 (por confirmar con el restaurante). */
  hours: {
    0: [["13:00", "21:00"]],
    1: [],
    2: [["13:00", "22:00"]],
    3: [["13:00", "22:00"]],
    4: [["13:00", "22:00"]],
    5: [["13:00", "22:00"]],
    6: [["13:00", "21:00"]],
  },
  // Reservas: primera y última hora que se ofrecen (minutos antes del cierre)
  lastBookingBeforeClose: 60,
  bookingStepMinutes: 30,
  maxPartySize: 20,

  /* Veda de langosta en República Dominicana: del 1 de marzo al 30 de junio.
     Los Langostinos a la Papi vuelven el 1 de julio (así lo anuncia su Facebook). */
  langostinoSeason: { closedFrom: [3, 1], closedTo: [6, 30] },

  rating: {
    tripadvisor: { value: 4.3, count: 1071, rank: "#6 de 115 restaurantes en Cabarete", date: "2026-10" },
    google: { value: 4.3, count: 1203, date: "2026-10" },
  },
};
