/*
 * LA CARTA. Es lo único que hay que editar para cambiar platos y precios.
 * tools/build.py la convierte en la página del menú y en el carrusel de favoritos.
 *
 * Cada plato:
 *   "name"   nombre como aparece en la carta
 *   "desc"   descripción corta (opcional)
 *   "price"  número en RD$ sin ITBIS ni 10 %; null si hay que consultarlo
 *   "tags"   cualquiera de: "popular", "casa", "veg", "compartir", "picante"
 *   "photo"  nombre de la foto en assets/img (opcional)
 *   "verify" true = precio tomado de una versión anterior de la carta (confirmar con el cliente)
 *
 * Formato: JSON estricto entre las marcas (comillas dobles, sin comas al final).
 */
window.MENU = /* MENU:START */ {
  "favorites": [
    { "ref": "picadera-mixta" },
    { "ref": "tren-de-berenjenas" },
    { "ref": "quipes" },
    { "ref": "churrasco-importado" },
    { "category": "sushi", "title": "Sushi de la casa", "desc": "Siete rolls en carta, del California al Cibao Roll.", "photo": "fav-sushi" },
    { "ref": "croquetas-de-pollo" },
    { "ref": "wrap-cesar-de-pollo" }
  ],
  "categories": [
    {
      "id": "entradas", "name": "Entradas y picaderas", "short": "Entradas",
      "items": [
        { "name": "Picadera mixta", "desc": "Un poco de todo para picar en grupo.", "price": 1350, "tags": ["popular", "compartir"], "photo": "fav-picadera" },
        { "name": "Picadera mixta especial", "desc": "La bandeja grande, para la mesa completa.", "price": 2400, "tags": ["compartir"] },
        { "name": "Picadera mar y tierra", "desc": "Mariscos y carnes en la misma bandeja.", "price": 2500, "tags": ["compartir"] },
        { "name": "Tren de berenjenas", "desc": "Berenjenas rellenas de queso y tomate, bañadas en salsa blanca.", "price": 400, "tags": ["popular", "veg"], "photo": "fav-tren-berenjenas" },
        { "name": "Quipes", "desc": "Dorados, crujientes por fuera y llenos de sabor por dentro.", "price": 440, "tags": ["popular"], "photo": "fav-quipes" },
        { "name": "Croquetas de pollo", "desc": "Doradas por fuera, cremosas por dentro. Un clásico de la casa.", "price": 245, "tags": ["popular"], "photo": "fav-croquetas" },
        { "name": "Crepes Puerta del Sol", "desc": "Las crepes que llevan el nombre de la casa.", "price": 410, "tags": ["casa"] },
        { "name": "Canastica del Sol", "desc": "Especialidad de la casa.", "price": 950, "tags": ["casa", "compartir"] },
        { "name": "Mofongo tradicional", "desc": "Del pilón a la mesa, receta de El Carrito de Marchena.", "price": null, "tags": [] },
        { "name": "Chicharrón de pollo sin hueso", "desc": "Trocitos de pollo fritos, sin hueso.", "price": 595, "tags": ["compartir"] },
        { "name": "Calamares fritos", "desc": "Anillos de calamar dorados y crujientes.", "price": 500, "tags": ["compartir"] },
        { "name": "Crostini de salmón noruego", "desc": "Pan tostado con salmón noruego.", "price": 525, "tags": [] },
        { "name": "Crostini de camarones", "desc": "Pan tostado con camarones.", "price": 950, "tags": [] },
        { "name": "Carpaccio de salmón", "desc": "Láminas finas de salmón.", "price": 665, "tags": [] },
        { "name": "Carpaccio de res", "desc": "Láminas finas de res.", "price": 585, "tags": [] },
        { "name": "Cóctel de camarones", "desc": "Camarones en salsa cóctel.", "price": 750, "tags": [] },
        { "name": "Ceviche de camarones y langosta", "desc": "Camarones y langosta marinados en limón.", "price": 2200, "tags": ["compartir"] },
        { "name": "Ceviche de guandules y camarones", "desc": "Camarones y guandules marinados en limón.", "price": 1000, "tags": [] },
        { "name": "Dip de berenjenas", "desc": "Cremoso, para untar y compartir.", "price": 425, "tags": ["veg", "compartir"] },
        { "name": "Dip de espinacas", "desc": "Cremoso, para untar y compartir.", "price": 425, "tags": ["veg", "compartir"] },
        { "name": "Mozzarella en carroza", "desc": "Mozzarella empanizada y frita.", "price": 422, "tags": ["veg"] },
        { "name": "Berenjena parmesana", "desc": "Berenjena gratinada con parmesano y salsa de tomate.", "price": 375, "tags": ["veg"] },
        { "name": "Brochetas de tomate", "desc": "", "price": 180, "tags": ["veg"] },
        { "name": "Catibías de res", "desc": "Empanaditas de yuca rellenas de res.", "price": 250, "tags": [] },
        { "name": "Catibías de pollo", "desc": "Empanaditas de yuca rellenas de pollo.", "price": 250, "tags": [] },
        { "name": "Catibías de queso", "desc": "Empanaditas de yuca rellenas de queso.", "price": 250, "tags": ["veg"] },
        { "name": "Bolitas de queso", "desc": "Bolitas de queso fritas.", "price": 245, "tags": ["veg"] }
      ]
    },
    {
      "id": "sopas", "name": "Sopas", "short": "Sopas",
      "items": [
        { "name": "Sancocho", "desc": "El de siempre: espeso y bien caliente.", "price": 650, "tags": ["popular"] },
        { "name": "Asopao de camarones", "desc": "Arroz caldoso criollo con camarones.", "price": 1100, "tags": [] },
        { "name": "Asopao de mariscos", "desc": "Arroz caldoso criollo con mariscos.", "price": null, "tags": [] },
        { "name": "Mondongo", "desc": "Guisado a la criolla.", "price": 1000, "tags": [] },
        { "name": "Cocido", "desc": "Cocido criollo.", "price": 650, "tags": [] },
        { "name": "Sopa de pollo", "desc": "", "price": 330, "tags": [] },
        { "name": "Sopa de vegetales", "desc": "", "price": 310, "tags": ["veg"] },
        { "name": "Sopa de mero", "desc": "", "price": 600, "tags": [] },
        { "name": "Sopa de camarones", "desc": "", "price": null, "tags": [] },
        { "name": "Sopa de langosta", "desc": "", "price": null, "tags": [] },
        { "name": "Sopa de mariscos", "desc": "", "price": null, "tags": [] },
        { "name": "Sopa de langosta y camarones", "desc": "", "price": null, "tags": [] }
      ]
    },
    {
      "id": "ensaladas", "name": "Ensaladas", "short": "Ensaladas",
      "items": [
        { "name": "Ensalada Puerta del Sol", "desc": "La ensalada que lleva el nombre de la casa.", "price": 360, "tags": ["casa"], "verify": true },
        { "name": "Ensalada del Sol", "desc": "", "price": 310, "tags": ["casa"], "verify": true },
        { "name": "César con pollo a la parrilla", "desc": "Lechuga, aderezo César y pollo a la parrilla.", "price": 370, "tags": [], "verify": true },
        { "name": "César con camarones a la parrilla", "desc": "Lechuga, aderezo César y camarones a la parrilla.", "price": 750, "tags": [], "verify": true },
        { "name": "Ensalada de salmón", "desc": "", "price": 450, "tags": [], "verify": true },
        { "name": "Ensalada del chef", "desc": "", "price": 1093, "tags": [], "verify": true },
        { "name": "Mediterránea", "desc": "", "price": 425, "tags": ["veg"], "verify": true },
        { "name": "Caprese", "desc": "Tomate, mozzarella y albahaca.", "price": 330, "tags": ["veg"], "verify": true },
        { "name": "Fruta de ocasión", "desc": "", "price": 1500, "tags": ["veg"], "verify": true },
        { "name": "Salpicón de langosta", "desc": "", "price": 1500, "tags": [], "verify": true },
        { "name": "Vinagreta de lambí", "desc": "Lambí en vinagreta, fresco y cítrico.", "price": 1000, "tags": [], "verify": true },
        { "name": "Frutos del mar (2 personas)", "desc": "", "price": 2600, "tags": ["compartir"], "verify": true }
      ]
    },
    {
      "id": "carnes", "name": "Carnes", "short": "Carnes",
      "items": [
        { "name": "Churrasco importado", "desc": "Corte importado a la parrilla, con chimichurri.", "price": 2100, "tags": ["popular"], "photo": "fav-churrasco" },
        { "name": "Churrasco Bernard", "desc": "", "price": 2300, "tags": ["casa"] },
        { "name": "Ribeye Angus 12 oz", "desc": "", "price": 2500, "tags": [] },
        { "name": "Filete mignon 12 oz", "desc": "", "price": 2500, "tags": [] },
        { "name": "Sirloin", "desc": "", "price": 2500, "tags": [] },
        { "name": "Filete de res Angus 12 oz", "desc": "", "price": 1500, "tags": [] },
        { "name": "Solomillo de cerdo en salsa de ciruela", "desc": "Cerdo con salsa agridulce de ciruela.", "price": 900, "tags": [] },
        { "name": "Chuleta de cordero importada", "desc": "", "price": 2200, "tags": [] },
        { "name": "Cerdo tropical", "desc": "", "price": 1100, "tags": [] },
        { "name": "Chofán mar y tierra", "desc": "Arroz frito con mariscos y carnes.", "price": 2000, "tags": ["compartir"] },
        { "name": "Chivo a la militar", "desc": "Chivo guisado, receta criolla.", "price": 1000, "tags": [] }
      ]
    },
    {
      "id": "aves", "name": "Aves", "short": "Aves",
      "items": [
        { "name": "Pechuga a la criolla, a la crema o al ajillo", "desc": "La misma pechuga, en la salsa que prefieras.", "price": 490, "tags": [], "verify": true },
        { "name": "Pechuga de pollo a la parrilla", "desc": "", "price": 475, "tags": [], "verify": true },
        { "name": "Pechuga estilo Marsala", "desc": "En salsa de vino Marsala.", "price": 550, "tags": [], "verify": true },
        { "name": "Pechuga cordon bleu", "desc": "Rellena de jamón y queso, empanizada.", "price": 680, "tags": [], "verify": true },
        { "name": "Pechuga a la milanesa", "desc": "Empanizada y dorada.", "price": 550, "tags": [], "verify": true },
        { "name": "Pechuga rellena de camarones", "desc": "", "price": 1100, "tags": [], "verify": true },
        { "name": "Pechuga rellena de langosta", "desc": "", "price": 1850, "tags": [], "verify": true },
        { "name": "Guinea de Porfirio", "desc": "", "price": 750, "tags": ["casa"], "verify": true },
        { "name": "Gallina criolla", "desc": "Guisada a la dominicana.", "price": 520, "tags": [], "verify": true },
        { "name": "Chofán de pollo", "desc": "Arroz frito con pollo.", "price": 450, "tags": [], "verify": true }
      ]
    },
    {
      "id": "mar", "name": "Generosos del mar", "short": "Del mar",
      "items": [
        { "name": "Chillo al gusto", "desc": "Frito, a la plancha o como lo prefieras.", "price": 750, "tags": [], "verify": true },
        { "name": "Filete de mero a la plancha", "desc": "", "price": 600, "tags": [], "verify": true },
        { "name": "Filete de mero al limón", "desc": "", "price": 730, "tags": [], "verify": true },
        { "name": "Filete de mero a la criolla, crema o ajillo", "desc": "", "price": 730, "tags": [], "verify": true },
        { "name": "Filete de mero al curry", "desc": "", "price": 730, "tags": [], "verify": true },
        { "name": "Filete de mero en salsa de jengibre", "desc": "", "price": 725, "tags": [], "verify": true },
        { "name": "Filete de mero estilo bretona", "desc": "", "price": 830, "tags": [], "verify": true },
        { "name": "Mero con batata", "desc": "", "price": 800, "tags": [], "verify": true },
        { "name": "Filete de salmón a la parrilla", "desc": "", "price": 900, "tags": [], "verify": true },
        { "name": "Filete de salmón a la fresa", "desc": "", "price": 950, "tags": [], "verify": true },
        { "name": "Filete de salmón en salsa de alcaparras", "desc": "", "price": 950, "tags": [], "verify": true },
        { "name": "Filete de salmón tampoyaki", "desc": "", "price": 950, "tags": [], "verify": true },
        { "name": "Filete de salmón al roquefort", "desc": "", "price": 950, "tags": [], "verify": true },
        { "name": "Camarones al ajillo, crema o criolla", "desc": "", "price": 860, "tags": [], "verify": true },
        { "name": "Camarones a la plancha", "desc": "", "price": 780, "tags": [], "verify": true },
        { "name": "Camarones empanizados", "desc": "", "price": 840, "tags": [], "verify": true },
        { "name": "Camarones en salsa de jengibre", "desc": "", "price": 830, "tags": [], "verify": true },
        { "name": "Camarones scampi estilo Miami", "desc": "", "price": 880, "tags": [], "verify": true },
        { "name": "Tampoyaki de camarones thai", "desc": "", "price": 880, "tags": [], "verify": true },
        { "name": "Arroz con camarones", "desc": "", "price": 820, "tags": [], "verify": true },
        { "name": "Chofán de camarones", "desc": "Arroz frito con camarones.", "price": 900, "tags": [], "verify": true },
        { "name": "Mar en puya", "desc": "", "price": 1150, "tags": ["casa"], "verify": true },
        { "name": "Cazuela de mariscos al Felipe II", "desc": "", "price": 1650, "tags": ["compartir"], "verify": true },
        { "name": "Langosta al termidor 16 oz", "desc": "", "price": 1650, "tags": [], "verify": true },
        { "name": "Langosta a la parrilla 16 oz", "desc": "", "price": 1679, "tags": [], "verify": true },
        { "name": "Langosta criolla 16 oz", "desc": "", "price": 2125, "tags": [], "verify": true },
        { "name": "Langosta al ajillo 16 oz", "desc": "", "price": 2125, "tags": [], "verify": true }
      ]
    },
    {
      "id": "pastas", "name": "Pastas", "short": "Pastas",
      "items": [
        { "name": "Alfredo con pollo o jamón", "desc": "Salsa cremosa de queso.", "price": 420, "tags": [] },
        { "name": "Alfredo con camarones", "desc": "Salsa cremosa de queso con camarones.", "price": 1171, "tags": [] },
        { "name": "Boloñesa", "desc": "Salsa de tomate con carne molida.", "price": 475, "tags": [] },
        { "name": "Carbonara", "desc": "", "price": 425, "tags": [] },
        { "name": "Cuatro quesos", "desc": "", "price": 425, "tags": ["veg"] },
        { "name": "Amatriciana", "desc": "", "price": 425, "tags": [] },
        { "name": "Arrabbiata", "desc": "Salsa de tomate con ajo y chile.", "price": 900, "tags": ["veg", "picante"] },
        { "name": "Pesto", "desc": "Albahaca, ajo y queso.", "price": 385, "tags": ["veg"] },
        { "name": "Pomodoro", "desc": "Salsa de tomate y albahaca.", "price": 380, "tags": ["veg"] },
        { "name": "Aurora", "desc": "Salsa rosada de tomate y crema.", "price": 425, "tags": [] },
        { "name": "Óleo con churrasco", "desc": "Aceite de oliva, ajo y churrasco.", "price": 2100, "tags": [] },
        { "name": "Óleo con hongos porcini y camarones", "desc": "", "price": 1171, "tags": [] },
        { "name": "Frutti di mare", "desc": "Pasta con mariscos.", "price": 1550, "tags": [] },
        { "name": "Pasión dominicana", "desc": "", "price": 420, "tags": ["casa"] },
        { "name": "Canelones de ricota y espinaca", "desc": "", "price": 425, "tags": ["veg"] },
        { "name": "Lasaña de carne", "desc": "", "price": 375, "tags": [] },
        { "name": "Lasaña tri mare", "desc": "Lasaña de mariscos.", "price": 1200, "tags": [] }
      ]
    },
    {
      "id": "sushi", "name": "Sushi", "short": "Sushi",
      "items": [
        { "name": "Puerta del Sol roll", "desc": "El roll que lleva el nombre de la casa.", "price": 380, "tags": ["casa"] },
        { "name": "Roll de la casa", "desc": "", "price": 520, "tags": ["casa"] },
        { "name": "Cibao roll", "desc": "", "price": 560, "tags": [] },
        { "name": "Philadelphia roll", "desc": "Con queso crema.", "price": 350, "tags": [] },
        { "name": "California roll", "desc": "", "price": 350, "tags": [] },
        { "name": "Sushi roll", "desc": "", "price": 350, "tags": [] },
        { "name": "Roll vegetariano", "desc": "", "price": 350, "tags": ["veg"] },
        { "name": "Chicken sushi", "desc": "Empanizado y relleno de pollo con aguacate.", "price": null, "tags": [] }
      ]
    },
    {
      "id": "sandwiches", "name": "Sándwiches, burritos y hamburguesas", "short": "Sándwiches",
      "items": [
        { "name": "Wrap César de pollo", "desc": "Pollo jugoso, lechuga fresca y el toque César.", "price": 325, "tags": [], "photo": "fav-wrap", "verify": true },
        { "name": "Club sándwich", "desc": "", "price": 450, "tags": [] },
        { "name": "Club sándwich especial", "desc": "", "price": 650, "tags": [] },
        { "name": "Sándwich de filete", "desc": "", "price": 450, "tags": [] },
        { "name": "Sándwich de pechuga", "desc": "", "price": 595, "tags": [] },
        { "name": "Cubano", "desc": "", "price": 400, "tags": [] },
        { "name": "Dañino", "desc": "", "price": 450, "tags": ["casa"] },
        { "name": "Dañino especial", "desc": "", "price": 650, "tags": ["casa"] },
        { "name": "Exterminador", "desc": "", "price": 1300, "tags": ["casa", "compartir"] },
        { "name": "Burrito de pollo o res", "desc": "", "price": 400, "tags": [] },
        { "name": "Burrito mixto", "desc": "", "price": 450, "tags": [] },
        { "name": "Burrito Dachy", "desc": "", "price": 450, "tags": ["casa"] },
        { "name": "Cheeseburger", "desc": "", "price": 350, "tags": [] },
        { "name": "Cheeseburger con tocineta", "desc": "", "price": 400, "tags": [] },
        { "name": "Cheeseburger doble", "desc": "", "price": 450, "tags": [] },
        { "name": "Cheeseburger doble con tocineta", "desc": "", "price": 500, "tags": [] }
      ]
    },
    {
      "id": "desayunos", "name": "Desayunos · The Breakfast Club", "short": "Desayunos", "note": "Desde las 8:00 a. m.",
      "items": [
        { "name": "Tres Golpes", "desc": "Mangú con salami frito, queso frito y huevo.", "price": null, "tags": ["popular"], "photo": "desayuno-tres-golpes" },
        { "name": "Chicken & waffles", "desc": "Pollo crujiente sobre waffle: lo salado y lo dulce juntos.", "price": null, "tags": [] }
      ]
    },
    {
      "id": "guarniciones", "name": "Guarniciones", "short": "Guarniciones", "note": "Para acompañar cualquier plato.",
      "items": [
        { "name": "Tostones", "desc": "", "price": 78, "tags": ["veg"], "verify": true },
        { "name": "Plátano maduro", "desc": "", "price": 78, "tags": ["veg"], "verify": true },
        { "name": "Papas fritas", "desc": "", "price": 99, "tags": ["veg"], "verify": true },
        { "name": "Puré de papa o de yuca", "desc": "", "price": 78, "tags": ["veg"], "verify": true },
        { "name": "Arroz blanco", "desc": "", "price": 50, "tags": ["veg"], "verify": true },
        { "name": "Vegetales salteados", "desc": "", "price": 99, "tags": ["veg"], "verify": true },
        { "name": "Vegetales a la parrilla", "desc": "", "price": 122, "tags": ["veg"], "verify": true }
      ]
    },
    {
      "id": "frozen", "name": "Jugos frozen", "short": "Frozen",
      "items": [
        { "name": "Chinola", "desc": "", "price": null, "tags": [] },
        { "name": "Fresa", "desc": "", "price": null, "tags": [] },
        { "name": "Limón", "desc": "", "price": null, "tags": [] },
        { "name": "Fresa con leche", "desc": "", "price": null, "tags": [] },
        { "name": "Lechoza con leche", "desc": "", "price": null, "tags": [] }
      ]
    }
  ]
} /* MENU:END */;
