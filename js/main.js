/* Huma café · demo — intro del sello, hero sobre la mesa, la luz del día, carta con la taza por dentro,
   la tolva que rota, catas con cupo, mazo de fotos y la esquina. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var esDesk = function () { return window.innerWidth >= 1100; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ================= hora en Buenos Aires y momento del día ================= */
  var DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  var NOMBRE_DIA = { dom: 'domingo', lun: 'lunes', mar: 'martes', mie: 'miércoles', jue: 'jueves', vie: 'viernes', sab: 'sábado' };
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var ABRE = { lun: 8, mar: 8, mie: 8, jue: 8, vie: 8, sab: 9, dom: 10 }, CIERRA = 20;
  function ahora() {
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var d = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay();
    return { fecha: p.year + '-' + p.month + '-' + p.day, dia: DIAS[d], diaN: d, min: (+p.hour % 24) * 60 + +p.minute };
  }
  var param = new URLSearchParams(location.search).get('momento');
  function momentoDe(t) {
    if (param && /^(manana|mediodia|tarde|noche)$/.test(param)) return param;
    var h = t.min / 60;
    if (h < ABRE[t.dia] || h >= CIERRA) return 'noche';
    if (h < 12) return 'manana';
    if (h < 16) return 'mediodia';
    return 'tarde';
  }
  function estado() {
    var t = ahora(), abre = ABRE[t.dia], m = momentoDe(t);
    var manana = DIAS[(t.diaN + 1) % 7];
    var abierto = m !== 'noche';
    var corto, largo;
    if (abierto) { corto = 'Abierto ahora · hasta las 20 h'; largo = 'Abierto ahora · cerramos a las 20'; }
    else if (t.min < abre * 60 && !param) { corto = 'Abrimos hoy a las ' + abre; largo = corto + ' · hasta las 20'; }
    else { corto = 'Abrimos mañana a las ' + ABRE[manana]; largo = 'Ya cerramos por hoy · abrimos mañana a las ' + ABRE[manana]; }
    return { t: t, m: m, abierto: abierto, corto: corto, largo: largo };
  }
  var EST = estado();
  function pintarEstado() {
    EST = estado();
    var h = $('[data-estado-hero]'), hs = $('[data-estado-hero-s]');
    if (h) h.textContent = EST.abierto ? 'Abierto ahora' : 'Hoy ya cerramos';
    if (hs) hs.textContent = EST.abierto ? 'hasta las 20 h' : EST.corto.toLowerCase();
    var l = $('[data-estado-largo]'); if (l) { l.textContent = EST.largo; l.classList.toggle('is-cerrado', !EST.abierto); }
    $$('.horario__fila').forEach(function (f) { f.classList.toggle('is-hoy', (f.dataset.dias || '').split(',').indexOf(EST.t.dia) >= 0); });
    // la luz de la ventana cambia de ángulo con la hora
    var hora = EST.t.min / 60, ang = 100 + Math.max(0, Math.min(1, (hora - 8) / 12)) * 40;
    if (param) ang = { manana: 104, mediodia: 120, tarde: 136, noche: 140 }[param];
    html.style.setProperty('--ang', ang.toFixed(0) + 'deg');
    pintarMomentos();
  }

  /* ================= la luz del día ================= */
  var TITULOS = {
    manana: ['Ahora: desayunos', 'Buen día. A esta hora salen el avocado toast, las medialunas y la Promo Huma.'],
    mediodia: ['Ahora: almuerzos', 'Mediodía en la esquina: tostones, baguettes y ensaladas para quedarte o llevar.'],
    tarde: ['Ahora: meriendas', 'La mejor luz del día. Rolls, tortas y un flat white al solcito.'],
    noche: ['Qué pedir mañana', 'Ahora estamos cerrados, pero podés dejar tu pedido armado para mañana.']
  };
  function pintarMomentos() {
    var m = EST.m;
    var tt = $('[data-ahora-t]'), tp = $('[data-ahora-p]');
    if (tt) tt.textContent = TITULOS[m][0];
    if (tp) tp.textContent = TITULOS[m][1];
    var foco = m === 'noche' ? 'manana' : m;
    $$('.momento').forEach(function (el) { el.classList.toggle('is-ahora', el.dataset.momento === foco); });
    $$('.momento__ya').forEach(function (b) { b.textContent = m === 'noche' ? 'Mañana' : 'Ahora'; });
  }
  function centrarMomento() {
    var fila = $('.ahora__fila'), on = $('.momento.is-ahora');
    if (!fila || !on || esDesk()) return;
    fila.scrollLeft = Math.max(0, on.offsetLeft - parseFloat(getComputedStyle(fila).paddingLeft || 0));
  }
  pintarEstado();
  centrarMomento();
  window.addEventListener('load', centrarMomento);
  setInterval(pintarEstado, 60000);

  /* ================= intro: el sello ================= */
  var intro = $('#intro'), hero = $('.hero'), hdr = $('#hdr');
  function entrarHero() {
    var d = 0;
    [$('.hero__eyebrow')].forEach(function (e) { if (e) e.style.setProperty('--d', d++); });
    $$('.hero__t .lin > span').forEach(function (e) { e.style.setProperty('--d', d++); });
    [$('.hero__p'), $('.hero__btns'), $('.hero__datos')].forEach(function (e) { if (e) e.style.setProperty('--d', d++); });
    $$('.hm').forEach(function (e, i) { e.style.setProperty('--d', i); });
    hero.classList.add('is-in'); hdr.classList.add('is-in');
    setTimeout(function () { hero.classList.add('is-done'); }, 2200);
  }
  function arrancarIntro() {
    if (!html.classList.contains('con-intro') || !intro) { entrarHero(); html.classList.add('intro-listo'); return; }
    var movil = window.innerWidth < 768;
    var k = movil ? .8 : 1;
    var tLuz = 300 * k, tSello = 450 * k, tGira = 430 * k, tAbre = 650 * k;
    intro.style.setProperty('--t-sello', tSello + 'ms');
    intro.style.setProperty('--t-gira', tGira + 'ms');
    intro.style.setProperty('--t-abre', tAbre + 'ms');
    html.classList.add('intro-lock');
    var t0 = performance.now();
    requestAnimationFrame(function () { intro.classList.add('is-luz'); });
    setTimeout(function () { intro.classList.add('is-sello'); }, tLuz);
    var minAbre = tLuz + tSello + tGira, maxAbre = 2600;
    var img = window.innerWidth >= 900 ? $('#heroImgDesk') : $('#heroImg');
    var listoImg = new Promise(function (r) { if (!img || (img.complete && img.naturalWidth)) r(); else { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); } });
    var listoFuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var tope = new Promise(function (r) { setTimeout(r, maxAbre); });
    var girado = false;
    setTimeout(function () { intro.classList.add('is-gira'); girado = true; }, tLuz + tSello);
    Promise.race([Promise.all([listoImg, listoFuentes]), tope]).then(function () {
      setTimeout(abrir, Math.max(0, minAbre - (performance.now() - t0)));
    });
    var abierto = false;
    function abrir() {
      if (abierto) return; abierto = true;
      if (!girado) intro.classList.add('is-gira');
      intro.classList.add('is-abre');
      setTimeout(entrarHero, tAbre * .35);
      setTimeout(function () { intro.classList.add('is-fin'); html.classList.remove('intro-lock'); html.classList.add('intro-listo'); }, tAbre + 60);
    }
    setTimeout(abrir, 4200);
  }
  arrancarIntro();

  /* ================= header, scroll y la luz que se mueve ================= */
  var tick = false, rayas = $('.hero__rayas');
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      tick = false;
      var y = window.scrollY;
      hdr.classList.toggle('is-sombra', y > 8);
      if (hero) html.classList.toggle('en-hero', y < hero.offsetHeight * .55);
      if (!REDUCE && rayas && y < hero.offsetHeight) rayas.style.transform = 'translate3d(' + (-(y * .12)).toFixed(1) + 'px,0,0)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.hdr__nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean).forEach(function (s) { io.observe(s); });
  }

  /* ================= menú celu ================= */
  var menu = $('#menu'), btnMenu = $('.hdr__menu'), scrollGuardado = 0;
  function bloquear(on) {
    if (on) { scrollGuardado = window.scrollY; document.body.style.position = 'fixed'; document.body.style.top = -scrollGuardado + 'px'; document.body.style.width = '100%'; }
    else { document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = ''; html.style.scrollBehavior = 'auto'; window.scrollTo(0, scrollGuardado); html.style.scrollBehavior = ''; }
  }
  function menuToggle(abrir) {
    if (!menu) return;
    var on = abrir === undefined ? menu.hidden : abrir;
    if (on === !menu.hidden) return;
    menu.hidden = !on; btnMenu.setAttribute('aria-expanded', on); btnMenu.setAttribute('aria-label', on ? 'Cerrar menú' : 'Abrir menú');
    bloquear(on);
  }
  if (btnMenu) btnMenu.addEventListener('click', function () { menuToggle(); });
  if (menu) menu.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    e.preventDefault(); menuToggle(false);
    var dest = $(a.getAttribute('href')); if (dest) setTimeout(function () { dest.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' }); }, 30);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && !menu.hidden) menuToggle(false); });
  window.addEventListener('resize', function () { if (esDesk() && menu && !menu.hidden) menuToggle(false); });

  /* ================= entradas al hacer scroll ================= */
  var ioRv = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); ioRv.unobserve(e.target); } });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' }) : null;
  function observar(els) { els.forEach(function (el) { if (ioRv) ioRv.observe(el); else el.classList.add('visto'); }); }
  $$('.momento').forEach(function (e, i) { e.style.setProperty('--d', i); });
  $$('.grano__txt .rv, .catas__txt .rv, .esquina__txt .rv').forEach(function (e, i, a) { e.style.setProperty('--d', i % 6); });
  observar($$('.rv, .mazo .g'));

  // la píldora del panel no tapa el crédito del pie
  var pie = $('.pie');
  if (pie && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { html.classList.toggle('en-pie', es[0].isIntersecting); }).observe(pie);

  // mapa: se carga cuando se acerca
  var mapa = $('.esquina__mapa iframe');
  if (mapa && 'IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { mapa.src = mapa.dataset.src; o.disconnect(); } }, { rootMargin: '700px' }).observe(mapa);
  else if (mapa) mapa.src = mapa.dataset.src;

  /* ================= arrastre con el mouse (fila de momentos) ================= */
  function arrastrable(el) {
    var activo = false, x0 = 0, s0 = 0, ultX = 0, ultT = 0, vel = 0, movio = false, raf = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth + 2) return;
      if (e.target.closest('button, a')) return;
      activo = true; movio = false; x0 = ultX = e.clientX; s0 = el.scrollLeft; ultT = performance.now(); vel = 0;
      cancelAnimationFrame(raf);
    });
    window.addEventListener('pointermove', function (e) {
      if (!activo) return;
      var dx = e.clientX - x0;
      if (!movio && Math.abs(dx) > 4) { movio = true; el.classList.add('is-drag'); }
      if (!movio) return;
      e.preventDefault();
      el.scrollLeft = s0 - dx;
      var now = performance.now(), dt = Math.max(1, now - ultT);
      vel = .8 * ((ultX - e.clientX) / dt) + .2 * vel; ultX = e.clientX; ultT = now;
    }, { passive: false });
    function soltar() {
      if (!activo) return; activo = false;
      if (!movio) return;
      var v = vel * 16;
      (function inercia() {
        if (Math.abs(v) < .5) { el.classList.remove('is-drag'); return; }
        el.scrollLeft += v; v *= .92; raf = requestAnimationFrame(inercia);
      })();
    }
    window.addEventListener('pointerup', soltar); window.addEventListener('pointercancel', soltar);
    el.addEventListener('click', function (e) { if (movio) { e.preventDefault(); e.stopPropagation(); movio = false; } }, true);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  $$('[data-arrastre]').forEach(arrastrable);

  // “Sumar” de los momentos: respuesta visible
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.mini[data-kit-add]'); if (!b || !K) return;
    var p = prods.find(function (x) { return x.id === b.dataset.kitAdd; });
    if (!p || !K.pedible(p)) return;
    b.classList.add('is-ok'); b.textContent = 'Sumado';
    setTimeout(function () { if (b.isConnected) { b.classList.remove('is-ok'); b.textContent = 'Sumar'; } }, 1400);
  });

  /* ================= carta (con el kit) ================= */
  // la taza por dentro: capas de abajo hacia arriba, en % de la taza
  var COL = { espresso: '#5B3A26', agua: '#D7E6E4', leche: '#EADCC7', espuma: '#FFFDF8', hielo: '#CFE2E6' };
  var NOM = { espresso: 'espresso', agua: 'agua', leche: 'leche emulsionada', espuma: 'espuma', hielo: 'leche y hielo' };
  var TAZAS = {
    espresso: [['espresso', 30]], doble: [['espresso', 48]], americano: [['espresso', 26], ['agua', 52]],
    'cafe-con-leche': [['espresso', 26], ['leche', 54]], capuccino: [['espresso', 24], ['leche', 34], ['espuma', 22]],
    macchiato: [['espresso', 30], ['espuma', 10]], 'flat-white': [['espresso', 40], ['leche', 40]]
  };
  function tazaSVG(id, grande) {
    var capas = TAZAS[id]; if (!capas) return '';
    // interior de la taza: de y=16 a y=55 (39 de alto), ancho 34
    var top = 55, out = '';
    capas.forEach(function (c) {
      var h = 39 * c[1] / 100; top -= h;
      out += '<rect class="capa" x="8" y="' + top.toFixed(1) + '" width="34" height="' + h.toFixed(1) + '" fill="' + COL[c[0]] + '" clip-path="url(#tz' + (grande ? 'G' : '') + id + ')"/>';
    });
    return '<svg class="taza" viewBox="0 0 54 64" aria-hidden="true"><defs><clipPath id="tz' + (grande ? 'G' : '') + id + '"><path d="M7.5 15.5h35v24.5a15.5 15.5 0 0 1-15.5 15.5h-4A15.5 15.5 0 0 1 7.5 40z"/></clipPath></defs>' + out +
      '<path class="taza__borde" d="M6 14h38v26a17 17 0 0 1-17 17h-4A17 17 0 0 1 6 40z"/><path class="taza__borde" d="M44 22h3a7 7 0 0 1 0 14h-3"/></svg>';
  }
  function capasHTML(id) {
    var c = TAZAS[id]; if (!c) return '';
    return c.slice().reverse().map(function (x) { return '<li><i style="background:' + COL[x[0]] + '"></i>' + NOM[x[0]] + '</li>'; }).join('');
  }
  var CORTAS = { otros: 1 };
  var INFO = {
    cafeteria: 'Café de especialidad que va rotando en la tolva.',
    frios: 'Para los días de calor.',
    otros: 'Té, chocolate y adicionales.',
    desayunos: 'Hasta el mediodía, o cuando tengas ganas.',
    salado: 'Masa madre, baguette y focaccia.',
    ensaladas: 'Frescas, para el mediodía.',
    dulces: 'Para la merienda o para llevar.',
    grano: 'Bolsas de 250 g de Puerto Blest. Elegí la molienda al sumarlo.'
  };
  var PORTADA = { cafeteria: 'flat-white', frios: 'ice-latte', otros: 'capuccino', desayunos: 'promo-huma', salado: 'baguette-crudo', ensaladas: 'ensalada-atun', dulces: 'rolls', grano: 'colombia' };
  var app = $('#carta-app'), tabsEl = $('.carta__tabs'), indiceEl = $('.carta__indice'), panel = $('#cartaPanel'), fotoEl = $('#cartaFoto'), fotoT = $('#cartaFotoT'), tazaG = $('#tazaGrande');
  var K = null, cats = [], prods = [], actual = null, fotoActual = '';
  var H_SVG = '<svg viewBox="0 0 600 760" aria-hidden="true"><use href="#h"/></svg>';

  function itemsDe(cid) { return prods.filter(function (p) { return p.categoria === cid; }); }
  function catsVisibles() { var vis = K ? K.visibles(cats) : cats; return vis.filter(function (c) { return itemsDe(c.id).length; }); }
  function foto(p) { return p.foto ? (K ? K.asset(p.foto) : p.foto) : ''; }
  function fotoGrande(src) { return src.replace(/-480\.webp$/, '-800.webp'); }

  function platoHTML(p, i) {
    var tags = p.etiquetas || [], f = foto(p), taza = TAZAS[p.id], acc;
    if (p.disponible === false) acc = '<span class="plato__off">Hoy no hay</span>';
    else if (!K || !K.pedible(p)) acc = '<span class="plato__off">Consultar</span>';
    else acc = '<div data-kit-qty="' + esc(p.id) + '"></div>';
    var izq = taza ? '<button type="button" class="plato__taza" data-taza="' + esc(p.id) + '" aria-label="Ver qué lleva el ' + esc(p.nombre) + '">' + tazaSVG(p.id) + '</button>'
      : f ? '<img class="plato__img" src="' + esc(f) + '" alt="" width="68" height="68" loading="lazy" decoding="async">'
      : '<span class="plato__ph" aria-hidden="true">' + H_SVG + '</span>';
    var pr = K && p.precio != null ? K.money(p.precio) : null;
    var tg = [];
    if (tags.indexOf('tolva') >= 0) tg.push('<span class="tag tag--tolva">En la tolva hoy</span>');
    if (tags.indexOf('nuevo') >= 0) tg.push('<span class="tag tag--nuevo">Nuevo</span>');
    if (tags.indexOf('veggie') >= 0) tg.push('<span class="tag tag--veggie">Veggie</span>');
    if (tags.indexOf('casa') >= 0) tg.push('<span class="tag tag--casa">De la casa</span>');
    return '<li class="plato' + (p.disponible === false ? ' is-off' : '') + '" style="--i:' + i + '" data-id="' + esc(p.id) + '"' + (f ? ' data-foto="' + esc(f) + '"' : '') + '>' + izq +
      '<div class="plato__body"><p class="plato__n">' + esc(p.nombre) + (f && !taza ? '<span class="dot" aria-hidden="true"></span>' : '') + '</p>' +
      (p.descripcion ? '<p class="plato__d">' + esc(p.descripcion) + '</p>' : '') +
      (taza ? '<ul class="capas">' + capasHTML(p.id) + '</ul>' : '') +
      '<p class="plato__p">' + (pr ? '<b>' + pr + '</b>' : 'Precio a confirmar') + '</p>' +
      (tg.length ? '<div class="plato__tags">' + tg.join('') + '</div>' : '') +
      '</div><div class="plato__acc">' + acc + '</div></li>';
  }

  function render(enfocar) {
    var vis = catsVisibles();
    if (!vis.length) { panel.innerHTML = '<p class="carta-vacia">No hay platos para mostrar.</p>'; tabsEl.innerHTML = indiceEl.innerHTML = ''; return; }
    if (!vis.some(function (c) { return c.id === actual; })) actual = vis[0].id;
    var idx = vis.findIndex(function (c) { return c.id === actual; });
    tabsEl.innerHTML = vis.map(function (c) {
      return '<button type="button" role="tab" class="tab' + (c.id === 'grano' ? ' tab--grano' : '') + (c.id === actual ? ' is-on' : '') + '" aria-selected="' + (c.id === actual) + '" aria-controls="cartaPanel" data-cat="' + esc(c.id) + '">' + esc(c.nombre) + '</button>';
    }).join('');
    indiceEl.innerHTML = vis.map(function (c) {
      return '<button type="button" class="' + (c.id === 'grano' ? 'ind--grano ' : '') + (c.id === actual ? 'is-on' : '') + '" aria-current="' + (c.id === actual) + '" data-cat="' + esc(c.id) + '"><span>' + esc(c.nombre) + '</span><small>' + itemsDe(c.id).length + '</small></button>';
    }).join('');
    var c = vis[idx], items = itemsDe(c.id);
    var sub = items.length + (items.length === 1 ? ' opción' : ' opciones') + ' · ' + (c.id === 'grano' ? 'para llevar a casa' : 'todo se puede pedir para llevar');
    var prev = vis[idx - 1], next = vis[idx + 1];
    panel.innerHTML =
      '<div class="cat-head"><h3>' + esc(c.nombre) + '</h3><p>' + esc(sub) + '</p></div>' +
      (INFO[c.id] ? '<p class="cat-head__info plato__d" style="margin:-6px 0 14px">' + esc(INFO[c.id]) + '</p>' : '') +
      '<ul class="platos' + (CORTAS[c.id] ? ' platos--cortos' : '') + '">' + items.map(platoHTML).join('') + '</ul>' +
      '<div class="carta__pie">' + (prev ? '<button type="button" data-cat="' + esc(prev.id) + '">← ' + esc(prev.nombre) + '</button>' : '<span></span>') +
      (next ? '<button type="button" data-cat="' + esc(next.id) + '">' + esc(next.nombre) + ' →</button>' : '') + '</div>';
    if (K && K.carrito) K.carrito.sync(panel);
    ponerFoto(null, c);
    app.removeAttribute('aria-busy');
    // las tazas se llenan apenas aparecen
    if (!REDUCE) requestAnimationFrame(function () { setTimeout(function () { $$('.plato .taza', panel).forEach(function (t, i) { setTimeout(function () { t.classList.add('is-llena'); }, i * 70); }); }, 250); });
    if (REDUCE) $$('.plato .taza', panel).forEach(function (t) { t.classList.add('is-llena'); });
    var on = tabsEl.querySelector('.is-on');
    if (on) tabsEl.scrollTo({ left: on.offsetLeft - tabsEl.clientWidth / 2 + on.offsetWidth / 2, behavior: enfocar ? 'smooth' : 'auto' });
  }
  function ponerFoto(p, c) {
    if (!fotoEl) return;
    tazaG.classList.remove('is-on');
    var pid = p ? p.id : PORTADA[c ? c.id : actual];
    var pp = prods.find(function (x) { return x.id === pid; });
    var src = pp && pp.foto ? fotoGrande(foto(pp)) : 'img/p/flat-white-800.webp';
    fotoT.textContent = p ? p.nombre : (c ? c.nombre : '');
    if (src === fotoActual) return;
    fotoActual = src;
    fotoEl.classList.add('is-cambia');
    var im = new Image();
    im.onload = function () { fotoEl.src = src; fotoEl.alt = p ? p.nombre : ''; fotoEl.classList.remove('is-cambia'); };
    im.src = src;
  }
  function ponerTaza(p) {
    tazaG.innerHTML = tazaSVG(p.id, true) + '<ul>' + capasHTML(p.id) + '</ul>';
    fotoT.textContent = p.nombre + ' · ' + (p.descripcion || '');
    tazaG.classList.add('is-on');
    var t = tazaG.querySelector('.taza'); requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('is-llena'); }); });
  }
  function irA(cid, desdePie) {
    actual = cid; render(true);
    if (desdePie || !esDesk()) {
      var y = (esDesk() ? app : tabsEl).getBoundingClientRect().top + window.scrollY - (esDesk() ? 110 : 64);
      if (window.scrollY > y + 4 || desdePie) window.scrollTo({ top: y, behavior: REDUCE ? 'auto' : 'smooth' });
    }
  }
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (b) { irA(b.dataset.cat, !!b.closest('.carta__pie')); return; }
    var tz = e.target.closest('[data-taza]');
    if (tz) {
      var li = tz.closest('.plato'), t = tz.querySelector('.taza'), ya = li.classList.contains('is-taza');
      $$('.plato.is-taza', panel).forEach(function (x) { x.classList.remove('is-taza'); });
      if (!ya) { li.classList.add('is-taza'); t.classList.remove('is-llena'); void t.getBoundingClientRect(); t.classList.add('is-llena'); }
      if (esDesk()) { var p = prods.find(function (x) { return x.id === tz.dataset.taza; }); if (p) ponerTaza(p); }
    }
  });
  tabsEl.addEventListener('keydown', function (e) {
    if (['ArrowRight', 'ArrowLeft'].indexOf(e.key) < 0) return;
    var ts = $$('.tab', tabsEl), i = ts.indexOf(document.activeElement); if (i < 0) return;
    var n = ts[(i + (e.key === 'ArrowRight' ? 1 : -1) + ts.length) % ts.length]; irA(n.dataset.cat); var nn = tabsEl.querySelector('[data-cat="' + n.dataset.cat + '"]'); if (nn) nn.focus();
  });
  var hoverRaf = 0, hoverEl = null;
  panel.addEventListener('pointerover', function (e) {
    if (!HOVER || !esDesk()) return;
    var li = e.target.closest('.plato'); if (!li || li === hoverEl) return;
    hoverEl = li; cancelAnimationFrame(hoverRaf);
    hoverRaf = requestAnimationFrame(function () {
      $$('.plato.is-hover', panel).forEach(function (x) { x.classList.remove('is-hover', 'is-taza'); });
      li.classList.add('is-hover');
      var p = prods.find(function (x) { return x.id === li.dataset.id; });
      if (p && TAZAS[p.id]) { li.classList.add('is-taza'); ponerTaza(p); }
      else if (p && p.foto) ponerFoto(p); else ponerFoto(null, cats.find(function (c) { return c.id === actual; }));
    });
  });
  panel.addEventListener('pointerleave', function () { hoverEl = null; $$('.plato.is-hover', panel).forEach(function (x) { x.classList.remove('is-hover', 'is-taza'); }); });

  /* ================= la tolva que rota ================= */
  var grano = $('#grano'), molienda = 'En grano', tolvaP = null, lleno = 0, moliendo = false;
  var bolsaNivel = $('#bolsaNivel'), manivela = $('#manivela'), molerBtn = $('#molerBtn'), giroBtn = $('#manivelaBtn');
  var ang = 0;
  function pintarTolva() {
    var gr = prods.filter(function (p) { return p.categoria === 'grano' && p.disponible !== false; });
    tolvaP = gr.find(function (p) { return (p.etiquetas || []).indexOf('tolva') >= 0; }) || gr[0] || null;
    if (!tolvaP) { grano.hidden = true; return; }
    grano.hidden = false;
    var partes = String(tolvaP.descripcion || '').split('·').map(function (s) { return s.trim(); }).filter(Boolean);
    $('[data-g-nombre]').textContent = tolvaP.nombre;
    $('[data-g-ficha]').innerHTML = partes.map(function (s) { return '<li' + (/,| y /.test(s) ? ' class="is-nota"' : '') + '>' + esc(s) + '</li>'; }).join('');
    var pr = tolvaP.precio != null && K ? K.money(tolvaP.precio) : null;
    $('[data-g-precio]').textContent = '250 g · ' + (pr || 'precio a confirmar');
    var otros = gr.filter(function (p) { return p !== tolvaP; });
    $('#granoAntes').hidden = !otros.length;
    $('[data-g-antes]').innerHTML = otros.map(function (p) {
      return '<li><span>' + esc(p.nombre) + '</span><button type="button" class="mini" data-otro="' + esc(p.id) + '" aria-label="Sumar ' + esc(p.nombre) + '">Sumar</button></li>';
    }).join('');
  }
  function setLleno(v) {
    lleno = Math.max(0, Math.min(1, v));
    bolsaNivel.style.setProperty('--lleno', (130 - 112 * lleno).toFixed(1) + 'px');
  }
  setLleno(0);
  function sumarBolsa(id, origen) {
    if (!K || !K.carrito) return;
    K.carrito.agregar(id, 1, { nota: molienda, origen: origen || $('.tolva') });
    grano.classList.add('is-sumado');
    molerBtn.textContent = '¡Sumado! Moler otro cuarto';
    setTimeout(function () { grano.classList.remove('is-sumado'); setLleno(0); molerBtn.textContent = 'Moler un cuarto y sumarlo'; }, 1600);
  }
  function girar(grados) {
    ang += grados; manivela.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
    if (!moliendo) { moliendo = true; grano.classList.add('is-moliendo'); }
    clearTimeout(girar.t); girar.t = setTimeout(function () { moliendo = false; grano.classList.remove('is-moliendo'); }, 250);
    setLleno(lleno + Math.abs(grados) / 720);
    if (lleno >= 1 && !girar.hecho) { girar.hecho = true; sumarBolsa(tolvaP.id); setTimeout(function () { girar.hecho = false; }, 1700); }
  }
  // botón: anima sola la vuelta
  molerBtn.addEventListener('click', function () {
    if (!tolvaP || girar.anim) return;
    if (REDUCE) { setLleno(1); sumarBolsa(tolvaP.id, molerBtn); return; }
    girar.anim = true; var t0 = performance.now(), dur = 1100, prev = 0;
    (function paso(t) {
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, g = e * 720;
      girar(g - prev); prev = g;
      if (k < 1) requestAnimationFrame(paso); else girar.anim = false;
    })(t0);
  });
  // arrastrar la manivela (dedo o mouse): el ángulo alrededor del eje
  (function () {
    var svg = $('.tolva'), activo = false, ultimo = 0;
    function angulo(e) {
      var r = svg.getBoundingClientRect(), cx = r.left + r.width * (196 / 320), cy = r.top + r.height * (212 / 460);
      return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    }
    function down(e) { if (!tolvaP) return; activo = true; ultimo = angulo(e); giroBtn.classList.add('is-drag'); try { e.target.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); }
    function move(e) {
      if (!activo) return;
      var a = angulo(e), d = a - ultimo; if (d > 180) d -= 360; if (d < -180) d += 360; ultimo = a;
      girar(d);
    }
    function up() { activo = false; giroBtn.classList.remove('is-drag'); }
    [manivela, giroBtn].forEach(function (el) { el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); });
    // con el botón y el teclado: Enter/espacio = un cuarto de vuelta
    giroBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); girar(90); } });
    giroBtn.addEventListener('click', function (e) { if (e.detail === 0) return; if (!activo && Math.abs(lleno) < .01) girar(120); });
  })();
  $('#molienda').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mol]'); if (!b) return;
    molienda = b.dataset.mol;
    $$('#molienda .chipb').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', on); });
  });
  $('#granoAntes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-otro]'); if (!b || !K) return;
    K.carrito.agregar(b.dataset.otro, 1, { nota: molienda, origen: b });
    b.classList.add('is-ok'); b.textContent = 'Sumado';
    setTimeout(function () { if (b.isConnected) { b.classList.remove('is-ok'); b.textContent = 'Sumar'; } }, 1400);
  });

  /* ================= catas con cupo: las copas ================= */
  var copasEl = $('[data-copas]'), cataBtn = $('#cataBtn'), cata = null, copasPrev = -1;
  var COPA = '<svg class="copa" viewBox="0 0 20 34"><path class="copa__vino" d="M4.2 6h11.6c-.5 5.6-2.9 8-5.8 8S4.7 11.6 4.2 6z"/><path class="copa__vidrio" d="M3 2h14c0 9-3 13-7 13S3 11 3 2z M10 15v12 M5.5 31h9"/></svg>';
  function fmtFecha(f) {
    var p = f.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
    return NOMBRE_DIA[DIAS[d]].charAt(0).toUpperCase() + NOMBRE_DIA[DIAS[d]].slice(1) + ' ' + p[2] + ' de ' + MESES[p[1] - 1];
  }
  function pintarCata() {
    if (!K || !K.reservas) return;
    var serv = ((K.config.reservas || {}).servicios || []).find(function (s) { return s.id === 'cata'; });
    var hoy = ahora().fecha;
    var fechas = serv && serv.fechas ? serv.fechas.filter(function (f) { return f >= hoy; }).sort() : [];
    if (!fechas.length) {
      $('[data-c-fecha]').textContent = 'Próxima cata: muy pronto';
      $('[data-c-quedan]').textContent = 'Fecha a confirmar';
      copasEl.innerHTML = ''; cataBtn.disabled = true; return;
    }
    var fecha = fechas[0], hora = serv.tandas[0].turnos[0];
    K.reservas.turnos(fecha, 1).then(function (ts) {
      var t = ts.find(function (x) { return x.hora === hora; }) || ts[0]; if (!t) return;
      cata = { fecha: fecha, hora: t.hora };
      var cap = t.capacidad, ocup = cap - t.libres;
      $('[data-c-fecha]').textContent = 'Próxima cata · ' + fmtFecha(fecha);
      var q = $('[data-c-quedan]');
      q.textContent = t.libres ? 'Quedan ' + t.libres + (t.libres === 1 ? ' lugar' : ' lugares') : 'Completo';
      q.classList.toggle('is-lleno', !t.libres);
      cataBtn.disabled = !t.libres || t.pasado;
      cataBtn.textContent = t.libres ? 'Guardame un lugar' : 'Avisame la próxima';
      if (!t.libres) cataBtn.disabled = false;
      if (copasEl.children.length !== cap) copasEl.innerHTML = new Array(cap + 1).join(COPA);
      var copas = $$('.copa', copasEl);
      copas.forEach(function (c, i) {
        var llena = i < ocup, nueva = copasPrev >= 0 && i >= copasPrev && i < ocup;
        c.classList.toggle('is-nueva', nueva);
        if (nueva) setTimeout(function () { c.classList.add('is-llena'); }, 60 + (i - copasPrev) * 120);
        else c.classList.toggle('is-llena', llena);
      });
      copasPrev = ocup;
    });
  }
  cataBtn.addEventListener('click', function () {
    if (!K) return;
    if (cataBtn.textContent.indexOf('Avisame') === 0) { window.open('https://wa.me/' + K.config.whatsapp + '?text=' + encodeURIComponent('Hola Huma! Avísenme cuando haya una nueva cata de vinos, porfa.'), '_blank', 'noopener'); return; }
    if (cata) K.reservas.abrir({ fecha: cata.fecha, hora: cata.hora, personas: 2 });
  });
  document.addEventListener('kit:reserva', function () { setTimeout(pintarCata, 50); });

  /* ================= mazo de fotos (celu) ================= */
  var mazo = $('#mazo'), cartas = $$('.g', mazo), orden = cartas.slice();
  function acomodar() {
    if (esDesk()) { cartas.forEach(function (c) { c.style.transform = ''; c.style.zIndex = ''; c.style.opacity = ''; }); return; }
    orden.forEach(function (c, i) {
      var rot = [0, -4, 3.5, -2, 2.5][i] || 0, off = Math.min(i, 4) * 8;
      c.style.zIndex = String(orden.length - i);
      c.style.opacity = i > 4 ? '0' : '1';
      c.style.transform = 'translate3d(0,' + off + 'px,0) rotate(' + rot + 'deg) scale(' + (1 - Math.min(i, 4) * .03) + ')';
    });
  }
  function tirar(dir) {
    var c = orden[0]; if (!c) return;
    c.classList.add('is-vuela');
    c.style.transform = 'translate3d(' + (dir * 120) + '%, -6%, 0) rotate(' + (dir * 22) + 'deg)';
    c.style.opacity = '0';
    setTimeout(function () { c.classList.remove('is-vuela'); orden.push(orden.shift()); acomodar(); }, 380);
  }
  (function () {
    var x0 = 0, y0 = 0, dx = 0, activo = false, c = null;
    mazo.addEventListener('pointerdown', function (e) { if (esDesk()) return; activo = true; c = orden[0]; x0 = e.clientX; y0 = e.clientY; dx = 0; c.style.transition = 'none'; });
    mazo.addEventListener('pointermove', function (e) {
      if (!activo || !c) return;
      dx = e.clientX - x0; var dy = e.clientY - y0;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 10) return;
      c.style.transform = 'translate3d(' + dx + 'px,0,0) rotate(' + (dx / 18) + 'deg)';
    });
    function fin() {
      if (!activo || !c) return; activo = false; c.style.transition = '';
      if (Math.abs(dx) > 70) tirar(dx > 0 ? 1 : -1); else if (Math.abs(dx) < 6) tirar(1); else acomodar();
      c = null;
    }
    mazo.addEventListener('pointerup', fin); mazo.addEventListener('pointercancel', fin); mazo.addEventListener('pointerleave', fin);
    $('#mazoSig').addEventListener('click', function () { tirar(1); });
  })();
  acomodar();
  window.addEventListener('resize', function () { acomodar(); });

  /* ================= contador del carrito en la barra ================= */
  function pintarContador() {
    if (!K || !K.carrito) return;
    var n = K.carrito.lineas.reduce(function (s, l) { return s + (l.cant || 0); }, 0), b = $('[data-n]');
    b.hidden = !n; if (String(n) !== b.textContent) { b.textContent = n; b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
  }
  document.addEventListener('kit:carrito', pintarContador);
  $$('[data-ir-pedir]').forEach(function (a) { a.addEventListener('click', function () { if (K && K.carrito && K.carrito.lineas.length) { /* ya tiene algo: que lo vea */ } }); });

  /* ================= kit ================= */
  function cargar() {
    return Promise.all([K.store.getCategorias(), K.store.getProductos()]).then(function (r) {
      cats = r[0].slice().sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); }); prods = r[1];
      render(false); pintarTolva(); pintarCata();
    }).catch(function (err) { console.error('[demo] carta', err); panel.innerHTML = '<p class="carta-vacia">No pudimos cargar la carta. Probá recargar la página.</p>'; });
  }
  function conKit(kit) {
    if (K) return; K = kit;
    cargar(); pintarContador();
    if (kit.carrito && kit.carrito.listo) kit.carrito.listo.then(pintarContador);
    kit.store.onChange(cargar);
  }
  if (window.__kit) conKit(window.__kit);
  document.addEventListener('hu:kit', function (e) { conKit(e.detail); });
  document.addEventListener('hu:kit-error', function () { panel.innerHTML = '<p class="carta-vacia">No pudimos cargar la carta. Probá recargar la página.</p>'; });
})();
