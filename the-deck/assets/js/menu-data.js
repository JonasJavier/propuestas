/* The Deck · la carta.
   Este es el ÚNICO archivo que hay que tocar para cambiar platos y precios.

   Cada plato:
     name     nombre como aparece en la carta
     desc     descripción (opcional)
     price    precio en RD$ (número)            ─┐ usa uno de los dos
     options  [["Entera", 425], ["Media", 325]] ─┘ para tamaños o variantes
     tags     "popular" (lo más pedido en reseñas), "chef" (de la casa),
              "veg" (vegetariano), "picante"
     img      foto opcional (nombre en tools/images.json)

   Fuente: carta publicada en Restaurant Guru (≈ julio 2026). Precios sin impuestos. */
window.MENU = [
  {
    id: "desayunos",
    name: "Desayunos",
    note: "Hasta el mediodía",
    items: [
      { name: "Waffles & Nutella", desc: "2 waffles dulces servidos con Nutella y fresas frescas.", price: 495, tags: ["veg"] },
      { name: "Sweet Guava Waffles", desc: "2 waffles dulces untados con mermelada de guayaba, queso crema desmenuzado y pecans caramelizadas.", price: 450, tags: ["veg"] },
      { name: "Egg & Bacon Waffle", desc: "Waffle con huevo y tocineta.", price: 495 },
      { name: "Pancakes con avena", desc: "Esponjosos pancakes con avena molida, servidos con frutas mixtas, syrup y mermelada de fresas.", price: 465, tags: ["veg"] },
      { name: "Scrambled Croissant", desc: "Croissant con huevos revueltos, jamón de pavo, tomate, rúcula, aguacate en trozos y maíz.", price: 395 },
      { name: "Mexican Bagel", desc: "Bagel integral, tomate, jamón o tocineta de pavo, queso gouda, huevo frito y guacamole.", price: 395 },
      { name: "Breakfast Tacos", desc: "2 tortillas de harina rellenas de huevos revueltos, cheddar, salchicha, tocineta crujiente, pimientos, aguacate, puerro y cilantro.", price: 495 },
      { name: "Breakfast Burger", desc: "Croissant, carne Angus, huevos revueltos con puerro y cheddar, tocineta de cerdo caramelizada y mayo especial de tocineta.", price: 595 },
      { name: "Desayuno Dominicano Deck", desc: "Plátanos maduros a la plancha, 3 salchichas, tocineta de cerdo, 2 huevos revueltos o fritos, 2 rollitos de queso mozzarella y aguacate.", price: 625, tags: ["chef"] },
      { name: "Truffled Avocado Toast", desc: "2 rodajas de pan campesino con aguacate, huevos fritos, pochados o revueltos, serrano, ajonjolí y aceite de trufa blanca.", price: 575 },
      { name: "Salmon Avocado Toast", desc: "2 rodajas de pan campesino con aguacate, huevos fritos, pochados o revueltos, salmón ahumado, cebolla blanca, ajonjolí y aceite de trufa blanca.", price: 695 },
      { name: "Pan & chocolate caliente", desc: "Rebanadas de pan campesino tostadas, con mantequilla y nuestro chocolate caliente.", price: 325, tags: ["veg"] },
      { name: "Morning Wrap", desc: "Wrap untado con mayonesa de pesto y relleno de tortilla de huevo con tocineta de pavo, cheddar, mozzarella, tomate, puerro, espinaca y albahaca.", price: 395, img: "morning-wrap" },
      { name: "Breakfast Panini Sandwich", desc: "Panini crujiente con huevos revueltos con cheddar, mozzarella, provolone, tocineta de pavo, pimientos, puerro y pesto.", price: 425 },
      { name: "Tostada Boxing", desc: "Baguette integral, tomate, queso crema, queso gouda, jamón serrano, huevo frito y rúcula.", price: 395 },
      { name: "Tuna Light", desc: "Atún en agua, maíz, pepino, tomate, cebolla, mozzarella y rúcula en pan pita, con mayonesa de oliva y aderezo de limón y orégano.", price: 525 },
      { name: "Yogurt con granola y frutas", price: 250, tags: ["veg"] },
      { name: "Fruit Parfait", desc: "Mermelada de fresa o guayaba, yogurt, granola y frutas mixtas.", price: 295, tags: ["veg"], img: "fruit-parfait" }
    ]
  },
  {
    id: "omelette",
    name: "Omelette Corner",
    note: "Elige 3 ingredientes",
    items: [
      {
        name: "Omelette a tu gusto",
        desc: "Quesos: de hoja, mozzarella, cheddar, gouda, cabra, feta, crema, provolone o parmesano. Carnes: jamón de pavo, tocineta de pavo o cerdo, jamón serrano o pepperoni. Vegetales: tomate, zucchini, berenjena, pimientos, cebolla, maíz, espinaca, albahaca, puerro o cilantro.",
        options: [["Con pan viga integral", 325], ["Con pan pita o campesino", 350], ["Con bagel o ciabatta", 375]]
      }
    ]
  },
  {
    id: "picar",
    name: "Para picar",
    items: [
      { name: "Spicy Honey Goat Cheese Croquettes", desc: "5 bolitas de queso de cabra fritas sobre miel picante, cranberries y pistachos triturados, con pan artesanal crujiente.", price: 675, tags: ["veg", "picante"] },
      { name: "Salmon Toasts", desc: "3 casabitos tostados con aguacate, salmón desmenuzado, queso feta, cilantro y hojuelas de pimienta.", price: 565, tags: ["picante"] },
      { name: "Croquetas de maduro", desc: "3 croquetas de plátano maduro rellenas de queso de cabra y crema con puerro, mozzarella y gouda, con spicy mayo y alioli de cilantro.", price: 525, tags: ["veg"] },
      { name: "Crostini Trio", desc: "Mozzarella gratinada con tomates · queso de cabra, serrano y mermelada de higo · guacamole, feta, maíz y tomates cherry.", price: 495 },
      { name: "Dip de espinaca y maduros", desc: "Cremoso dip de espinaca con cuadritos de plátano maduro fritos y pita chips.", price: 525, tags: ["veg"] },
      { name: "Pan & Parmesano", desc: "5 rebanadas de pan campesino tostado con parmesano rallado y aceite de oliva.", price: 275, tags: ["veg"] },
      { name: "Hummus Dip", desc: "Cremoso dip de garbanzos con pita chips.", price: 365, tags: ["veg"] },
      { name: "Bruschetta Light", desc: "Pan integral, mozzarella en bola y pesto.", price: 350, tags: ["veg"] },
      { name: "Pita Pizza", desc: "Pan pita crujiente con tomate, queso crema y pesto.", price: 295, tags: ["veg"] },
      { name: "Goat Cheese, Spinach & Pesto", desc: "Pan pita integral con salsa de tomate, espinacas, pesto, tomates cherry, queso de cabra y parmesano.", price: 330, tags: ["veg"] },
      { name: "Caprese Pita Melt", desc: "Pan pita integral con salsa de tomate, pesto, mozzarella, tomates cherry y albahaca.", price: 315, tags: ["veg"] },
      { name: "Involtinis de berenjena", desc: "Rollitos de berenjena rellenos de queso crema y mozzarella, con nuestra salsa de tomate y pesto, gratinados con mozzarella y parmesano.", price: 425, tags: ["popular", "veg"] },
      { name: "Shrimp Mofonguitos", desc: "3 mofonguitos de plátano crujientes rellenos y terminados con guacamole fresco.", options: [["De camarones", 495], ["De res o pollo", 465]] }
    ]
  },
  {
    id: "ensaladas",
    name: "Ensaladas",
    note: "Entera o media",
    items: [
      { name: "Apple Cranberry Salad", desc: "Manzana verde y roja, almendras fileteadas, cranberries, feta, rúcula, espinaca y lechuga con vinagreta de balsámico rosé.", options: [["Entera", 425], ["Media", 325]], tags: ["veg"] },
      { name: "Harvest Salad", desc: "Uvas, blueberries, melocotón, almendras, queso de cabra, lechugas mixtas y rúcula con aderezo de balsámico blanco y miel.", options: [["Entera", 475], ["Media", 350]], tags: ["veg"] },
      { name: "Strawberry Goat Cheese Salad", desc: "4 bolitas de queso de cabra fritas, fresas (en temporada), cranberries, pecans caramelizadas, rúcula y lechugas mixtas con aderezo de balsámico dulce.", options: [["Entera", 695], ["Media", 475]], tags: ["popular", "veg"] },
      { name: "Peach & Serrano Salad", desc: "Lechuga dulce, rúcula, melocotón rostizado, serrano crujiente, tiras de pollo, blue cheese, nueces y aderezo de melocotón y balsámico.", options: [["Entera", 695], ["Media", 475]] },
      { name: "Honey Mustard Crunch Salad", desc: "Tiras de pollo, lechuga, tomates cherry, aguacate, cebolla, tocineta de pavo, feta y croutones de pita con aderezo cremoso honey mustard.", options: [["Entera", 595], ["Media", 425]] },
      { name: "Steak & Blue Cheese Salad", desc: "Lechugas mixtas, rúcula, filete de res, tomate cherry, aguacate, cebolla, croutones y blue cheese con aderezo de mostaza y vino tinto.", options: [["Entera", 625], ["Media", 425]], img: "steak-blue-cheese" },
      { name: "Avocado Chicken Salad", desc: "Pollo, bolitas de mozzarella, tomates cherry, aguacate, lechugas mixtas y albahaca con vinagreta de balsámico y miel.", options: [["Entera", 425], ["Media", 325]] },
      { name: "Avocado Bacon Salad", desc: "Pollo, tocineta de pavo, aguacate, blue cheese, tomates y lechugas mixtas con aderezo de miel y mostaza.", options: [["Entera", 450], ["Media", 350]] },
      { name: "BBQ Chicken Salad", desc: "Pollo, maíz, tomate, cebolla, tostitos, cheddar, mozzarella y lechugas mixtas con aderezo de limón y orégano, salsa BBQ y César.", options: [["Entera", 495], ["Media", 365]] },
      { name: "La Mexicana", desc: "Pollo, tocineta de pavo, lechugas mixtas, maíz, guacamole, pico de gallo, cheddar, pimientos y tortilla chips con sour cream & lime dressing.", options: [["Entera", 495], ["Media", 365]] },
      { name: "Healthy Caesar Salad", desc: "Tiras de pollo, jamón o tocineta de pavo o cerdo, croutones, lechugas mixtas y parmesano con pesto y aderezo César a base de mayonesa de oliva.", options: [["Entera", 495], ["Media", 365]] },
      { name: "Garden Chicken Salad", desc: "Pollo, jamón de pavo, mozzarella, maíz, aguacate, tomates y lechugas mixtas con aderezo de pesto y balsámico.", options: [["Entera", 450], ["Media", 350]], tags: ["popular"] },
      { name: "Deck Turkey Cobb", desc: "Lechugas mixtas, blue cheese, tocineta y jamón de pavo, tomate, pollo y aguacate con vinagreta de vino tinto y mostaza.", options: [["Clásica", 525], ["Con salmón", 775]], tags: ["chef"] },
      { name: "Ensalada del Mar", desc: "Lechuga, rúcula, camarones, salmón, aguacate, tomate cherry y queso de cabra con aderezo de vino tinto y mostaza.", price: 795 }
    ]
  },
  {
    id: "burratas",
    name: "Burratas",
    items: [
      { name: "Burrata Otoñal", desc: "Burrata fresca, jamón serrano, melocotón rostizado, almendras fileteadas, rúcula y hierbabuena con vinagreta de balsámico y melocotón.", price: 750 },
      { name: "Burrata Deck", desc: "Burrata tibia con tomates cherry rostizados y pistachos tostados, aceite de oliva al limón amarillo y un toque de miel picante. Con pan ciabatta tostado.", price: 825, tags: ["chef", "picante"] },
      { name: "Burrata y Rúcula", desc: "Burrata fresca, rúcula, tomates cherry y parmesano con aderezo de balsámico dulce.", price: 695, tags: ["veg"] }
    ]
  },
  {
    id: "especialidades",
    name: "Especialidades",
    items: [
      { name: "Penne au Gratin Dolce", desc: "Penne en salsa cremosa a la vodka con serrano crujiente, cuadritos de plátano maduro y tiras de pollo, gratinado con mozzarella y parmesano.", price: 775 },
      { name: "Linguine a la Burrata", desc: "Linguine en pesto cremoso al limón amarillo con tomates cherry rostizados, burrata y serrano crocante.", price: 795, img: "linguine-burrata" },
      { name: "Patacón Gurabero", desc: "Tapas crujientes de plátano verde rellenas de pollo, filete o mixto, con pimientos y cebollas, gratinadas con mozzarella y cheddar y un toque de chicharrón.", price: 575, tags: ["popular"] },
      { name: "Fish & Chips", desc: "Filetes de mero crujientes con papas fritas y nuestra mayo especial de cilantro.", price: 595 },
      { name: "Deck Fish Tacos", desc: "3 tortillas con tiras de mero basa empanizado, repollo verde y morado, rúcula y aguacate, con sour cream y aderezo de lima y cilantro.", price: 695, tags: ["chef"] },
      { name: "Salmon Burger", desc: "Hamburguesa de salmón en pan brioche con mayonesa picante, aguacate, repollo morado y rúcula. Con yuca chips o papas fritas.", price: 765, tags: ["picante"] },
      { name: "Deck Crispy Chicken Burger", desc: "Pechuga crispy, mozzarella, tocineta de cerdo caramelizada, lechuga, plátano maduro a la plancha y salsa cremosa de espinacas en pan brioche. Con papas fritas al cilantro y parmesano.", price: 695, tags: ["chef"] },
      { name: "Deck Burger", desc: "Pan brioche, mayonesa de blue cheese, carne Angus con salsa de whisky, tocineta de pavo, tomate, rúcula, aguacate y mozzarella. Con aros de cebolla o papas fritas.", price: 695, tags: ["chef"], img: "deck-burger" }
    ]
  },
  {
    id: "salmon",
    name: "Salmón",
    items: [
      { name: "Carpaccio de salmón ahumado", desc: "Finas láminas de salmón ahumado con rúcula, tomate cherry, alcaparras, gajos de naranja, aguacate y cebolla blanca, con nuestro aderezo cítrico.", price: 975 },
      { name: "Orzotto & Salmón", desc: "Orzo cremoso a la crema con tomates secos y cuadritos de maduro, con 4 oz de salmón a la plancha gratinado con crema y parmesano.", price: 850 },
      { name: "Salmón a la crema", desc: "9 oz de salmón en nuestra salsa blanca con alcaparras. Con batatas caramelizadas con queso de cabra.", price: 995, tags: ["popular"] },
      { name: "Salmón a la plancha", desc: "9 oz de salmón a la plancha con ensaladita de lechuga, rúcula, tomates cherry, manzana verde, almendras y parmesano con aderezo cítrico.", price: 895 },
      { name: "Salmón a la chinola", desc: "9 oz de salmón en salsa de chinola, con nuestra cous cous salad.", price: 950 },
      { name: "Salmón Thai", desc: "9 oz de salmón en salsa de sésamo, ajonjolí, jengibre y miel. Con noodles de zanahoria y zucchini, repollo morado y pimientos.", price: 965, img: "salmon-thai" }
    ]
  },
  {
    id: "carnes",
    name: "Carnes",
    items: [
      { name: "Asian Tenderloin", desc: "9 oz de tenderloin marinado con toques asiáticos, con batata caramelizada.", price: 1675 },
      { name: "Chimichurri Flap Meat", desc: "9 oz de vacío marinado por días, con tostones al ajo y salsa chimichurri.", price: 1495 }
    ]
  },
  {
    id: "fuertes",
    name: "Platos fuertes",
    note: "Pechugas con guarnición: ensalada de la casa, vegetales al grill, casabitos, tostones al ajo o papas fritas",
    items: [
      { name: "Rollitos de berenjena y plátano maduro", desc: "4 rollitos de berenjena rellenos de maduro, queso de cabra, mozzarella y espinacas salteadas, con salsa de tomate y gratinados con mozzarella.", price: 595, tags: ["veg"] },
      { name: "«Lasaña» de berenjena y zucchini", desc: "Berenjena y zucchini salteados con salsa de tomate y albahaca, pesto, queso crema y mozzarella. No lleva pasta.", options: [["Vegetariana", 425], ["Con pollo o filete", 550], ["Con salmón", 675]], tags: ["popular", "veg"] },
      { name: "Pechuga de pollo a la plancha", options: [["Sola", 495], ["Con crema", 565]] },
      { name: "Pechuga Caprese", desc: "Pechuga a la plancha con salsa de tomate, albahaca, mozzarella y tomates cherry.", price: 625 },
      { name: "Pechuga rellena de maduro y gouda", options: [["Sola", 695], ["Con crema", 750]] }
    ]
  },
  {
    id: "pastas",
    name: "Pastas",
    note: "Penne, spaghetti o linguine · Extras: pollo RD$ 165, camarones RD$ 250, salmón RD$ 295",
    items: [
      { name: "Pasta a la crema", desc: "Nuestra salsa blanca cremosa con toques de ajo y cilantro.", price: 495, tags: ["veg"] },
      { name: "Spicy Olio", desc: "Tomates secos y cherry, aceitunas verdes y alcaparras salteados con el picante de la casa y un toque de aceite de trufa. Con rúcula y parmesano; de sabor intenso y salado.", price: 525, tags: ["veg", "picante"] },
      { name: "Vegetales al olio", desc: "Aceite de oliva, ajo, zucchini, tomates secos, pimientos, aceitunas, alcaparras y parmesano.", price: 450, tags: ["veg"] },
      { name: "Tomate y mozzarella", desc: "Salsa fresca de tomate, bolitas de mozzarella, albahaca y parmesano.", price: 450, tags: ["veg"] },
      { name: "Pesto & Parmesano", desc: "Pesto de albahaca, tomates cherry y parmesano.", price: 465, tags: ["veg"] },
      { name: "Extra para tu pasta", options: [["Pollo", 165], ["Camarones", 250], ["Salmón", 295]] }
    ]
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    items: [
      { name: "Herb Steak Sandwich", desc: "Pan campesino artesanal, mayonesa de hierbas, filete de res, pimientos dulces, cebolla blanca, provolone y rúcula. Con papas fritas.", price: 625 },
      { name: "Mister Deck", desc: "Pechuga gratinada con cheddar en pan ciabatta con jamón de pavo, pimientos y cebollas BBQ, tomate, lechuga y mayonesa de cilantro y ajo. Con papas fritas o batata chips.", options: [["Con pollo", 675], ["Con filete", 695]], tags: ["chef"] },
      { name: "California Club", desc: "Spicy mayo, espinaca, jamón y tocineta de pavo, mozzarella, tomate y aguacate en pan viga integral. Con papas fritas o tostitos.", options: [["Clásico", 495], ["Con pollo", 550]], tags: ["picante"] },
      { name: "Chicken Salad Sandwich", desc: "Pan viga integral, mozzarella, rúcula, ensalada de pollo con mayonesa de oliva y limón, tomate y jamón serrano crujiente. Con papas fritas o tostitos.", price: 550 },
      { name: "Honey Mustard Chicken Sandwich", desc: "Pechuga en salsa honey mustard, tocineta de pavo, provolone, tomate y lechuga en baguette integral.", price: 450 },
      { name: "Chicken and Cheese", desc: "Pollo, gouda, mayonesa de albahaca, pesto, tomate y lechuga en baguette integral.", options: [["Clásico", 450], ["Bacon (tocineta de pavo y aguacate)", 495]] },
      { name: "Sandwich vegetariano", desc: "Baguette integral o pan campesino con pimientos rostizados, zucchini, cebolla roja y berenjena al grill, queso de cabra y rúcula con reducción de balsámico.", price: 475, tags: ["veg"] },
      { name: "Arugula Caprese", desc: "Mozzarella en bola, tomate, pesto de albahaca y rúcula en baguette o pita integral.", options: [["Vegetariano", 395], ["Con pollo", 475]], tags: ["veg"] }
    ]
  },
  {
    id: "paninis",
    name: "Paninis y wraps",
    items: [
      { name: "Vegetable & Pesto Panini", desc: "Berenjena, zucchini, pimientos, cebolla, espinaca y tomates salteados, pesto, mozzarella y parmesano.", price: 415, tags: ["veg"] },
      { name: "Panini Pizza de Hoja", desc: "Salsa de tomate, orégano, queso de hoja, mozzarella, parmesano, tomate en cuadritos y albahaca.", price: 395, tags: ["veg"] },
      { name: "Panini Trufado", desc: "Salsa de tomate, mozzarella, queso de cabra, parmesano, serrano crujiente, rúcula y aceite de trufa blanca.", price: 495 },
      { name: "Crunchy BBQ Panini", desc: "Panini crujiente con maíz, pollo, tomate, habichuela y cheddar.", price: 450 },
      { name: "Healthy Caesar Wrap", desc: "Tiras de pollo, jamón de pavo, tocineta de pavo o cerdo, croutones, lechugas mixtas y parmesano con pesto y aderezo César a base de mayonesa de oliva.", price: 450 },
      { name: "Fresh Wrap", desc: "Mozzarella y gouda, jamón de pavo, aguacate, tomate, espinaca y rúcula con aderezo César a base de mayonesa de oliva.", options: [["Clásico", 395], ["Con pollo", 465]] },
      { name: "Wrap de pavo, cheddar y mozzarella", desc: "Mozzarella, cheddar, jamón de pavo, tomate, lechuga y aderezo de miel y mostaza.", options: [["Clásico", 365], ["Con pollo", 435]] }
    ]
  },
  {
    id: "quesadillas",
    name: "Quesadillas y nachos",
    items: [
      { name: "Pizzadilla", desc: "Tortilla integral con salsa de tomate, orégano, cheddar, mozzarella, parmesano y pepperoni crujiente.", options: [["Clásica", 395], ["Con pollo", 450]] },
      { name: "BBQ Chicken Quesadilla", desc: "Tortilla integral, pollo, tocineta de pavo, salsa BBQ, cheddar, mozzarella, cebolla y cilantro, con pico de gallo y aguacate.", options: [["Con pollo", 475], ["Con filete", 495]] },
      { name: "Healthy Quesadilla", desc: "Tortilla integral, mozzarella, tomate, maíz, cebolla, habichuela, guacamole y sour cream.", options: [["Vegetariana", 400], ["Con pollo", 495], ["Con res", 525]], tags: ["veg"] },
      { name: "Nachos Boxing", desc: "Tostitos, cuadritos de pollo, habichuela, maíz, cebolla, sour cream, guacamole, pico de gallo, cheddar y mozzarella.", options: [["Con pollo", 450], ["Con filete", 475]] },
      { name: "BBQ Nachos", desc: "Tostitos, pollo, salsa BBQ, cebolla, tomate, cheddar, mozzarella, pimientos, guacamole y sour cream.", options: [["Con pollo", 475], ["Con filete", 495]], tags: ["popular"] }
    ]
  },
  {
    id: "guarniciones",
    name: "Guarniciones especiales",
    note: "RD$ 250 cada una",
    items: [
      { name: "Batatas caramelizadas", desc: "Batatas untadas con queso de cabra y caramelizadas.", price: 250, tags: ["veg"] },
      { name: "Ensalada de lentejas", desc: "Lentejas, tomate, cebolla, maíz, pepino, pimientos, albahaca y feta con aderezo de limón y orégano.", price: 250, tags: ["veg"] },
      { name: "Cous cous salad", desc: "Cous cous, garbanzos, albahaca, rúcula, pimientos, tomates cherry, aceitunas negras y feta.", price: 250, tags: ["veg"] },
      { name: "Arugula salad", desc: "Rúcula, tomates cherry y parmesano con aderezo de balsámico dulce.", price: 250, tags: ["veg"] },
      { name: "Orzo con panko crujiente", desc: "Orzo al limón con espinaca, tomates cherry rostizados y panko crujiente al ajo.", price: 250, tags: ["veg"] },
      { name: "Orzotto cremoso", desc: "Orzo cremoso a la crema con tomates secos y cuadritos de maduro.", price: 250, tags: ["veg"] },
      { name: "Penne de acompañante", desc: "Tomate y mozzarella, pesto y parmesano o a la crema.", price: 250, tags: ["veg"] }
    ]
  },
  {
    id: "ninos",
    name: "Menú de niños",
    items: [
      { name: "Mozzarella Sticks", desc: "Con ketchup o salsa de tomate.", price: 325, tags: ["veg"] },
      { name: "Pechuguitas crispy con papas", price: 395 },
      { name: "Cheeseburger con papas", price: 425 },
      { name: "Penne en salsa blanca", price: 325, tags: ["veg"] }
    ]
  },
  {
    id: "postres",
    name: "Postres",
    note: "Cheesecakes: pregunta por la variedad del día",
    items: [
      { name: "Brownie a la moda", price: 425, tags: ["popular"] },
      { name: "Pecan Pie a la moda", price: 565, tags: ["popular"] },
      { name: "4 Leches tradicional", price: 365 },
      { name: "4 Leches guayaba & dulce de leche", price: 395 },
      { name: "4 Leches brownie & dulce de leche", price: 350 }
    ]
  }
];
