/* ==========================================================================
   Plaza Merengue · Datos del menú
   --------------------------------------------------------------------------
   Para actualizar el menú solo hay que editar este archivo:
   - price: precio en RD$ (número, sin comas)
   - sizes: para productos con tamaños (pizzas) en lugar de "price"
   - tags: "popular" | "chef" | "nuevo" | "picante" | "veg"
   - img: foto opcional (ruta dentro de assets/img)
   ========================================================================== */
window.MERENGUE_MENU = [
  {
    id: 'desayunos',
    name: 'Desayunos',
    note: 'Todos los días desde las 8:00 AM · Delivery desde las 9:00 AM',
    banner: 'assets/img/stock-desayuno.webp',
    bannerWide: 'assets/img/stock-desayuno-wide.webp',
    items: [
      { id: 'tres-golpes', name: 'Los Tres Golpes', desc: 'Mangú de plátano verde con cebolla roja, salami, queso frito y huevo frito.', price: 375, tags: ['popular'] },
      { id: 'mangu-merengue', name: 'Mangú Merengue', desc: 'Mangú cremoso con cebollitas encurtidas y dos acompañantes a elegir.', price: 325 },
      { id: 'desayuno-americano', name: 'Desayuno Americano', desc: 'Huevos al gusto, tocineta, tostadas, papitas y jugo natural.', price: 425 },
      { id: 'omelette', name: 'Omelette de jamón y queso', desc: 'Tres huevos, jamón y queso de hoja, con pan tostado.', price: 295 },
      { id: 'yuca-desayuno', name: 'Yuca con huevos', desc: 'Yuca hervida con cebolla, huevos revueltos y queso frito.', price: 325 },
      { id: 'sandwich-desayuno', name: 'Sándwich de jamón y queso', desc: 'Pan tostado a la plancha con jamón, queso y mayonesa de la casa.', price: 225 }
    ]
  },
  {
    id: 'plato-del-dia',
    name: 'Plato del día',
    note: 'Almuerzo de lunes a sábado · Incluye arroz, habichuelas y ensalada',
    special: true,
    sides: ['Moro de habichuelas negras', 'Arroz blanco', 'Habichuelas rojas guisadas', 'Guandules guisados', 'Ensalada verde o hervida'],
    items: [
      { id: 'pollo-carbon', name: 'Pollo al carbón', desc: 'Jugoso y doradito, como en casa.', price: 295, tags: ['popular'] },
      { id: 'res-guisada', name: 'Res guisada', desc: 'Carne de res guisada a fuego lento con sazón criolla.', price: 295 },
      { id: 'cerdo-guisado', name: 'Cerdo guisado', desc: 'Masitas de cerdo en salsa criolla.', price: 295 },
      { id: 'berenjenas', name: 'Berenjenas asadas con huevo', desc: 'Opción ligera y llena de sabor.', price: 295, tags: ['veg'] },
      { id: 'espaguetis-pollo', name: 'Espaguetis con pollo', desc: 'En salsa roja de la casa, con pollo desmenuzado.', price: 295 }
    ]
  },
  {
    id: 'chef',
    name: 'Del chef',
    note: 'Nuestras especialidades a la carta',
    items: [
      { id: 'mero-criollo', name: 'Mero criollo al grill', desc: 'Filete de mero a la parrilla bañado en salsa criolla, con tostones o arroz.', price: 795, tags: ['chef'], img: 'assets/img/stock-pescado.webp' },
      { id: 'pechuga-rellena', name: 'Pechuga rellena', desc: 'Pechuga de pollo rellena de jamón y queso, en salsa de champiñones.', price: 795, tags: ['chef', 'popular'], img: 'assets/img/stock-pechuga.webp' },
      { id: 'medallones-cerdo', name: 'Medallones de cerdo', desc: 'Lomo de cerdo en salsa de la casa con puré de papas.', price: 750, tags: ['chef'] },
      { id: 'churrasco', name: 'Churrasco Merengue', desc: 'Entraña a la parrilla con chimichurri y papas fritas.', price: 1150, tags: ['popular'], img: 'assets/img/stock-churrasco.webp' },
      { id: 'camarones', name: 'Camarones a la criolla', desc: 'Camarones en salsa criolla con arroz blanco y tostones.', price: 895, img: 'assets/img/stock-camarones.webp' },
      { id: 'costillas', name: 'Costillas BBQ', desc: 'Costillas de cerdo glaseadas en BBQ, con papas y ensalada.', price: 850, img: 'assets/img/stock-costillas.webp' },
      { id: 'mofongo-chicharron', name: 'Mofongo de chicharrón', desc: 'Plátano verde majado con ajo, aceite de oliva y chicharrón crujiente.', price: 495, tags: ['popular'] },
      { id: 'mofongo-camarones', name: 'Mofongo de camarones', desc: 'Nuestro mofongo coronado con camarones al ajillo.', price: 695 }
    ]
  },
  {
    id: 'pizzas',
    name: 'Pizzas',
    note: 'Lun–Vie desde las 4:00 PM · Sáb y Dom desde las 12:00 PM',
    banner: 'assets/img/stock-pizza-margarita.webp',
    bannerWide: 'assets/img/stock-pizza-margarita-wide.webp',
    schedule: 'pizza',
    items: [
      { id: 'pz-margarita', name: 'Margarita', desc: 'Salsa de tomate, mozzarella y albahaca fresca.', sizes: [['Personal', 395], ['Mediana', 695], ['Familiar', 950]], tags: ['veg'] },
      { id: 'pz-pepperoni', name: 'Pepperoni', desc: 'Doble pepperoni y mucho queso mozzarella.', sizes: [['Personal', 450], ['Mediana', 795], ['Familiar', 1095]], tags: ['popular'] },
      { id: 'pz-hawaiana', name: 'Hawaiana', desc: 'Jamón, piña y mozzarella.', sizes: [['Personal', 450], ['Mediana', 795], ['Familiar', 1095]] },
      { id: 'pz-suprema', name: 'Suprema', desc: 'Pepperoni, jamón, pimientos, cebolla, aceitunas y champiñones.', sizes: [['Personal', 525], ['Mediana', 895], ['Familiar', 1250]] },
      { id: 'pz-pollo-bbq', name: 'Pollo BBQ', desc: 'Pollo a la parrilla, salsa BBQ, cebolla morada y cilantro.', sizes: [['Personal', 495], ['Mediana', 850], ['Familiar', 1195]] },
      { id: 'pz-mariscos', name: 'Mariscos', desc: 'Camarones, calamares y mejillones con ajo y perejil.', sizes: [['Personal', 595], ['Mediana', 995], ['Familiar', 1395]], tags: ['chef'] },
      { id: 'pz-merengue', name: 'Especial Merengue', desc: 'La de la casa: pepperoni, jamón, salami, tocineta y maíz dulce.', sizes: [['Personal', 550], ['Mediana', 950], ['Familiar', 1295]], tags: ['popular'] },
      { id: 'pz-vegetariana', name: 'Vegetariana', desc: 'Pimientos, cebolla, champiñones, aceitunas y tomate.', sizes: [['Personal', 450], ['Mediana', 795], ['Familiar', 1095]], tags: ['veg'] }
    ]
  },
  {
    id: 'sushi',
    name: 'Sushi',
    note: 'Viernes, sábado y domingo desde las 4:00 PM',
    banner: 'assets/img/stock-sushi.webp',
    bannerWide: 'assets/img/stock-sushi-wide.webp',
    schedule: 'sushi',
    items: [
      { id: 'su-california', name: 'California Roll', desc: 'Kani, aguacate y pepino, cubierto de ajonjolí. 10 piezas.', price: 450 },
      { id: 'su-philadelphia', name: 'Philadelphia Roll', desc: 'Salmón, queso crema y aguacate. 10 piezas.', price: 525, tags: ['popular'] },
      { id: 'su-merengue', name: 'Merengue Roll', desc: 'Camarón tempura, queso crema y plátano maduro. 10 piezas.', price: 575, tags: ['chef'] },
      { id: 'su-tempura', name: 'Tempura Roll', desc: 'Roll empanizado relleno de kani y queso crema. 10 piezas.', price: 495 },
      { id: 'su-combo', name: 'Combo para compartir', desc: '30 piezas variadas de la casa con salsas.', price: 1395 }
    ]
  },
  {
    id: 'picaderas',
    name: 'Picaderas',
    note: 'Para compartir y acompañar',
    items: [
      { id: 'picadera-merengue', name: 'Picadera Merengue', desc: 'Chicharrón, longaniza, salami, queso frito y tostones. Para 2–3 personas.', price: 950, tags: ['popular'] },
      { id: 'chicharron-pollo', name: 'Chicharrón de pollo', desc: 'Crujiente, con limón y tostones.', price: 450 },
      { id: 'tostones', name: 'Tostones', desc: 'Plátano verde frito, crujiente por fuera.', price: 110, img: 'assets/img/tostones.webp' },
      { id: 'yuca', name: 'Yuca frita o hervida', desc: 'Con cebolla encurtida.', price: 95 },
      { id: 'guineitos', name: 'Guineítos encebollados', desc: 'Guineo verde con cebolla salteada.', price: 95 },
      { id: 'papas', name: 'Papas fritas', desc: 'Porción clásica.', price: 125 },
      { id: 'pure', name: 'Puré de papas', desc: 'Cremoso, con mantequilla.', price: 135 },
      { id: 'arepitas', name: 'Arepitas de yuca', desc: 'Doraditas, receta tradicional.', price: 85 },
      { id: 'pastelon', name: 'Pastelón de plátano maduro', desc: 'Capas de maduro, carne molida y queso gratinado.', price: 175 }
    ]
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    note: 'Jugos naturales, batidas, café y cócteles',
    items: [
      { id: 'frozen-merengue', name: 'Frozen Merengue', desc: 'Limón y menta frappé, refrescante y bien verde.', price: 250, tags: ['nuevo'], img: 'assets/img/frozen-verde.webp' },
      { id: 'morir-sonando', name: 'Morir soñando', desc: 'El clásico dominicano: leche con jugo de naranja.', price: 175, tags: ['popular'] },
      { id: 'jugo-chinola', name: 'Jugo de chinola', desc: 'Natural, hecho al momento.', price: 140 },
      { id: 'jugo-fresa', name: 'Jugo de fresa', desc: 'Natural, hecho al momento.', price: 175 },
      { id: 'limonada', name: 'Limonada', desc: 'Natural o frappé.', price: 120 },
      { id: 'batida-lechosa', name: 'Batida de lechosa', desc: 'Lechosa, leche y un toque de vainilla.', price: 175 },
      { id: 'mojito', name: 'Mojito clásico', desc: 'Ron blanco, hierbabuena, limón y soda.', price: 350, img: 'assets/img/stock-mojito.webp' },
      { id: 'cafe', name: 'Café dominicano', desc: 'Recién colado.', price: 75 },
      { id: 'capuchino', name: 'Capuchino', desc: 'Espresso con leche espumada.', price: 160 },
      { id: 'cerveza', name: 'Cerveza bien fría', desc: 'Pregunta por las marcas disponibles.', price: 200 },
      { id: 'refresco', name: 'Refresco', desc: 'Lata o botella.', price: 80 },
      { id: 'agua', name: 'Agua', desc: 'Botella.', price: 50 }
    ]
  },
  {
    id: 'postres',
    name: 'Postres',
    note: 'El final perfecto',
    items: [
      { id: 'tartaleta-frutas', name: 'Corazón de frutas', desc: 'Bizcocho con crema chantilly, chispas de chocolate y frutas frescas.', price: 250, tags: ['nuevo'], img: 'assets/img/postres.webp' },
      { id: 'tres-leches', name: 'Tres leches', desc: 'Húmedo, suave y con merengue.', price: 160, tags: ['popular'] },
      { id: 'cuatro-leches', name: 'Cuatro leches', desc: 'Con un toque de dulce de leche.', price: 185 },
      { id: 'quesillo', name: 'Quesillo', desc: 'Flan casero de la abuela.', price: 160 },
      { id: 'coco-tierno', name: 'Coco tierno', desc: 'Dulce de coco tradicional.', price: 140 },
      { id: 'cortado-leche', name: 'Cortado de leche', desc: 'Dulce criollo de leche cortada.', price: 140 },
      { id: 'helado', name: 'Helado', desc: 'Pregunta por los sabores del día.', price: 125 }
    ]
  }
];

/* Destacados del carrusel de inicio (ids del menú + imagen grande) */
window.MERENGUE_FEATURED = [
  { id: 'mero-criollo', img: 'assets/img/stock-pescado.webp', label: 'Del chef' },
  { id: 'pz-merengue', size: 1, img: 'assets/img/stock-pizza-tabla.webp', label: 'La de la casa' },
  { id: 'pechuga-rellena', img: 'assets/img/stock-pechuga.webp', label: 'Del chef' },
  { id: 'frozen-merengue', img: 'assets/img/frozen-verde.webp', label: 'Nuevo' },
  { id: 'camarones', img: 'assets/img/stock-camarones.webp', label: 'Mar y sabor' },
  { id: 'tostones', img: 'assets/img/tostones.webp', label: 'Clásico' },
  { id: 'su-merengue', img: 'assets/img/stock-sushi.webp', label: 'Fin de semana' },
  { id: 'tartaleta-frutas', img: 'assets/img/postres.webp', label: 'Dulce final' }
];
