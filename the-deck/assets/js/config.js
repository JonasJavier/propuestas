/* The Deck · datos del negocio en UN solo lugar.
   Cambia aquí el teléfono, el WhatsApp, la dirección o el horario y vuelve a
   compilar (python tools/build.py): la web, el JSON-LD y el QR se actualizan solos. */
window.DECK = {
  name: "The Deck",
  legalName: "Ambis SRL",
  tagline: "Café · Bakery · Healthy",

  /* Dirección pública del sitio: canonical, Open Graph, JSON-LD y QR salen de aquí */
  SITE_URL: "https://thedecksantiago.netlify.app",

  /* Teléfonos con código de país (1) para enlaces tel: y wa.me */
  phone: "18093823549",
  phoneDisplay: "809-382-3549",
  /* WhatsApp para reservas, eventos y pedidos. Hoy se usa la línea de delivery
     que aparece en su Instagram: POR CONFIRMAR con el cliente. */
  whatsapp: "18299548015",
  whatsappDisplay: "829-954-8015",

  address: {
    street: "Av. Rafael Vidal 51, Residencial Thomas IV",
    city: "Santiago de los Caballeros",
    province: "Santiago",
    postalCode: "51000",
    country: "DO",
    reference: "Al final de la calle, al fondo: el letrero está sobre la Av. Rafael Vidal."
  },
  geo: { lat: 19.4463082, lng: -70.6654046 },
  mapsPlace: "https://maps.google.com/?cid=14862672497566946701",

  /* Horario por día (0 = domingo … 6 = sábado), en hora de Santo Domingo.
     Cada turno es [abre, cierra] en 24 h. Si cierra después de medianoche,
     escribe la hora real (ej. ["18:00", "01:00"]) y el sitio lo entiende. */
  hours: {
    0: [],
    1: [["08:30", "23:00"]],
    2: [["08:30", "23:00"]],
    3: [["08:30", "23:00"]],
    4: [["08:30", "23:00"]],
    5: [["08:30", "23:00"]],
    6: [["09:00", "23:00"]]
  },
  kitchenClose: "22:30",
  breakfastUntil: "12:00",
  /* Última hora que se ofrece para reservar, en minutos antes del cierre de cocina */
  lastSeatingBeforeKitchen: 30,

  areas: ["Terraza", "Salón climatizado", "Área de fumadores"],

  social: {
    instagram: "https://www.instagram.com/the.deckrd/",
    instagramHandle: "@the.deckrd",
    facebook: "https://www.facebook.com/the.deckrd/",
    tripadvisor: "https://www.tripadvisor.com/Restaurant_Review-g635962-d14887447-Reviews-The_Deck-Santiago_de_los_Caballeros_Santiago_Province_Dominican_Republic.html"
  },

  /* Calificaciones públicas consultadas el 4 de octubre de 2026 (ver README · Fuentes) */
  rating: {
    google: { value: 4.7, count: 1517, date: "octubre de 2026" },
    tripadvisor: { value: 4.4, count: 13, date: "octubre de 2026" }
  }
};
