/* ==========================================================================
   Paladart · datos del negocio
   ÚNICO lugar para cambiar nombre, teléfono, WhatsApp, dirección, coordenadas,
   horario y la URL pública del sitio. tools/build.py también lee SITE_URL de
   aquí para la canonical, Open Graph, JSON-LD y el QR del pie.
   ========================================================================== */
window.NEGOCIO = {
  SITE_URL: "https://paladart.netlify.app",

  name: "Paladart",
  legalName: "Paladart · Parrilla Argentina y Cocina Mediterránea",
  founded: 2014, // primera mención pública: foro DR1, julio de 2014 (por confirmar)
  tagline: "Parrilla argentina y cocina mediterránea",

  // Teléfono y WhatsApp: solo dígitos, con el 1 de República Dominicana
  phone: "18095261855",
  phoneDisplay: "809-526-1855",
  whatsapp: "18095261855",
  email: "catering.paladart@gmail.com",

  address: {
    street: "Boulevard de Juan Dolio, frente al Banco Popular (Plaza Villas del Mar, local L-103)",
    reference: "Frente al Banco Popular, en el boulevard",
    city: "Juan Dolio",
    province: "San Pedro de Macorís",
    postalCode: "21000",
    country: "DO",
    plusCode: "CJJ2+C2 Playa Juan Dolio",
  },
  geo: { lat: 18.4310061, lng: -69.3999873 },
  mapsCid: "489617296391512644",

  social: {
    instagram: "https://www.instagram.com/paladart.restaurante/",
    instagramHandle: "@paladart.restaurante",
    facebook: "https://www.facebook.com/Paladart.restaurant/",
    tripadvisor: "https://www.tripadvisor.com/Restaurant_Review-g317145-d4885652-Reviews-Paladart-Juan_Dolio_San_Pedro_de_Macoris_Province_Dominican_Republic.html",
  },

  timeZone: "America/Santo_Domingo",

  /* Horario por día (0 = domingo … 6 = sábado), en hora de Santo Domingo.
     Cada día admite varios turnos ["HH:MM", "HH:MM"]. Si el cierre es menor que
     la apertura (p. ej. ["18:00", "01:00"]), el turno termina al día siguiente.
     Fuente: biografía de su Instagram (octubre 2026): «Martes - Domingos: 12pm - 11pm».
     Google Maps dice de 11:00 a. m. a 11:30 p. m. (por confirmar). */
  hours: {
    0: [["12:00", "23:00"]],
    1: [],
    2: [["12:00", "23:00"]],
    3: [["12:00", "23:00"]],
    4: [["12:00", "23:00"]],
    5: [["12:00", "23:00"]],
    6: [["12:00", "23:00"]],
  },
  lastBookingBeforeClose: 60,
  bookingStepMinutes: 30,
  maxPartySize: 30,

  // Impuestos que se suman a la carta («Impuestos no incluidos»)
  taxes: { itbis: 0.18, service: 0.10 },

  rating: {
    google: { value: 4.5, count: 1215, date: "2026-10" },
    tripadvisor: { value: 4.4, count: 163, rank: "#1 de 40 restaurantes en Juan Dolio", date: "2026-10" },
  },
};
