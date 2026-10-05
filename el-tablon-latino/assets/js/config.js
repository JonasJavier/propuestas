/* =====================================================================
   El Tablón Latino · configuración del sitio
   ÚNICO lugar para nombre, contacto, dirección, coordenadas, horario y
   SITE_URL. tools/build.py también lee este archivo (canonical, Open Graph,
   JSON-LD, QR), así que después de cambiar algo corre:  python tools/build.py
   Formato: JSON dentro de JS. Los comentarios van en líneas propias (//).
   ===================================================================== */
window.SITIO = {
  "nombre": "El Tablón Latino",
  // Dirección pública del sitio. Cambia aquí cuando haya dominio propio.
  "SITE_URL": "https://eltablonlatino.netlify.app",

  "telefono": "+18095813813",
  "telefonoTexto": "809-581-3813",
  // Por confirmar con el cliente: número con WhatsApp para reservas.
  "whatsapp": "18095813813",
  "email": "eltablon@gmail.com",

  "direccion": {
    "calle": "C. del Sol #12",
    "sector": "Área Monumental",
    "ciudad": "Santiago de los Caballeros",
    "provincia": "Santiago",
    "codigoPostal": "51000",
    "pais": "DO",
    "referencia": "Frente al Monumento a los Héroes de la Restauración"
  },
  "geo": { "lat": 19.4496318, "lng": -70.6943071 },

  "enlaces": {
    "maps": "https://www.google.com/maps/dir/?api=1&destination=19.4496318%2C-70.6943071",
    "waze": "https://waze.com/ul?ll=19.4496318%2C-70.6943071&navigate=yes",
    "mapaEmbed": "https://www.google.com/maps?q=El%20Tabl%C3%B3n%20Latino%2C%20C.%20del%20Sol%2012%2C%20Santiago%20de%20los%20Caballeros&ll=19.4496318,-70.6943071&z=17&output=embed",
    "instagram": "https://www.instagram.com/eltablonlatino/",
    "instagramUsuario": "@eltablonlatino",
    "facebook": "https://www.facebook.com/tablonlatino/",
    "tripadvisor": "https://www.tripadvisor.com/Restaurant_Review-g635962-d3583462-Reviews-El_Tablon_Latino-Santiago_de_los_Caballeros_Santiago_Province_Dominican_Republic.html"
  },

  "zonaHoraria": "America/Santo_Domingo",
  // Un elemento por día: 0 = domingo ... 6 = sábado. Horas en 24 h.
  // Si cierra después de medianoche, usa 25:00, 26:00... (26:00 = 2:00 a. m.).
  // Para un día cerrado pon null.
  "horario": [
    { "abre": "11:00", "cierra": "24:00" },
    { "abre": "11:00", "cierra": "24:00" },
    { "abre": "11:00", "cierra": "24:00" },
    { "abre": "11:00", "cierra": "24:00" },
    { "abre": "11:00", "cierra": "24:00" },
    { "abre": "11:00", "cierra": "26:00" },
    { "abre": "11:00", "cierra": "26:00" }
  ],
  // Última reserva: X minutos antes del cierre. Intervalo entre horas: 30 min.
  "reservas": { "minutosAntesDelCierre": 60, "intervalo": 30, "diasAdelante": 60, "maxPersonas": 20 },

  "fundacion": "1995-09-29",
  "rangoPrecios": "RD$ 1,000 – 2,500"
};
