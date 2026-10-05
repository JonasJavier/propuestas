/* Kukka Beach — carta interactiva: búsqueda, filtros, categorías y precios con impuestos.
   Los platos salen de menu-data.js. */
(function () {
  "use strict";
  var K = window.Kukka;
  var MENU = window.KUKKA_MENU;
  var CFG = window.KUKKA_CONFIG;
  var lista = document.querySelector("[data-menu-lista]");
  if (!K || !MENU || !lista) return;

  var t = K.t;
  var LANG = K.LANG;
  var FACTOR = 1 + CFG.impuestos.itbis + CFG.impuestos.servicio;
  var BASE = new URL(CFG.SITE_URL).pathname.replace(/\/$/, "");
  var buscador = document.querySelector("[data-menu-buscar]");
  var filtros = document.querySelector("[data-menu-filtros]");
  var interruptor = document.querySelector("[data-menu-impuestos]");
  var navCats = document.querySelector("[data-menu-categorias]");
  var resultado = document.querySelector("[data-menu-resultado]");
  var vacio = document.querySelector("[data-menu-vacio]");
  var btnPrev = document.querySelector("[data-cat-prev]");
  var btnNext = document.querySelector("[data-cat-next]");

  var estado = { texto: "", filtro: "todo", impuestos: false };
  try { estado.impuestos = localStorage.getItem("kukka-impuestos") === "1"; } catch (e) { /* sin almacenamiento */ }
  if (interruptor) interruptor.checked = estado.impuestos;

  var TAGS = {
    popular: t("tag_popular", "Lo más pedido"),
    chef: t("tag_chef", "Del chef"),
    nuevo: t("tag_nuevo", "Nuevo"),
    veg: t("tag_veg", "Vegetariano"),
    picante: t("tag_picante", "Picante")
  };
  var GRUPOS = {
    burbujas: t("grupo_burbujas", "Burbujas y champagne"),
    blancos: t("grupo_blancos", "Blancos"),
    rosados: t("grupo_rosados", "Rosados"),
    tintos: t("grupo_tintos", "Tintos")
  };

  var numero = new Intl.NumberFormat(K.LOCALE, { maximumFractionDigits: 0, useGrouping: "always" });
  function precio(n) {
    var valor = estado.impuestos ? Math.round(n * FACTOR) : n;
    return "RD$ " + numero.format(valor);
  }

  function normalizar(s) {
    return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function escapar(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  // Texto de búsqueda de cada plato: nombres en los tres idiomas + descripción + categoría.
  var categoriaPorId = {};
  MENU.categorias.forEach(function (c) { categoriaPorId[c.id] = c; });
  MENU.platos.forEach(function (p) {
    var partes = [p.nombre.es, p.nombre.en, p.nombre.it, p.desc[LANG], p.desc.es, categoriaPorId[p.cat].nombre[LANG]];
    (p.tamanos || []).forEach(function (tm) { partes.push(tm.label[LANG], tm.label.es); });
    p._busqueda = normalizar(partes.join(" "));
  });

  function coincide(p) {
    if (estado.filtro === "lb" && p.unidad !== "lb") return false;
    if (estado.filtro !== "todo" && estado.filtro !== "lb" && (p.tags || []).indexOf(estado.filtro) === -1) return false;
    if (!estado.texto) return true;
    return estado.texto.split(/\s+/).every(function (palabra) { return p._busqueda.indexOf(palabra) !== -1; });
  }

  function htmlPrecio(p) {
    if (p.tamanos) return "";
    var unidad = p.unidad === "lb" ? "<small>" + t("por_libra", "por libra") + "</small>" : "";
    var imp = estado.impuestos ? '<small class="con-imp">' + t("con_imp", "con impuestos") + "</small>" : "";
    return '<p class="plato-precio">' + precio(p.precio) + unidad + imp + "</p>";
  }

  function htmlTamanos(p) {
    if (!p.tamanos) return "";
    var filas = p.tamanos.map(function (tm) {
      var unidad = p.unidad === "lb" ? " <small>/lb</small>" : "";
      return '<li><span>' + escapar(tm.label[LANG]) + '</span><span class="relleno" aria-hidden="true"></span><strong>' + precio(tm.precio) + unidad + "</strong></li>";
    }).join("");
    var nota = estado.impuestos ? '<li class="con-imp"><small>' + t("con_imp", "con impuestos") + "</small></li>" : "";
    return '<ul class="plato-tamanos">' + filas + nota + "</ul>";
  }

  function htmlPlato(p) {
    var foto = "";
    if (p.foto) {
      foto = '<img class="plato-foto" src="' + BASE + '/assets/img/fotos/' + p.foto + '-480.webp" width="76" height="76" loading="lazy" decoding="async" alt="">';
    }
    var tags = (p.tags || []).filter(function (x) { return TAGS[x]; }).map(function (x) {
      return '<span class="tag tag-' + x + '">' + TAGS[x] + "</span>";
    }).join("");
    var desc = p.desc[LANG] ? '<p class="plato-desc">' + escapar(p.desc[LANG]) + "</p>" : "";
    return '<li class="plato' + (p.foto ? " con-foto" : "") + '" id="plato-' + p.id + '">' +
      foto +
      '<div class="plato-cabeza"><h3 class="plato-nombre">' + escapar(p.nombre[LANG]) + "</h3>" +
      (tags ? '<div class="plato-tags">' + tags + "</div>" : "") + "</div>" +
      htmlPrecio(p) + desc + htmlTamanos(p) + "</li>";
  }


  function render() {
    var total = 0;
    var html = "";
    var visibles = [];
    MENU.categorias.forEach(function (cat) {
      var platos = MENU.platos.filter(function (p) { return p.cat === cat.id && coincide(p); });
      if (!platos.length) return;
      total += platos.length;
      visibles.push(cat);
      var cuerpo;
      if (cat.id === "vinos") {
        var grupos = {};
        platos.forEach(function (p) { (grupos[p.grupo] = grupos[p.grupo] || []).push(p); });
        cuerpo = Object.keys(GRUPOS).filter(function (g) { return grupos[g]; }).map(function (g) {
          return '<h3 class="menu-grupo">' + GRUPOS[g] + '</h3><ul class="menu-items">' + grupos[g].map(htmlPlato).join("") + "</ul>";
        }).join("");
      } else {
        cuerpo = '<ul class="menu-items">' + platos.map(htmlPlato).join("") + "</ul>";
      }
      html += '<section class="menu-cat" id="cat-' + cat.id + '" data-cat="' + cat.id + '" aria-labelledby="titulo-' + cat.id + '">' +
        '<h2 class="menu-cat-titulo" id="titulo-' + cat.id + '">' + escapar(cat.nombre[LANG]) +
        ' <span class="menu-cat-num">' + platos.length + "</span></h2>" + cuerpo + "</section>";
    });
    lista.innerHTML = html;
    vacio.hidden = total > 0;

    if (total && (estado.texto || estado.filtro !== "todo")) {
      resultado.textContent = total === 1 ? t("resultado_1", "1 plato encontrado") : t("resultado_n", "{n} platos encontrados", { n: total });
    } else {
      resultado.textContent = "";
    }

    navCats.innerHTML = visibles.map(function (c, i) {
      return '<li><a href="#cat-' + c.id + '" data-ir="' + c.id + '"' + (i === 0 ? ' aria-current="true"' : "") + ">" + escapar(c.nombre[LANG]) + "</a></li>";
    }).join("");
    vigilarCategorias();
    actualizarFlechas();
  }

  /* ---------------------------------------------------------- categoría visible */
  function marcarCategoria(id) {
    navCats.querySelectorAll("a").forEach(function (a) {
      var activa = a.getAttribute("data-ir") === id;
      if (activa) {
        a.setAttribute("aria-current", "true");
        var izq = a.offsetLeft - navCats.offsetLeft - 24;
        var der = izq + a.offsetWidth + 48;
        if (izq < navCats.scrollLeft || der > navCats.scrollLeft + navCats.clientWidth) {
          navCats.scrollLeft = Math.max(0, izq);
          actualizarFlechas();
        }
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  // Resalta la categoría que está bajo la barra fija mientras se hace scroll.
  var fijadaHasta = 0;
  var pendienteSpy = false;
  function categoriaVisible() {
    pendienteSpy = false;
    if (Date.now() < fijadaHasta) return;
    var borde = document.querySelector(".categorias").getBoundingClientRect().bottom + 24;
    var actual = null;
    lista.querySelectorAll(".menu-cat").forEach(function (s) {
      if (s.getBoundingClientRect().top <= borde) actual = s;
    });
    if (!actual) actual = lista.querySelector(".menu-cat");
    if (actual) marcarCategoria(actual.getAttribute("data-cat"));
  }
  function vigilarCategorias() { categoriaVisible(); }
  window.addEventListener("scroll", function () {
    if (!pendienteSpy) { pendienteSpy = true; window.requestAnimationFrame(categoriaVisible); }
  }, { passive: true });

  function actualizarFlechas() {
    var max = navCats.scrollWidth - navCats.clientWidth;
    if (btnPrev) btnPrev.disabled = navCats.scrollLeft <= 2;
    if (btnNext) btnNext.disabled = navCats.scrollLeft >= max - 2;
  }

  navCats.addEventListener("scroll", function () { window.requestAnimationFrame(actualizarFlechas); }, { passive: true });
  window.addEventListener("resize", actualizarFlechas);
  if (btnPrev) btnPrev.addEventListener("click", function () { navCats.scrollBy({ left: -navCats.clientWidth * 0.7, behavior: "smooth" }); });
  if (btnNext) btnNext.addEventListener("click", function () { navCats.scrollBy({ left: navCats.clientWidth * 0.7, behavior: "smooth" }); });
  navCats.addEventListener("click", function (ev) {
    var a = ev.target.closest("a[data-ir]");
    if (!a) return;
    ev.preventDefault();
    var destino = document.getElementById("cat-" + a.getAttribute("data-ir"));
    if (destino) {
      fijadaHasta = Date.now() + 900;
      destino.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      marcarCategoria(a.getAttribute("data-ir"));
      history.replaceState(null, "", "#cat-" + a.getAttribute("data-ir"));
    }
  });

  /* ---------------------------------------------------------- controles */
  var temporizador;
  buscador.addEventListener("input", function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      estado.texto = normalizar(buscador.value.trim());
      render();
    }, 120);
  });

  filtros.addEventListener("click", function (ev) {
    var chip = ev.target.closest("[data-filtro]");
    if (!chip) return;
    estado.filtro = chip.getAttribute("data-filtro");
    filtros.querySelectorAll("[data-filtro]").forEach(function (c) {
      c.setAttribute("aria-pressed", c === chip ? "true" : "false");
    });
    render();
  });

  if (interruptor) {
    interruptor.addEventListener("change", function () {
      estado.impuestos = interruptor.checked;
      try { localStorage.setItem("kukka-impuestos", estado.impuestos ? "1" : "0"); } catch (e) { /* sin almacenamiento */ }
      render();
    });
  }

  document.querySelector("[data-menu-limpiar]").addEventListener("click", function () {
    buscador.value = "";
    estado.texto = "";
    estado.filtro = "todo";
    filtros.querySelectorAll("[data-filtro]").forEach(function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-filtro") === "todo" ? "true" : "false");
    });
    render();
    buscador.focus();
  });

  var imprimir = document.querySelector("[data-imprimir]");
  if (imprimir) imprimir.addEventListener("click", function () { window.print(); });

  render();

  // Llegada desde un enlace a un plato o a una categoría (#plato-… / #cat-…)
  if (location.hash) {
    var destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destino) {
      setTimeout(function () {
        destino.scrollIntoView({ block: "start" });
        if (destino.classList.contains("plato")) destino.classList.add("destacado");
      }, 60);
    }
  }
})();
