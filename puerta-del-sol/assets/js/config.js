/*
 * ÚNICO lugar con los datos del negocio.
 * Lo usan el sitio (main.js) y tools/build.py (canonical, Open Graph, JSON-LD y QR).
 * Formato: JSON estricto entre las marcas (comillas dobles, sin comas al final).
 *
 * Horario: días 0 = domingo … 6 = sábado. Si "cierra" es menor que "abre",
 * el turno termina después de medianoche (ej. 08:00 → 02:00 del día siguiente).
 * Un día cerrado se escribe como [].
 */
window.SITE = /* CONFIG:START */ {
  "name": "Puerta del Sol",
  "tagline": "Donde el sabor y el sol se encuentran",
  "siteUrl": "https://puertadelsolrd.netlify.app",
  "proposalMode": true,
  "phone": "+18092416281",
  "phoneDisplay": "(809) 241-6281",
  "whatsapp": "18092416281",
  "instagram": "https://www.instagram.com/puertadelsolrd/",
  "instagramHandle": "@puertadelsolrd",
  "tripadvisor": "https://www.tripadvisor.com/Restaurant_Review-g635962-d6209603-Reviews-Puerta_Del_Sol-Santiago_de_los_Caballeros_Santiago_Province_Dominican_Republic.html",
  "address": {
    "street": "Calle del Sol No. 23, esq. Daniel Espinal",
    "area": "Zona Monumental",
    "city": "Santiago de los Caballeros",
    "region": "Santiago",
    "postalCode": "51000",
    "country": "DO"
  },
  "reference": "Frente al Monumento a los Héroes de la Restauración",
  "geo": { "lat": 19.4495726, "lng": -70.6940416 },
  "mapsUrl": "https://maps.app.goo.gl/Y9KDsjFZutVM7tGt9",
  "directionsUrl": "https://www.google.com/maps/dir/?api=1&destination=19.4495726,-70.6940416",
  "wazeUrl": "https://waze.com/ul?ll=19.4495726,-70.6940416&navigate=yes",
  "mapEmbed": "https://www.google.com/maps?q=Puerta+del+Sol,+Santiago+de+los+Caballeros&ll=19.4495726,-70.6940416&z=17&output=embed",
  "timezone": "America/Santo_Domingo",
  "hours": {
    "0": [["08:00", "02:00"]],
    "1": [["08:00", "02:00"]],
    "2": [["08:00", "02:00"]],
    "3": [["08:00", "02:00"]],
    "4": [["08:00", "02:00"]],
    "5": [["08:00", "02:00"]],
    "6": [["08:00", "02:00"]]
  },
  "lastReservation": "23:30",
  "cuisine": ["Dominicana", "Caribeña", "Internacional", "Sushi"],
  "priceRange": "RD$600 – RD$1,500 por persona",
  "rating": { "value": "4.3", "source": "Google Maps", "count": "más de 2,300 opiniones", "date": "octubre 2026" }
} /* CONFIG:END */;
