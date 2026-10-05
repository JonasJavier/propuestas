/* ==========================================================================
   Plaza Merengue · Interacciones
   Sin dependencias. Todo funciona en un sitio estático (GitHub Pages).
   ========================================================================== */
(function () {
  'use strict';

  var WA_NUMBER = '18095257545';
  var OPEN = 8 * 60;          // 8:00 AM
  var CLOSE = 23 * 60 + 30;   // 11:30 PM
  var TZ = 'America/Santo_Domingo';

  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqDesktop = window.matchMedia ? matchMedia('(min-width: 768px)') : null;
  function desktop() { return !!(mqDesktop && mqDesktop.matches); }

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* almacenamiento no disponible */ } }
  };

  function money(n) { return 'RD$ ' + Number(n).toLocaleString('en-US'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function icon(id, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function hm(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function openWhatsApp(text) {
    var url = waLink(text);
    var w = window.open(url, '_blank');
    if (!w) window.location.href = url;
  }

  /* ------------------------------------------------------------------
     Hora local de República Dominicana
     ------------------------------------------------------------------ */
  function drNow() {
    var d = new Date();
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h23' }).formatToParts(d);
      var get = function (t) { for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value; return ''; };
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return {
        day: days[get('weekday')],
        mins: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10),
        y: +get('year'), m: +get('month'), d: +get('day')
      };
    } catch (e) {
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes(), y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
    }
  }

  /* ------------------------------------------------------------------
     1. Intro
     ------------------------------------------------------------------ */
  (function intro() {
    if (!root.classList.contains('intro')) return;
    try { sessionStorage.setItem('pm-intro', '1'); } catch (e) {}
    var done = false;
    function end() { if (done) return; done = true; root.classList.remove('intro', 'intro-skip'); }
    var screen = $('.intro-screen');
    if (screen) screen.addEventListener('click', function () { root.classList.add('intro-skip'); setTimeout(end, 380); });
    setTimeout(end, 3600);
  })();

  /* ------------------------------------------------------------------
     2. Header según el scroll + color de la barra del navegador
     ------------------------------------------------------------------ */
  var topbar = $('#topbar');
  var hero = $('.hero');
  var chips = $('[data-chips]');
  var metaTheme = $('meta[name="theme-color"]');
  var navOpen = false;

  function setTheme(c) { if (metaTheme && metaTheme.getAttribute('content') !== c) metaTheme.setAttribute('content', c); }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var hdr = topbar.offsetHeight;
    var heroEnd = hero ? hero.offsetTop + hero.offsetHeight - hdr : 0;
    var dark = y > 6 && y < heroEnd;
    var light = y >= heroEnd;
    topbar.classList.toggle('on-dark', dark);
    topbar.classList.toggle('scrolled', light);
    if (!navOpen) setTheme(light ? '#FBF6EE' : '#052E27');
    if (chips) chips.classList.toggle('stuck', chips.getBoundingClientRect().top <= hdr + 1);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ------------------------------------------------------------------
     3. Bloqueo de scroll para overlays
     ------------------------------------------------------------------ */
  var locks = 0;
  function lock() { locks++; root.classList.add('lock'); }
  function unlock() { locks = Math.max(0, locks - 1); if (!locks) root.classList.remove('lock'); }

  /* ------------------------------------------------------------------
     4. Menú de navegación
     ------------------------------------------------------------------ */
  var nav = $('[data-nav]');
  var navBtn = $('[data-open-nav]');
  function openNav() {
    if (navOpen) return;
    navOpen = true; nav.hidden = false; lock();
    navBtn.setAttribute('aria-expanded', 'true');
    setTheme('#052E27');
    requestAnimationFrame(function () { requestAnimationFrame(function () { nav.classList.add('open'); }); });
    setTimeout(function () { var b = $('[data-close-nav]', nav); if (b) b.focus({ preventScroll: true }); }, 300);
  }
  function closeNav() {
    if (!navOpen) return;
    navOpen = false; nav.classList.remove('open'); unlock();
    navBtn.setAttribute('aria-expanded', 'false');
    onScroll();
    setTimeout(function () { if (!navOpen) nav.hidden = true; }, reduceMotion ? 0 : 600);
  }
  navBtn.addEventListener('click', openNav);
  $$('[data-close-nav]', nav).forEach(function (el) { el.addEventListener('click', closeNav); });

  /* ------------------------------------------------------------------
     5. Estado abierto / cerrado + horario
     ------------------------------------------------------------------ */
  var DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  function status() {
    var n = drNow();
    var isOpen = n.mins >= OPEN && n.mins < CLOSE;
    var soon = isOpen && CLOSE - n.mins <= 60;
    var s;
    if (soon) s = { state: 'soon', short: 'Cierra pronto', title: 'Cierra pronto', sub: 'Hoy hasta las ' + hm(CLOSE), tag: 'Cierra pronto', line: 'Cierra pronto · hasta las ' + hm(CLOSE) };
    else if (isOpen) s = { state: 'open', short: 'Abierto', title: 'Abierto ahora', sub: 'Hasta las ' + hm(CLOSE), tag: 'Abierto ahora', line: 'Abierto hoy · ' + hm(OPEN) + ' – ' + hm(CLOSE) };
    else if (n.mins < OPEN) s = { state: 'closed', short: 'Cerrado', title: 'Cerrado ahora', sub: 'Abrimos hoy a las ' + hm(OPEN), tag: 'Cerrado', line: 'Cerrado · abrimos a las ' + hm(OPEN) };
    else s = { state: 'closed', short: 'Cerrado', title: 'Cerrado ahora', sub: 'Abrimos mañana ' + hm(OPEN), tag: 'Cerrado', line: 'Cerrado · abrimos mañana ' + hm(OPEN) };

    $$('[data-status-pill], [data-status-chip], [data-status-tag], .ns-status').forEach(function (el) { el.setAttribute('data-state', s.state); });
    $$('[data-status-short]').forEach(function (el) { el.textContent = s.short; });
    $$('[data-status-title]').forEach(function (el) { el.textContent = s.title; });
    $$('[data-status-sub]').forEach(function (el) { el.textContent = s.sub; });
    $$('[data-status-tag]').forEach(function (el) { el.textContent = s.tag; });
    $$('[data-status-line]').forEach(function (el) { el.textContent = s.line; });

    var list = $('[data-hours]');
    if (list) {
      var order = [1, 2, 3, 4, 5, 6, 0];
      list.innerHTML = order.map(function (d) {
        return '<li' + (d === n.day ? ' class="today"' : '') + '><span class="d">' + DAYS[d] + '</span><span>' + hm(OPEN) + ' – ' + hm(CLOSE) + '</span></li>';
      }).join('');
    }
    $$('[data-year]').forEach(function (el) { el.textContent = n.y; });
    updateAvailability(n);
  }

  function availability(kind, n) {
    var isOpen = n.mins >= OPEN && n.mins < CLOSE;
    if (kind === 'pizza') {
      var start = (n.day === 0 || n.day === 6) ? 12 * 60 : 16 * 60;
      if (isOpen && n.mins >= start) return { on: true, text: 'Disponible ahora' };
      if (n.mins < start) return { on: false, text: 'Hoy desde ' + hm(start) };
      return { on: false, text: 'Mañana' };
    }
    if (kind === 'sushi') {
      var served = n.day === 5 || n.day === 6 || n.day === 0;
      if (served && isOpen && n.mins >= 16 * 60) return { on: true, text: 'Disponible ahora' };
      if (served && n.mins < 16 * 60) return { on: false, text: 'Hoy desde 4:00 PM' };
      return { on: false, text: 'Vie a Dom' };
    }
    return null;
  }
  function updateAvailability(n) {
    $$('[data-avail]').forEach(function (el) {
      var a = availability(el.getAttribute('data-avail'), n);
      if (!a) return;
      el.classList.toggle('later', !a.on);
      el.innerHTML = '<span class="dot"></span>' + a.text;
    });
  }

  /* ------------------------------------------------------------------
     6. Menú: render, búsqueda y categorías
     ------------------------------------------------------------------ */
  var MENU = window.MERENGUE_MENU || [];
  var ITEMS = {};
  MENU.forEach(function (c) { c.items.forEach(function (it) { it.cat = c.id; ITEMS[it.id] = it; }); });

  var TAGS = {
    popular: ['Popular', 'flame'],
    chef: ['Chef', 'chef'],
    nuevo: ['Nuevo', 'sparkle'],
    veg: ['Veggie', 'leaf'],
    picante: ['Picante', 'flame']
  };
  function tagsHtml(tags) {
    return (tags || []).map(function (t) {
      var d = TAGS[t]; if (!d) return '';
      return '<span class="tag tag-' + t + '">' + icon(d[1]) + d[0] + '</span>';
    }).join('');
  }

  function itemHtml(it) {
    var hasImg = !!it.img;
    var sizes = it.sizes;
    var cls = 'item' + (hasImg ? ' has-img' : '') + (sizes ? ' has-sizes' : '');
    var h = '<li class="' + cls + '" data-item="' + it.id + '" data-q="' + esc(norm(it.name + ' ' + it.desc + ' ' + (it.tags || []).join(' '))) + '">';
    if (hasImg) h += '<img class="item-thumb" src="' + it.img + '" alt="" loading="lazy" width="72" height="72">';
    h += '<div class="item-main"><h4 class="item-name">' + esc(it.name) + tagsHtml(it.tags) + '</h4>';
    h += '<p class="item-desc">' + esc(it.desc) + '</p>';
    if (!sizes) h += '<p class="item-price"><small>RD$</small>' + it.price.toLocaleString('en-US') + '</p>';
    h += '</div>';
    if (sizes) {
      h += '<div class="sizes">' + sizes.map(function (s, i) {
        return '<button type="button" class="size-btn" data-add="' + it.id + '" data-size="' + i + '" aria-label="Agregar ' + esc(it.name) + ' ' + s[0] + ' al pedido"><span>' + s[0] + '</span><strong>' + money(s[1]) + '</strong>' + icon('plus') + '</button>';
      }).join('') + '</div>';
    } else {
      h += '<button type="button" class="add-btn" data-add="' + it.id + '" aria-label="Agregar ' + esc(it.name) + ' al pedido">' + icon('plus') + '</button>';
    }
    return h + '</li>';
  }

  function availHtml(c) { return c.schedule ? '<span class="avail" data-avail="' + c.schedule + '"></span>' : ''; }

  function renderMenu() {
    var wrap = $('[data-menu]'); if (!wrap) return;
    var track = $('[data-chips-track]');
    track.innerHTML = MENU.map(function (c, i) {
      return '<a class="chip' + (i === 0 ? ' on' : '') + '" href="#cat-' + c.id + '" data-chip="' + c.id + '">' + esc(c.name) + '</a>';
    }).join('');

    wrap.innerHTML = MENU.map(function (c, ci) {
      var next = MENU[(ci + 1) % MENU.length];
      var prev = ci > 0 ? MENU[ci - 1] : null;
      var nextBtn = '<div class="cat-nav">' +
        (prev ? '<button type="button" class="cat-btn cat-prev" data-goto="' + prev.id + '" aria-label="Anterior: ' + esc(prev.name) + '">' + icon('chevron-left') + '<span><small>Anterior</small>' + esc(prev.name) + '</span></button>' : '') +
        '<button type="button" class="cat-btn cat-next" data-goto="' + next.id + '"><span><small>' + (ci + 1 < MENU.length ? 'Siguiente' : 'Volver a') + '</small>' + esc(next.name) + '</span>' + icon('chevron') + '</button></div>';
      var h = '<section class="cat" id="cat-' + c.id + '" data-cat="' + c.id + '" aria-label="' + esc(c.name) + '">';
      if (c.special) {
        var p = c.items[0] && c.items[0].price;
        h += '<div class="special"><div class="special-top"><div><h3 class="cat-title">' + esc(c.name) + '</h3>';
        h += '<p class="cat-note">' + icon('clock') + esc(c.note) + '</p></div>';
        h += '<div class="special-price"><strong>' + money(p) + '</strong><span>cada plato</span></div></div>';
        if (c.sides) h += '<p class="sides-label">Acompáñalo con</p><ul class="sides">' + c.sides.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
        h += '<ul class="items">' + c.items.map(itemHtml).join('') + '</ul></div>';
        return h + nextBtn + '</section>';
      }
      if (c.banner) {
        var srcset = c.bannerWide ? ' srcset="' + c.banner + ' 900w, ' + c.bannerWide + ' 1800w" sizes="(min-width: 768px) 1160px, 100vw"' : '';
        h += '<div class="cat-banner"><img src="' + c.banner + '"' + srcset + ' alt="" loading="lazy"><h3 class="cat-title">' + esc(c.name) + '</h3>' + availHtml(c) + '</div>';
      } else {
        h += '<div class="cat-head"><h3 class="cat-title">' + esc(c.name) + '</h3>' + availHtml(c) + '</div>';
      }
      if (c.note) h += '<p class="cat-note">' + icon('clock') + esc(c.note) + '</p>';
      h += '<ul class="items">' + c.items.map(itemHtml).join('') + '</ul>';
      return h + nextBtn + '</section>';
    }).join('');
  }

  function chipsOffset() {
    return topbar.offsetHeight + (chips ? chips.offsetHeight : 0) + 6;
  }

  // El menú funciona por pestañas (una categoría a la vez); la búsqueda recorre todo.
  function setupMenu() {
    var track = $('[data-chips-track]');
    var chipEls = $$('[data-chip]', track);
    var cats = $$('[data-cat]');
    var input = $('[data-menu-search]');
    var clear = $('[data-search-clear]');
    var empty = $('[data-menu-empty]');
    var qOut = $('[data-menu-q]');
    var section = $('#menu');
    var active = cats[0] && cats[0].getAttribute('data-cat');

    function scrollChip(c) {
      var left = c.offsetLeft - 20;
      if (track.scrollTo) track.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' }); else track.scrollLeft = left;
    }

    function render() {
      var q = norm(input.value.trim());
      clear.hidden = !q;
      section.classList.toggle('searching', !!q);
      var any = false;
      cats.forEach(function (cat) {
        var id = cat.getAttribute('data-cat');
        var label = norm(cat.getAttribute('aria-label'));
        var vis = 0;
        $$('[data-item]', cat).forEach(function (li) {
          var ok = !q || li.getAttribute('data-q').indexOf(q) !== -1 || label.indexOf(q) !== -1;
          li.hidden = !ok; if (ok) vis++;
        });
        cat.hidden = q ? vis === 0 : id !== active;
        if (!cat.hidden) any = true;
      });
      chipEls.forEach(function (c) {
        var on = !q && c.getAttribute('data-chip') === active;
        c.classList.toggle('on', on);
        if (on) c.setAttribute('aria-selected', 'true'); else c.setAttribute('aria-selected', 'false');
      });
      empty.hidden = any;
      qOut.textContent = input.value.trim();
    }

    function select(id, focusTop) {
      active = id;
      if (input.value) input.value = '';
      render();
      var chip = $('[data-chip="' + id + '"]', track);
      if (chip) scrollChip(chip);
      var cat = document.getElementById('cat-' + id);
      if (cat && !reduceMotion) { cat.classList.remove('cat-in'); void cat.offsetWidth; cat.classList.add('cat-in'); }
      // Si ya bajamos dentro del menú, volvemos al inicio de la categoría
      if (focusTop && chips) {
        var chipsTop = chips.getBoundingClientRect().top;
        if (chipsTop <= topbar.offsetHeight + 2) {
          var top = window.scrollY + cat.getBoundingClientRect().top - chipsOffset();
          window.scrollTo({ top: top, behavior: 'auto' });
        }
      }
    }

    track.setAttribute('role', 'tablist');
    chipEls.forEach(function (c) { c.setAttribute('role', 'tab'); });
    track.addEventListener('click', function (e) {
      var a = e.target.closest('[data-chip]'); if (!a) return;
      e.preventDefault();
      select(a.getAttribute('data-chip'), true);
    });
    $('[data-menu]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-goto]'); if (!b) return;
      select(b.getAttribute('data-goto'), true);
    });

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
    clear.addEventListener('click', function () { input.value = ''; render(); input.focus(); });
    render();
  }

  /* ------------------------------------------------------------------
     7. Favoritos (carrusel)
     ------------------------------------------------------------------ */
  function renderFeatured() {
    var list = $('[data-featured]'); if (!list) return;
    var feats = (window.MERENGUE_FEATURED || []).filter(function (f) { return ITEMS[f.id]; });
    list.innerHTML = feats.map(function (f, i) {
      var it = ITEMS[f.id];
      var hasSize = it.sizes && f.size != null;
      var price = hasSize ? it.sizes[f.size][1] : it.price;
      var name = (it.cat === 'pizzas' ? 'Pizza ' : '') + it.name;
      return '<li class="fav">' +
        '<img src="' + f.img + '" alt="' + esc(name) + '" ' + (i < 2 ? '' : 'loading="lazy" ') + 'width="660" height="825">' +
        '<span class="fav-label">' + esc(f.label) + '</span>' +
        '<div class="fav-body"><h3 class="fav-name">' + esc(name) + '</h3><p class="fav-desc">' + esc(it.desc) + '</p>' +
        '<div class="fav-row"><span class="fav-price"><small>RD$</small>' + price.toLocaleString('en-US') + (hasSize ? ' <small>· ' + it.sizes[f.size][0] + '</small>' : '') + '</span>' +
        '<button type="button" class="fav-add" data-add="' + it.id + '"' + (hasSize ? ' data-size="' + f.size + '"' : '') + ' aria-label="Agregar ' + esc(name) + ' al pedido">' + icon('plus') + '<span>Agregar</span></button></div></div></li>';
    }).join('');

    var car = $('[data-carousel]');
    var dots = $('[data-carousel-dots]');
    dots.innerHTML = feats.map(function (_, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '></span>'; }).join('');
    var dotEls = $$('span', dots);
    var prev = $('[data-car-prev]'), next = $('[data-car-next]');
    function page(dir) {
      var card = $('.fav', car); if (!card) return;
      var w = card.offsetWidth + (parseFloat(getComputedStyle(card.parentNode).columnGap) || 14);
      var step = w * Math.max(1, Math.floor(car.clientWidth / w));
      car.scrollBy({ left: dir * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function arrows() {
      var max = car.scrollWidth - car.clientWidth;
      if (prev) prev.disabled = car.scrollLeft <= 4;
      if (next) next.disabled = car.scrollLeft >= max - 4;
    }
    if (prev) prev.addEventListener('click', function () { page(-1); });
    if (next) next.addEventListener('click', function () { page(1); });
    window.addEventListener('resize', arrows);
    arrows();
    var raf = false;
    car.addEventListener('scroll', function () {
      if (raf) return; raf = true;
      requestAnimationFrame(function () {
        raf = false;
        var card = $('.fav', car); if (!card) return;
        var step = card.offsetWidth + 14;
        var max = car.scrollWidth - car.clientWidth;
        var idx = car.scrollLeft >= max - 4 ? dotEls.length - 1 : Math.round(car.scrollLeft / step);
        dotEls.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
        arrows();
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     8. Pedido (carrito) → WhatsApp
     ------------------------------------------------------------------ */
  var cart = store.get('pm-cart', []).filter(function (l) { return ITEMS[l.id]; });
  function lineKey(id, size) { return id + (size != null ? '|' + size : ''); }
  function linePrice(l) { var it = ITEMS[l.id]; return l.size != null && it.sizes ? it.sizes[l.size][1] : it.price; }
  function lineName(l) { var it = ITEMS[l.id]; return (it.cat === 'pizzas' ? 'Pizza ' : '') + it.name; }
  function lineSize(l) { var it = ITEMS[l.id]; return l.size != null && it.sizes ? it.sizes[l.size][0] : ''; }
  function cartCount() { return cart.reduce(function (a, l) { return a + l.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (a, l) { return a + l.qty * linePrice(l); }, 0); }
  function saveCart() { store.set('pm-cart', cart); }

  function addToCart(id, size, btn) {
    var it = ITEMS[id]; if (!it) return;
    size = size != null && size !== '' ? parseInt(size, 10) : null;
    var key = lineKey(id, size);
    var line = null;
    for (var i = 0; i < cart.length; i++) if (lineKey(cart[i].id, cart[i].size) === key) line = cart[i];
    if (line) line.qty++; else cart.push({ id: id, size: size, qty: 1 });
    saveCart(); renderCart();

    var label = lineName({ id: id }) + (size != null ? ' (' + it.sizes[size][0] + ')' : '');
    toast('<b>' + esc(label) + '</b> agregado al pedido', true);
    $$('.cart-fab, .cart-btn').forEach(function (fab) { fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); });
    if (btn) {
      if (btn.classList.contains('fav-add')) {
        btn.classList.add('added');
        var sp = $('span', btn); if (sp) sp.textContent = 'Agregado';
        clearTimeout(btn._t);
        btn._t = setTimeout(function () { btn.classList.remove('added'); if (sp) sp.textContent = 'Agregar'; }, 1500);
      } else { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    }
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
  }

  function changeQty(key, delta) {
    for (var i = 0; i < cart.length; i++) {
      if (lineKey(cart[i].id, cart[i].size) === key) {
        cart[i].qty += delta;
        if (cart[i].qty <= 0) cart.splice(i, 1);
        break;
      }
    }
    saveCart(); renderCart();
  }

  function renderCart() {
    var count = cartCount();
    $$('[data-cart-count]').forEach(function (badge) { badge.hidden = count === 0; badge.textContent = count; });
    $('[data-open-cart].tab-cart').setAttribute('aria-label', count ? 'Ver mi pedido, ' + count + ' artículos' : 'Ver mi pedido');

    $('[data-cart-empty]').hidden = count > 0;
    $('[data-cart-full]').hidden = count === 0;
    $('[data-cart-list]').innerHTML = cart.map(function (l) {
      var key = lineKey(l.id, l.size);
      var size = lineSize(l);
      return '<li class="cart-line"><p class="cl-name">' + esc(lineName(l)) + (size ? '<small>' + size + '</small>' : '') + '</p>' +
        '<p class="cl-price">' + money(linePrice(l) * l.qty) + '</p>' +
        '<div class="qty-ctl"><button type="button" data-qty="-1" data-key="' + esc(key) + '" aria-label="Quitar uno">' + icon(l.qty === 1 ? 'trash' : 'minus') + '</button>' +
        '<output aria-live="polite">' + l.qty + '</output>' +
        '<button type="button" data-qty="1" data-key="' + esc(key) + '" aria-label="Agregar uno">' + icon('plus') + '</button></div></li>';
    }).join('');
    $('[data-cart-total]').textContent = money(cartTotal());

    // cantidades sobre los botones del menú
    $$('.add-btn[data-add], .size-btn[data-add]').forEach(function (b) {
      var key = lineKey(b.getAttribute('data-add'), b.hasAttribute('data-size') ? parseInt(b.getAttribute('data-size'), 10) : null);
      var q = 0;
      cart.forEach(function (l) { if (lineKey(l.id, l.size) === key) q = l.qty; });
      b.classList.toggle('has', q > 0);
      var bub = $('.qty', b);
      if (q > 0) { if (!bub) { bub = document.createElement('span'); bub.className = 'qty'; b.appendChild(bub); } bub.textContent = q; }
      else if (bub) bub.remove();
    });
  }

  // Hoja inferior
  var sheet = $('[data-cart-sheet]');
  var panel = $('[data-sheet-panel]');
  var sheetOpen = false, lastFocus = null;
  function openCart() {
    if (sheetOpen) return;
    if (navOpen) closeNav();
    sheetOpen = true; lastFocus = document.activeElement;
    sheet.hidden = false; lock();
    panel.style.transform = '';
    requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add('open'); }); });
    setTimeout(function () { var b = $('.sheet-head [data-close-cart]', sheet); if (b) b.focus({ preventScroll: true }); }, 350);
  }
  function closeCart() {
    if (!sheetOpen) return;
    sheetOpen = false; sheet.classList.remove('open'); panel.style.transform = ''; unlock();
    setTimeout(function () { if (!sheetOpen) sheet.hidden = true; }, reduceMotion ? 0 : 450);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  // Arrastrar hacia abajo para cerrar
  (function drag() {
    var grip = $('[data-sheet-grip]'), head = $('.sheet-head', sheet);
    var startY = 0, dy = 0, active = false;
    function down(e) {
      if (e.target.closest('button') || desktop()) return;
      active = true; startY = e.clientY; dy = 0; panel.classList.add('dragging');
      if (e.currentTarget.setPointerCapture) try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
    }
    function move(e) { if (!active) return; dy = Math.max(0, e.clientY - startY); panel.style.transform = 'translateY(' + dy + 'px)'; }
    function up() {
      if (!active) return; active = false; panel.classList.remove('dragging');
      if (dy > 110) closeCart(); else panel.style.transform = '';
    }
    [grip, head].forEach(function (el) {
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  })();

  function setupOrderForm() {
    var form = $('[data-order-form]');
    var addrField = $('[data-address-field]');
    var err = $('[data-order-error]');
    function syncType() { addrField.hidden = form.type.value !== 'Delivery'; }
    $$('input[name="type"]', form).forEach(function (r) { r.addEventListener('change', syncType); });
    syncType();

    var saved = store.get('pm-customer', {});
    if (saved.name) form.name.value = saved.name;
    if (saved.address) form.address.value = saved.address;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      $$('.invalid', form).forEach(function (el) { el.classList.remove('invalid'); });
      var type = form.type.value;
      var name = form.name.value.trim();
      var address = form.address.value.trim();
      var bad = null;
      if (!name) bad = form.name;
      else if (type === 'Delivery' && !address) bad = form.address;
      if (bad) {
        bad.classList.add('invalid'); bad.focus();
        err.textContent = bad === form.name ? 'Escribe tu nombre para enviar el pedido.' : 'Indica la dirección de entrega.';
        err.hidden = false; return;
      }
      if (!cart.length) return;
      store.set('pm-customer', { name: name, address: address });

      var lines = cart.map(function (l) {
        var size = lineSize(l);
        return '• ' + l.qty + '× ' + lineName(l) + (size ? ' (' + size + ')' : '') + ' — ' + money(linePrice(l) * l.qty);
      });
      var msg = '¡Hola Merengue! 👋 Quiero hacer un pedido:\n\n' + lines.join('\n') +
        '\n\n*Subtotal: ' + money(cartTotal()) + '*' +
        '\n\n' + (type === 'Delivery' ? '🛵 Delivery' : '🛍️ Para recoger') +
        '\n👤 Nombre: ' + name +
        (type === 'Delivery' ? '\n📍 Dirección: ' + address : '') +
        '\n💳 Pago: ' + form.pay.value +
        (form.notes.value.trim() ? '\n📝 Nota: ' + form.notes.value.trim() : '') +
        '\n\n(Pedido enviado desde la web)';
      openWhatsApp(msg);
      toast('¡Listo! Abrimos WhatsApp con tu pedido 🙌');
    });

    $('[data-cart-clear]').addEventListener('click', function () {
      cart = []; saveCart(); renderCart();
      toast('Pedido vaciado');
    });

    $('[data-cart-list]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-qty]'); if (!b) return;
      changeQty(b.getAttribute('data-key'), parseInt(b.getAttribute('data-qty'), 10));
    });
  }

  /* ------------------------------------------------------------------
     9. Reservas → WhatsApp
     ------------------------------------------------------------------ */
  function setupReservation() {
    var form = $('[data-res-form]'); if (!form) return;
    var n = drNow();
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var today = n.y + '-' + pad(n.m) + '-' + pad(n.d);
    form.date.min = today;
    form.date.value = today;

    var sel = $('[data-time-select]');
    var opts = '';
    for (var t = OPEN; t <= CLOSE - 60; t += 30) {
      opts += '<option value="' + hm(t) + '"' + (t === 19 * 60 ? ' selected' : '') + '>' + hm(t) + '</option>';
    }
    sel.innerHTML = opts;

    var people = 2, out = $('[data-people]');
    $$('[data-step]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        people = Math.min(60, Math.max(1, people + parseInt(b.getAttribute('data-step'), 10)));
        out.textContent = people;
      });
    });

    var saved = store.get('pm-customer', {});
    if (saved.name) form.name.value = saved.name;

    var err = $('[data-res-error]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      $$('.invalid', form).forEach(function (el) { el.classList.remove('invalid'); });
      var name = form.name.value.trim();
      if (!name) { form.name.classList.add('invalid'); form.name.focus(); err.textContent = 'Escribe a nombre de quién va la reserva.'; err.hidden = false; return; }
      if (!form.date.value || form.date.value < today) { form.date.classList.add('invalid'); form.date.focus(); err.textContent = 'Elige una fecha a partir de hoy.'; err.hidden = false; return; }
      var c = store.get('pm-customer', {}); c.name = name; store.set('pm-customer', c);

      var p = form.date.value.split('-');
      var dateTxt = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' });
      var area = form.area.value;
      var occ = form.occasion.value;
      var notes = form.notes.value.trim();
      var msg = '¡Hola Merengue! 👋 Me gustaría reservar una mesa:\n\n' +
        '👤 Nombre: ' + name +
        '\n📅 Fecha: ' + dateTxt +
        '\n🕐 Hora: ' + form.time.value +
        '\n👥 Personas: ' + people +
        '\n📍 Área: ' + area +
        (occ ? '\n🎉 Ocasión: ' + occ : '') +
        (notes ? '\n📝 Comentarios: ' + notes : '') +
        '\n\n¿Me confirman disponibilidad? ¡Gracias!';
      openWhatsApp(msg);
      toast('¡Listo! Abrimos WhatsApp con tu reserva 🎉');
    });
  }

  /* ------------------------------------------------------------------
     10. Galería (lightbox con swipe)
     ------------------------------------------------------------------ */
  function setupGallery() {
    var grid = $('[data-gallery]'); if (!grid) return;
    var lb = $('[data-lightbox]'), img = $('[data-lb-img]'), cap = $('[data-lb-cap]'), count = $('[data-lb-count]');
    var items = $$('.gal-item img', grid).map(function (i) { return { src: i.getAttribute('src'), alt: i.getAttribute('alt') }; });
    var idx = 0, open = false, opener = null;

    function show(i, animate) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      function set() { img.src = it.src; img.alt = it.alt; cap.textContent = it.alt; count.textContent = (idx + 1) + ' / ' + items.length; }
      if (animate && !reduceMotion) { img.classList.add('swap'); setTimeout(function () { set(); img.onload = function () { img.classList.remove('swap'); }; if (img.complete) img.classList.remove('swap'); }, 160); }
      else set();
    }
    function openLb(i) {
      opener = document.activeElement; open = true; show(i, false);
      lb.hidden = false; lock();
      requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('open'); }); });
      setTimeout(function () { $('[data-lb-close]').focus({ preventScroll: true }); }, 50);
    }
    function closeLb() {
      if (!open) return; open = false; lb.classList.remove('open'); unlock();
      setTimeout(function () { if (!open) lb.hidden = true; }, 300);
      if (opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) {}
    }
    $$('.gal-item', grid).forEach(function (b, i) { b.setAttribute('aria-label', 'Ver foto: ' + items[i].alt); b.addEventListener('click', function () { openLb(i); }); });
    $('[data-lb-close]').addEventListener('click', closeLb);
    $('[data-lb-prev]').addEventListener('click', function () { show(idx - 1, true); });
    $('[data-lb-next]').addEventListener('click', function () { show(idx + 1, true); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

    var sx = 0, sy = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1), true);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLb();
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'ArrowRight') show(idx + 1, true);
      if (e.key === 'ArrowLeft') show(idx - 1, true);
    });
    return closeLb;
  }

  /* ------------------------------------------------------------------
     11. Toast
     ------------------------------------------------------------------ */
  var toastEl = $('[data-toast]'), toastMsg = $('[data-toast-msg]'), toastTimer;
  function toast(html, withAction) {
    toastMsg.innerHTML = html;
    $('.toast-btn', toastEl).hidden = !withAction;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ------------------------------------------------------------------
     12. Animaciones al hacer scroll + pestaña activa
     ------------------------------------------------------------------ */
  function setupReveal() {
    var els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  function setupTabs() {
    var tabs = $$('[data-tab]');
    var sections = $$('[data-section]');
    function update() {
      var mid = window.innerHeight * 0.45, active = null;
      sections.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) active = s.getAttribute('data-section');
      });
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === active;
        t.classList.toggle('on', on);
        if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
      });
    }
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; update(); }); }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     13. Compartir
     ------------------------------------------------------------------ */
  function setupShare() {
    $$('[data-share]').forEach(function (b) {
      b.addEventListener('click', function () {
        var data = { title: 'Plaza Merengue', text: 'Tradición, ritmo y sabor en Bonao desde 1980 🇩🇴', url: location.href.split('#')[0] };
        if (navigator.share) { navigator.share(data).catch(function () {}); return; }
        if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function () { toast('Enlace copiado ✨'); }, function () {});
      });
    });
  }

  /* ------------------------------------------------------------------
     Inicio
     ------------------------------------------------------------------ */
  renderMenu();
  renderFeatured();
  setupMenu();
  setupOrderForm();
  setupReservation();
  var closeLb = setupGallery();
  setupReveal();
  setupTabs();
  setupShare();
  status();
  renderCart();
  onScroll();
  setInterval(status, 60 * 1000);

  // Delegación: agregar al pedido / abrir pedido
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) { addToCart(add.getAttribute('data-add'), add.getAttribute('data-size'), add); return; }
    if (e.target.closest('[data-open-cart]')) { toastEl.classList.remove('show'); openCart(); return; }
    var close = e.target.closest('[data-close-cart]');
    if (close) {
      var href = close.getAttribute('href');
      closeCart();
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) setTimeout(function () { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }, 60);
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (closeLb) closeLb();
    closeCart(); closeNav();
  });
})();
