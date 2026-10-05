/* Kukka Beach — ÚNICO lugar para los datos del negocio.
   El build (tools/build.py) también lee este archivo: canonical, Open Graph,
   JSON-LD y el QR salen de aquí. Mantén el objeto como JSON válido
   (comillas dobles, sin comas finales). */
window.KUKKA_CONFIG = {
  "SITE_URL": "https://jonasjavier.github.io/propuestas/kukka-beach",
  "nombre": "Kukka Beach Restaurant",
  "nombreCorto": "Kukka Beach",
  "grupo": "Alkquimia",
  "chef": "Paolo De Vita",
  "telefono": "+18097082619",
  "telefonoVisible": "809-708-2619",
  "whatsapp": "18097950107",
  "whatsappVisible": "809-795-0107",
  "instagram": "https://www.instagram.com/kukkabeach/",
  "instagramUsuario": "@kukkabeach",
  "tripadvisor": "https://www.tripadvisor.com/Restaurant_Review-g663484-d13293053-Reviews-Kukka_Beach_Restaurant-Bayahibe_La_Altagracia_Province_Dominican_Republic.html",
  "direccion": {
    "calle": "Playa pública de Bayahíbe",
    "sector": "Dominicus",
    "ciudad": "Bayahíbe",
    "provincia": "La Altagracia",
    "codigoPostal": "23000",
    "pais": "DO",
    "referencia": "En la arena de la playa pública de Bayahíbe, entre los resorts de la playa y el puerto de donde salen las lanchas a Saona."
  },
  "coordenadas": { "lat": 18.3738508, "lng": -68.8428389 },
  "plusCode": "95F4+GV Dominicus",
  "zonaHoraria": "America/Santo_Domingo",
  "horario": {
    "_nota": "Minutos desde la medianoche. Si el cierre pasa de 1440 cruza la medianoche (ej. 25:00 = 1500). Índice 0 = domingo.",
    "0": [[600, 1350]],
    "1": [[600, 1350]],
    "2": [[600, 1350]],
    "3": [[600, 1350]],
    "4": [[600, 1350]],
    "5": [[600, 1350]],
    "6": [[600, 1350]]
  },
  "reservas": {
    "intervaloMin": 30,
    "ultimaReservaAntesDelCierreMin": 60,
    "maxPersonas": 20
  },
  "impuestos": { "itbis": 0.18, "servicio": 0.10 },
  "rangoPrecios": "RD$ 400 – 2,000",
  "valoraciones": [
    { "fuente": "Tripadvisor", "nota": 4.5, "max": 5, "total": 301, "fecha": "2026-10-04", "url": "https://www.tripadvisor.com/Restaurant_Review-g663484-d13293053-Reviews-Kukka_Beach_Restaurant-Bayahibe_La_Altagracia_Province_Dominican_Republic.html" },
    { "fuente": "Google", "nota": 4.2, "max": 5, "total": 661, "fecha": "2026-10-04", "url": "https://www.google.com/maps/place/Kukka+Beach+Restaurant/@18.3738508,-68.8428389,17z" }
  ]
};
