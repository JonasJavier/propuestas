/*
 * ÚNICO lugar para los datos del negocio.
 * tools/build.py también lee este bloque (entre CONFIG y END), así que
 * debe seguir siendo JSON válido: comillas dobles y sin comas al final.
 *
 * Horario: días 0 = domingo … 6 = sábado. Cada día es una lista de tramos
 * ["apertura", "cierre"] en 24 h. Si el cierre es menor que la apertura,
 * el tramo cruza la medianoche (ej. ["18:00", "01:00"]).
 */
window.CASITA = /*CONFIG*/{
  "SITE_URL": "https://jonasjavier.github.io/propuestas/la-casita-de-mary",
  "name": "La Casita de Mary",
  "legalName": "La Casita de Mary Con Sabor Venezolano",
  "tagline": "Sabor venezolano en Bayahíbe",
  "phone": "+18293484802",
  "phoneDisplay": "(829) 348-4802",
  "whatsapp": "18293484802",
  "email": "lacasitademaryrestaurante@gmail.com",
  "address": {
    "street": "Carretera Bayahíbe 1, calle Tomasa Cedeño",
    "sector": "Los Melones",
    "city": "Bayahíbe",
    "province": "La Altagracia",
    "postalCode": "23000",
    "country": "DO",
    "reference": "A 190 m del Puerto de Bayahíbe, 3 minutos a pie por la calle La Bahía"
  },
  "geo": { "lat": 18.3677701, "lng": -68.8395738 },
  "port": { "name": "Puerto de Bayahíbe", "lat": 18.3689524, "lng": -68.8405617, "walkMin": 3, "meters": 190 },
  "timezone": "America/Santo_Domingo",
  "hours": {
    "0": [["07:00", "19:00"]],
    "1": [],
    "2": [["07:00", "23:00"]],
    "3": [["07:00", "23:00"]],
    "4": [["07:00", "23:00"]],
    "5": [["07:00", "23:00"]],
    "6": [["07:00", "23:00"]]
  },
  "social": {
    "facebook": "https://www.facebook.com/CasitaDeMarySaborVenezolano/",
    "tripadvisor": "https://www.tripadvisor.com/Restaurant_Review-g663484-d9704293-Reviews-La_Casita_De_Mary_Con_Sabor_Venezolano-Bayahibe_La_Altagracia_Province_Dominican_.html",
    "google": "https://maps.google.com/?cid=11104894822441794890"
  },
  "maps": {
    "directions": "https://www.google.com/maps/dir/?api=1&destination=18.3677701,-68.8395738",
    "waze": "https://waze.com/ul?ll=18.3677701,-68.8395738&navigate=yes",
    "embed": "https://www.google.com/maps?q=18.3677701,-68.8395738&z=17&output=embed"
  },
  "ratings": [
    { "source": "Google", "value": 4.7, "count": 108, "checked": "octubre de 2026" },
    { "source": "Tripadvisor", "value": 4.7, "count": 57, "checked": "octubre de 2026" }
  ],
  "priceRange": "RD$500–1,500",
  "cuisine": ["Venezolana", "Caribeña", "Mariscos"],
  "payments": "Efectivo, Visa y Mastercard"
}/*END*/;
