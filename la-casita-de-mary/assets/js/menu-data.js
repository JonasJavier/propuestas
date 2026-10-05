/*
 * La carta. Es lo único que hay que editar para cambiar platos y precios.
 *
 * Cada plato:
 *   id        identificador único (sin espacios)
 *   name/en   nombre en español / inglés
 *   desc/descEn  descripción corta
 *   price     precio en RD$ (número)
 *   tags      popular · chef · nuevo · veg · picante
 *   origin    "ve" (receta venezolana) · "mar" (del mar)
 *   img       nombre de la foto en assets/img (opcional)
 *   fav       true = aparece en "Lo que más se pide" del inicio
 *   propuesto true = plato o precio propuesto, falta confirmarlo con el cliente
 *
 * Fuente de los precios reales: carta impresa del restaurante (foto en Tripadvisor).
 */
window.MENU = {
  "categories": [
    {
      "id": "desayunos", "name": "Desayunos", "en": "Breakfast",
      "note": "Desde las 7:00 a. m.", "noteEn": "From 7:00 a.m.",
      "items": [
        { "id": "empanadas", "name": "Empanadas venezolanas", "en": "Venezuelan empanadas", "desc": "De queso, pollo o carne, recién fritas.", "descEn": "Cheese, chicken or beef, freshly fried.", "price": 150, "tags": ["popular"], "origin": "ve", "img": "empanadas", "propuesto": true },
        { "id": "mangu", "name": "Mangú con los tres golpes", "en": "Mangú with “los tres golpes”", "desc": "Puré de plátano con salami, queso frito y huevo.", "descEn": "Mashed plantain with salami, fried cheese and egg.", "price": 350, "tags": [], "propuesto": true },
        { "id": "cafe", "name": "Café colado", "en": "Brewed coffee", "desc": "El de todas las mañanas en la casita.", "descEn": "Our every-morning coffee.", "price": 100, "tags": [], "propuesto": true }
      ]
    },
    {
      "id": "arepas", "name": "Arepas", "en": "Arepas",
      "note": "Hechas al momento", "noteEn": "Made to order",
      "items": [
        { "id": "arepa-reina", "name": "Reina pepiada", "en": "Reina pepiada (The Queen)", "desc": "Pollo, mayonesa y aguacate.", "descEn": "Chicken, mayonnaise and avocado.", "price": 300, "tags": ["popular"], "origin": "ve", "img": "reina-pepiada", "fav": true },
        { "id": "arepa-pabellon", "name": "Arepa de pabellón", "en": "Pabellón arepa", "desc": "Carne de res, habichuela negra, plátano maduro frito y queso.", "descEn": "Beef, black beans, fried ripe plantain and cheese.", "price": 300, "tags": ["popular"], "origin": "ve" },
        { "id": "arepa-vegetariana", "name": "Arepa vegetariana", "en": "Vegetarian arepa", "desc": "Queso, lechuga, tomate, aguacate y cebolla.", "descEn": "Cheese, lettuce, tomato, avocado and onion.", "price": 300, "tags": ["veg"], "origin": "ve" },
        { "id": "arepa-queso", "name": "Arepa de queso", "en": "Cheese arepa", "desc": "Rellena de queso.", "descEn": "Filled with cheese.", "price": 250, "tags": ["veg"], "origin": "ve" },
        { "id": "arepa-pollo", "name": "Arepa de pollo", "en": "Chicken arepa", "desc": "Rellena de pollo.", "descEn": "Filled with chicken.", "price": 250, "tags": [], "origin": "ve" },
        { "id": "arepa-res", "name": "Arepa de res", "en": "Beef arepa", "desc": "Rellena de carne de res.", "descEn": "Filled with beef.", "price": 250, "tags": [], "origin": "ve" },
        { "id": "arepa-pescado", "name": "Arepa de pescado", "en": "Fish arepa", "desc": "Rellena de pescado.", "descEn": "Filled with fish.", "price": 250, "tags": [], "origin": "ve" },
        { "id": "arepa-viuda", "name": "Arepa viuda", "en": "Plain arepa", "desc": "Sola, para acompañar lo que quieras.", "descEn": "Plain, to go with anything.", "price": 80, "tags": ["veg"], "origin": "ve" }
      ]
    },
    {
      "id": "tipicos", "name": "Platos típicos", "en": "Typical dishes",
      "note": "Recetas de Venezuela", "noteEn": "Venezuelan recipes",
      "items": [
        { "id": "pabellon-criollo", "name": "Pabellón criollo", "en": "Pabellón criollo", "desc": "Arroz, habichuela negra, carne de res y plátano maduro frito.", "descEn": "Rice, black beans, beef and fried ripe plantain.", "price": 500, "tags": ["chef", "popular"], "origin": "ve", "img": "pabellon", "fav": true },
        { "id": "patacon", "name": "Patacón", "en": "Patacón", "desc": "Tostón con res o pollo, ensalada de repollo y zanahoria, salsa y queso.", "descEn": "Toston with chicken or beef, cabbage and carrot salad, sauce and cheese.", "price": 450, "tags": ["popular"], "origin": "ve", "img": "patacon", "fav": true },
        { "id": "cachapa-queso", "name": "Cachapa con queso", "en": "Cachapa with cheese", "desc": "Panqueca de maíz tierno con queso.", "descEn": "Sweet corn pancake with cheese.", "price": 400, "tags": ["popular", "veg"], "origin": "ve", "fav": true },
        { "id": "cachapa-pollo-res", "name": "Cachapa con pollo o res", "en": "Chicken or beef cachapa", "desc": "Panqueca de maíz tierno con pollo o carne de res.", "descEn": "Sweet corn pancake with chicken or beef.", "price": 500, "tags": [], "origin": "ve" }
      ]
    },
    {
      "id": "entradas", "name": "Entradas", "en": "Appetizers",
      "items": [
        { "id": "tequenos", "name": "Tequeños de queso", "en": "Cheese tequeños", "desc": "Palitos de masa rellenos de queso, dorados y crujientes.", "descEn": "Crispy dough sticks filled with cheese.", "price": 250, "tags": ["popular", "veg"], "origin": "ve", "fav": true },
        { "id": "salpicon", "name": "Salpicón de mariscos", "en": "Mixed seafood salad", "desc": "Mariscos frescos en ensalada fría.", "descEn": "Fresh seafood in a cold salad.", "price": 500, "tags": [], "origin": "mar", "img": "salpicon-tostones", "fav": true },
        { "id": "calamares", "name": "Calamares rebozados", "en": "Fried squid", "desc": "Con salsa tártara.", "descEn": "With tartar sauce.", "price": 400, "tags": [], "origin": "mar" },
        { "id": "guacamole", "name": "Guacamole con pan tostado", "en": "Guacamole with toast", "desc": "Aguacate machacado al momento.", "descEn": "Avocado, mashed to order.", "price": 300, "tags": ["veg"] },
        { "id": "caprese", "name": "Ensalada caprese", "en": "Caprese salad", "desc": "Tomate, queso y albahaca.", "descEn": "Tomato, cheese and basil.", "price": 400, "tags": ["veg"] },
        { "id": "bruschetta", "name": "Bruschetta", "en": "Bruschetta", "desc": "Pan tostado con tomate.", "descEn": "Toasted bread with tomato.", "price": 250, "tags": ["veg"] }
      ]
    },
    {
      "id": "ensaladas", "name": "Ensaladas", "en": "Salads",
      "items": [
        { "id": "ens-camarones", "name": "Camarones y aguacate", "en": "Shrimp and avocado salad", "desc": "Camarones, aguacate, tomate cherry, lechuga y cebolla.", "descEn": "Shrimp, avocado, cherry tomato, lettuce and onion.", "price": 600, "tags": ["popular"], "origin": "mar", "img": "camarones-aguacate", "fav": true },
        { "id": "ens-atun", "name": "Ensalada de atún", "en": "Tuna salad", "desc": "Lechuga, tomate, cebolla, pimiento y aguacate.", "descEn": "Lettuce, tomato, onion, pepper and avocado.", "price": 500, "tags": [], "origin": "mar" },
        { "id": "ens-mixta", "name": "Ensalada mixta", "en": "Mixed salad", "desc": "Verde y fresca, para acompañar.", "descEn": "Fresh green side salad.", "price": 400, "tags": ["veg"] }
      ]
    },
    {
      "id": "mar", "name": "Del mar", "en": "From the sea",
      "note": "Según la pesca del día", "noteEn": "Depending on the day’s catch",
      "items": [
        { "id": "parrillada", "name": "Parrillada de mariscos", "en": "Grilled seafood platter", "desc": "Pescado, camarones, calamares, mejillones y langosta a la parrilla, con salsa de ajo.", "descEn": "Grilled fish, shrimp, squid, mussels and lobster with garlic sauce.", "price": 1500, "tags": ["chef"], "origin": "mar", "img": "parrillada-mariscos", "propuesto": true },
        { "id": "pescado-ajo", "name": "Pescado a la plancha con salsa de ajo", "en": "Grilled fish with garlic sauce", "desc": "Con ensalada y arroz o tostones.", "descEn": "With salad and rice or tostones.", "price": 750, "tags": ["popular"], "origin": "mar", "img": "pescado-ensalada", "propuesto": true },
        { "id": "pulpo", "name": "Pulpo a la parrilla", "en": "Grilled octopus", "desc": "Con tostones o ensalada.", "descEn": "With tostones or salad.", "price": 850, "tags": [], "origin": "mar", "img": "pulpo", "propuesto": true },
        { "id": "langosta-flameada", "name": "Langosta flameada", "en": "Flambéed lobster", "desc": "La especialidad de la casa para una noche especial.", "descEn": "Our house special for a big night.", "price": 1800, "tags": ["chef"], "origin": "mar", "img": "langosta-orilla", "propuesto": true },
        { "id": "fritura", "name": "Fritura de mariscos", "en": "Fried seafood", "desc": "Calamares, camarones y pescado, con tostones.", "descEn": "Squid, shrimp and fish, with tostones.", "price": 950, "tags": [], "origin": "mar", "propuesto": true }
      ]
    },
    {
      "id": "pastas", "name": "Pastas", "en": "Pasta",
      "note": "Salsa roja o blanca", "noteEn": "Red or white sauce",
      "items": [
        { "id": "pasta-langosta", "name": "Pasta con langosta", "en": "Lobster pasta", "desc": "En salsa roja o blanca.", "descEn": "In red or white sauce.", "price": 1200, "tags": ["chef"], "origin": "mar", "fav": true },
        { "id": "pasta-camarones", "name": "Pasta con camarones", "en": "Shrimp pasta", "desc": "En salsa roja o blanca.", "descEn": "In red or white sauce.", "price": 700, "tags": [], "origin": "mar" },
        { "id": "pasta-calamares", "name": "Pasta con calamares", "en": "Squid pasta", "desc": "En salsa roja o blanca.", "descEn": "In red or white sauce.", "price": 700, "tags": [], "origin": "mar" },
        { "id": "amatriciana", "name": "Amatriciana", "en": "Amatriciana", "desc": "Tomate y tocineta.", "descEn": "Tomato and bacon.", "price": 450, "tags": [] },
        { "id": "pomodoro", "name": "Pomodoro", "en": "Pomodoro", "desc": "Salsa de tomate de la casa.", "descEn": "House tomato sauce.", "price": 300, "tags": ["veg"] }
      ]
    },
    {
      "id": "casual", "name": "Burritos y hamburguesas", "en": "Burritos & burgers",
      "note": "Con papas fritas", "noteEn": "French fries included",
      "items": [
        { "id": "hamburguesa", "name": "Hamburguesa de pollo o res", "en": "Chicken or beef burger", "desc": "Cebolla, tomate, lechuga, queso, kétchup y mayonesa.", "descEn": "Onion, tomato, lettuce, cheese, ketchup and mayonnaise.", "price": 400, "tags": [] },
        { "id": "burrito", "name": "Burrito de pollo o res", "en": "Chicken or beef burrito", "desc": "Tomate, cebolla, lechuga, queso, kétchup y mayonesa.", "descEn": "Tomato, onion, lettuce, cheese, ketchup and mayonnaise.", "price": 400, "tags": [] }
      ]
    },
    {
      "id": "bebidas", "name": "Bebidas", "en": "Drinks",
      "items": [
        { "id": "jugo", "name": "Jugo natural", "en": "Fresh juice", "desc": "De la fruta que esté buena ese día.", "descEn": "Made with the best fruit of the day.", "price": 200, "tags": ["veg"], "propuesto": true },
        { "id": "batido", "name": "Batido", "en": "Milkshake", "desc": "Frío y espeso.", "descEn": "Cold and thick.", "price": 250, "tags": ["veg"], "img": "batido", "propuesto": true },
        { "id": "mojito", "name": "Mojito", "en": "Mojito", "desc": "Ron, menta, limón y hielo.", "descEn": "Rum, mint, lime and ice.", "price": 350, "tags": [], "propuesto": true },
        { "id": "presidente", "name": "Cerveza Presidente", "en": "Presidente beer", "desc": "Bien fría.", "descEn": "Ice cold.", "price": 200, "tags": [], "propuesto": true },
        { "id": "refresco", "name": "Refresco", "en": "Soft drink", "desc": "Lata o botella.", "descEn": "Can or bottle.", "price": 100, "tags": [], "propuesto": true }
      ]
    },
    {
      "id": "postres", "name": "Postres", "en": "Desserts",
      "items": [
        { "id": "postre-dia", "name": "Postre del día", "en": "Dessert of the day", "desc": "Pregunta cuál toca hoy.", "descEn": "Ask what we have today.", "price": 250, "tags": [] }
      ]
    }
  ]
};
