/* The Deck · menú interactivo y pedido por WhatsApp.
   La carta llega pre-renderizada en menu.html (desde menu-data.js); aquí se filtra y se pide. */
(() => {
  "use strict";

  const C = window.DECK;
  const MENU = window.MENU || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const carta = $("[data-carta]");
  if (!carta) return;

  const rd = (n) => `RD$ ${n.toLocaleString("en-US")}`;
  const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ico = (id) => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  const TAGS = {
    popular: ["tag--popular", "heart", "Lo más pedido"],
    chef: ["tag--chef", "chef", "De la casa"],
    veg: ["tag--veg", "leaf", "Vegetariano"],
    picante: ["tag--picante", "chili", "Picante"]
  };

  /* ------------------------------------------------------------ Datos */
  const platos = new Map();
  MENU.forEach((cat) => {
    cat.items.forEach((it) => {
      const id = `${cat.id}-${slug(it.name)}`;
      const opciones = it.options ? it.options.map(([l, p]) => ({ label: l, price: p })) : [{ label: "", price: it.price }];
      platos.set(id, { ...it, id, cat, opciones, texto: norm(`${it.name} ${it.desc || ""} ${cat.name}`) });
    });
  });

  /* La carta ya viene pintada en el HTML (tools/build.py la genera desde menu-data.js) */
  const lista = $("[data-cat-lista]");

  /* ------------------------------------------------------------ Buscar y filtrar */
  const buscar = $("[data-buscar]");
  const limpiar = $("[data-limpiar]");
  const vacio = $("[data-vacio]");
  const anuncio = $("[data-anuncio]");
  const filtros = $$("[data-filtro]");
  let filtro = "";

  function aplicar() {
    const q = norm(buscar.value.trim());
    const palabras = q.split(/\s+/).filter(Boolean);
    let total = 0;
    $$(".categoria", carta).forEach((sec) => {
      let visibles = 0;
      $$(".plato", sec).forEach((el) => {
        const p = platos.get(el.dataset.plato);
        const ok = palabras.every((w) => p.texto.includes(w)) && (!filtro || (p.tags || []).includes(filtro));
        el.hidden = !ok;
        if (ok) visibles++;
      });
      sec.hidden = visibles === 0;
      $(`[data-cat="${sec.dataset.categoria}"]`, lista).hidden = visibles === 0;
      total += visibles;
    });
    limpiar.hidden = !buscar.value;
    vacio.hidden = total > 0;
    $("[data-vacio-q]").textContent = buscar.value.trim() || (filtros.find((f) => f.dataset.filtro === filtro)?.textContent.trim() ?? "");
    anuncio.textContent = palabras.length || filtro ? `${total} ${total === 1 ? "plato" : "platos"}` : "";
    flechas();
    marcarActiva();
  }

  let t;
  buscar.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(aplicar, 120);
  });
  limpiar.addEventListener("click", () => {
    buscar.value = "";
    aplicar();
    buscar.focus();
  });
  filtros.forEach((b) => b.addEventListener("click", () => {
    filtro = b.dataset.filtro;
    filtros.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    aplicar();
  }));
  $("[data-ver-todo]").addEventListener("click", () => {
    buscar.value = "";
    filtro = "";
    filtros.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.filtro === "")));
    aplicar();
  });

  /* ------------------------------------------------------------ Barra de categorías */
  const prev = $("[data-cat-prev]");
  const next = $("[data-cat-next]");
  function flechas() {
    const max = lista.scrollWidth - lista.clientWidth;
    prev.disabled = lista.scrollLeft <= 2;
    next.disabled = lista.scrollLeft >= max - 2;
  }
  prev.addEventListener("click", () => lista.scrollBy({ left: -lista.clientWidth * 0.7, behavior: reduce ? "auto" : "smooth" }));
  next.addEventListener("click", () => lista.scrollBy({ left: lista.clientWidth * 0.7, behavior: reduce ? "auto" : "smooth" }));
  lista.addEventListener("scroll", flechas, { passive: true });
  window.addEventListener("resize", flechas);

  let activa = "";
  function activar(id) {
    if (id === activa) return;
    activa = id;
    $$("a", lista).forEach((a) => (a.dataset.cat === id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    const a = $(`[data-cat="${id}"]`, lista);
    if (a) lista.scrollTo({ left: a.offsetLeft - lista.clientWidth / 2 + a.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }
  function marcarActiva() {
    const linea = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cab-h")) + 90;
    let actual = "";
    $$(".categoria:not([hidden])", carta).forEach((sec) => {
      if (sec.getBoundingClientRect().top - linea <= 0) actual = sec.dataset.categoria;
    });
    activar(actual || $(".categoria:not([hidden])", carta)?.dataset.categoria || "");
  }
  let pend = false;
  window.addEventListener("scroll", () => {
    if (pend) return;
    pend = true;
    requestAnimationFrame(() => {
      pend = false;
      marcarActiva();
    });
  }, { passive: true });

  /* ------------------------------------------------------------ Pedido */
  const CLAVE = "thedeck-pedido";
  let pedido = [];
  try {
    pedido = JSON.parse(localStorage.getItem(CLAVE) || "[]").filter((l) => platos.has(l.id) && platos.get(l.id).opciones[l.op]);
  } catch (e) {
    pedido = [];
  }
  const guardar = () => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(pedido));
    } catch (e) {
      /* modo privado o almacenamiento lleno: el pedido sigue en memoria */
    }
  };

  const dCarrito = $("#carrito");
  const fPedido = $("#form-pedido");
  const itemsEl = $("[data-carrito-items]");
  const linea = (l) => {
    const p = platos.get(l.id);
    const o = p.opciones[l.op];
    return { p, o, total: o.price * l.qty };
  };
  const subtotal = () => pedido.reduce((s, l) => s + linea(l).total, 0);
  const unidades = () => pedido.reduce((s, l) => s + l.qty, 0);

  function pintarPedido() {
    const n = unidades();
    $$("[data-carrito-cuenta]").forEach((el) => (el.textContent = n ? String(n) : ""));
    const flotante = $(".carrito-flotante");
    flotante.classList.toggle("is-visible", n > 0);
    $("[data-carrito-total]").textContent = rd(subtotal());
    flotante.setAttribute("aria-label", n ? `Ver tu pedido: ${n} ${n === 1 ? "plato" : "platos"}, ${rd(subtotal())}` : "Ver tu pedido");

    $("[data-carrito-vacio]").hidden = n > 0;
    $("[data-carrito-datos]").hidden = n === 0;
    $("[data-enviar-pedido]").disabled = n === 0;
    $("[data-vaciar]").hidden = n === 0;
    $("[data-carrito-subtotal]").textContent = rd(subtotal());
    itemsEl.innerHTML = pedido.map((l, i) => {
      const { p, o, total } = linea(l);
      return `<div class="carrito-item">
        <p class="carrito-item-nombre">${esc(p.name)}${o.label ? `<span class="carrito-item-op">${esc(o.label)}</span>` : ""}</p>
        <p class="carrito-item-precio">${rd(total)}</p>
        <div class="cantidad">
          <button type="button" data-menos="${i}" aria-label="Quitar uno de ${esc(p.name)}">${ico(l.qty === 1 ? "trash" : "minus")}</button>
          <output aria-live="polite">${l.qty}</output>
          <button type="button" data-mas="${i}" aria-label="Agregar otro ${esc(p.name)}">${ico("plus")}</button>
        </div>
      </div>`;
    }).join("");

    // Aviso según la hora
    const ahora = window.DeckHours.nowDR();
    const est = window.DeckHours.status(ahora.day, ahora.min);
    const cocina = window.DeckHours.toMin(C.kitchenClose);
    const avisos = [];
    if (est.state === "closed") avisos.push(`Ahora estamos cerrados (${est.long.replace("Cerrado · ", "")}). Puedes enviarlo y te respondemos al abrir.`);
    else if (ahora.min >= cocina) avisos.push(`La cocina ya cerró por hoy (cierra a las ${window.DeckHours.fmt(cocina)}).`);
    else avisos.push(`Cocina abierta hasta las ${window.DeckHours.fmt(cocina)}.`);
    const hayDesayuno = pedido.some((l) => platos.get(l.id).cat.id === "desayunos");
    if (hayDesayuno && est.state !== "closed" && ahora.min >= window.DeckHours.toMin(C.breakfastUntil)) {
      avisos.push("Ojo: los desayunos son hasta el mediodía.");
    }
    $("[data-carrito-estado]").textContent = avisos.join(" ");
  }

  function rebotar() {
    if (reduce) return;
    $$(".carrito-flotante, .barra-item--accion").forEach((el) => {
      el.classList.remove("is-bote");
      void el.offsetWidth;
      el.classList.add("is-bote");
    });
  }

  carta.addEventListener("click", (e) => {
    const b = e.target.closest("[data-agregar]");
    if (!b) return;
    const id = b.dataset.agregar;
    const op = Number(b.dataset.op);
    const l = pedido.find((x) => x.id === id && x.op === op);
    if (l) l.qty++;
    else pedido.push({ id, op, qty: 1 });
    guardar();
    pintarPedido();
    rebotar();
    const nombre = platos.get(id).name;
    anuncio.textContent = `Agregado al pedido: ${nombre}`;
    b.classList.add("is-agregado");
    $("span", b).textContent = "Agregado";
    $("use", b).setAttribute("href", "#i-check");
    clearTimeout(b._t);
    b._t = setTimeout(() => {
      b.classList.remove("is-agregado");
      $("span", b).textContent = "Agregar";
      $("use", b).setAttribute("href", "#i-plus");
    }, 1300);
  });

  itemsEl.addEventListener("click", (e) => {
    const mas = e.target.closest("[data-mas]");
    const menos = e.target.closest("[data-menos]");
    if (mas) pedido[Number(mas.dataset.mas)].qty++;
    else if (menos) {
      const i = Number(menos.dataset.menos);
      pedido[i].qty--;
      if (pedido[i].qty <= 0) pedido.splice(i, 1);
    } else return;
    guardar();
    pintarPedido();
  });

  $("[data-vaciar]").addEventListener("click", () => {
    pedido = [];
    guardar();
    pintarPedido();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-abrir-carrito]")) return;
    pintarPedido();
    window.DeckDialog(dCarrito);
  });

  const campoDir = $("[data-campo-direccion]");
  const dir = $("#p-direccion");
  const nombre = $("#p-nombre");
  fPedido.addEventListener("change", (e) => {
    if (e.target.name === "entrega") campoDir.hidden = e.target.value !== "Delivery";
  });
  const error = (campo, msg) => {
    const p = document.getElementById(`${campo.id}-error`);
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    p.textContent = msg;
    p.hidden = !msg;
    return !msg;
  };
  [dir, nombre].forEach((c) => c.addEventListener("input", () => c.getAttribute("aria-invalid") === "true" && error(c, "")));

  fPedido.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pedido.length) return;
    const entrega = fPedido.entrega.value;
    const okDir = entrega !== "Delivery" || error(dir, dir.value.trim().length < 6 ? "Escribe la dirección y una referencia para llegar." : "");
    const okNom = error(nombre, nombre.value.trim().length < 2 ? "Escribe tu nombre." : "");
    if (!(okDir && okNom)) {
      $("[aria-invalid='true']", fPedido)?.focus();
      return;
    }
    const lineas = pedido.map((l) => {
      const { p, o, total } = linea(l);
      return `• ${l.qty} × ${p.name}${o.label ? ` (${o.label})` : ""} — ${rd(total)}`;
    });
    const nota = fPedido.nota.value.trim();
    const texto = [
      "¡Hola, The Deck! 👋 Quiero hacer un pedido:",
      "",
      ...lineas,
      "",
      `Subtotal: ${rd(subtotal())} (sin impuestos ni delivery)`,
      entrega === "Delivery" ? `🛵 Delivery a: ${dir.value.trim()}` : "🏃 Paso a recogerlo al local",
      `💳 Pago: ${fPedido.pago.value}`,
      `🙋 A nombre de ${nombre.value.trim()}`,
      nota ? `📝 ${nota}` : null,
      "",
      entrega === "Delivery" ? "¿Me confirman el total y el tiempo de entrega? ¡Gracias!" : "¿Me avisan cuando esté listo? ¡Gracias!"
    ].filter((l) => l !== null).join("\n");
    const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
  });

  /* ------------------------------------------------------------ Inicio */
  pintarPedido();
  aplicar();
  if (location.hash.startsWith("#cat-")) {
    const sec = document.querySelector(location.hash);
    if (sec) sec.scrollIntoView();
  }
})();
