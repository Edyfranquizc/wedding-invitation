/* ==========================================================================
   GALERÍA — lightbox accesible (<dialog>), cámara con flash y revelado,
   tira de película arrastrable y con auto-scroll infinito.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const dialog = document.getElementById('lightbox');
    if (!dialog) return;
    const img = document.getElementById('lightbox-img');
    const prev = document.getElementById('lightbox-prev');
    const next = document.getElementById('lightbox-next');
    let list = [];
    let idx = 0;

    const show = () => {
      const item = list[idx];
      const thumb = item.querySelector('img');
      img.src = item.dataset.lightbox || (thumb && thumb.src) || '';
      img.alt = (thumb && thumb.alt) || '';
      const many = list.length > 1;
      prev.hidden = !many;
      next.hidden = !many;
    };
    const open = (item) => {
      const group = item.closest('[data-gallery]');
      // NUEVO: ignora los clones del auto-scroll para no repetir fotos en el lightbox
      list = [...(group || document).querySelectorAll('[data-lightbox]')]
        .filter((el) => !el.classList.contains('is-clone'))
        .filter((el) => !el.querySelector('.is-missing') && !el.classList.contains('is-missing'));
      // NUEVO: busca por ruta de foto (si tocaron un clon, abre la foto original)
      idx = Math.max(0, list.findIndex((el) => el.dataset.lightbox === item.dataset.lightbox));
      if (!list.length) return;
      show();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    };
    const close = () => (dialog.close ? dialog.close() : dialog.removeAttribute('open'));
    const step = (dir) => { idx = (idx + dir + list.length) % list.length; show(); };

    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-lightbox]');
      if (!item) return;
      if (item.dataset.dragged === '1') { item.dataset.dragged = ''; return; }
      if (item.querySelector('.is-missing') || item.classList.contains('is-missing')) return;
      open(item);
    });
    document.getElementById('lightbox-close').addEventListener('click', close);
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Cámara ---------- */
  function initCamera() {
    const cam = document.getElementById('camera');
    const photo = document.getElementById('camera-photo');
    const counter = document.getElementById('camera-counter');
    if (!cam || !photo) return;
    const photos = ((window.WEDDING_CONFIG || {}).camera || {}).photos || [];
    if (!photos.length) { counter.textContent = ''; return; }

    let i = 0;
    const set = (n) => {
      photo.src = photos[n];
      counter.textContent = `${n + 1} / ${photos.length}`;
      const pre = new Image();               // precarga la siguiente
      pre.src = photos[(n + 1) % photos.length];
    };
    const restart = (cls) => { cam.classList.remove(cls); void cam.offsetWidth; cam.classList.add(cls); };

    set(0);
    cam.addEventListener('click', () => {
      restart('is-flash');
      setTimeout(() => {
        i = (i + 1) % photos.length;
        set(i);
        restart('is-developing');
      }, 120);
    });
    cam.addEventListener('animationend', (e) => {
      if (e.animationName === 'flash') cam.classList.remove('is-flash');
      if (e.animationName === 'develop') cam.classList.remove('is-developing');
    });
  }

  /* ---------- Tira de película: arrastre + auto-scroll infinito ---------- */
  function initFilmstrip() {
    const track = document.querySelector('.filmstrip__track');
    if (!track) return;

    /* --- Estado compartido (arrastre y auto-scroll) --- */
    let startX = 0, startScroll = 0, down = false, moved = 0, target = null;
    let hovering = false;     // mouse encima
    let touching = false;     // dedo encima
    let visible = false;      // la tira está en pantalla
    let holdUntil = 0;        // pausa breve tras interactuar (ms)
    const hold = (ms) => { holdUntil = performance.now() + ms; };

    /* --- Arrastrar con el mouse --- */
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return; // en táctil se usa el scroll nativo
      down = true; moved = 0; startX = e.clientX; startScroll = track.scrollLeft;
      target = e.target.closest('[data-lightbox]');
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) track.classList.add('is-dragging');
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
      hold(1500);                                              // NUEVO: deja respirar tras arrastrar
      if (moved > 4 && target) target.dataset.dragged = '1'; // no abrir lightbox tras arrastrar
    });

    /* --- Auto-scroll --- */
    // Respeta "reducir movimiento": en ese caso la tira queda manual
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const originals = [...track.children];
    if (originals.length < 2) return;

    const SPEED = 40;   // píxeles por segundo (sube = más rápido)
    let loopW = 0;      // ancho de un "ciclo" completo de fotos

    // Duplica las fotos para que el bucle sea infinito y sin saltos
    const addSet = () => originals.forEach((el) => {
      const c = el.cloneNode(true);
      c.classList.add('is-clone');
      c.setAttribute('aria-hidden', 'true');
      c.tabIndex = -1;                       // los clones no reciben foco del teclado
      track.appendChild(c);
    });
    const measure = () => {
      loopW = track.children[originals.length].offsetLeft - track.children[0].offsetLeft;
    };

    addSet();
    measure();
    // En pantallas anchas: agrega ciclos hasta que la tira nunca quede vacía al final
    for (let n = 0; n < 4 && track.scrollWidth < loopW + track.clientWidth; n++) addSet();

    track.classList.add('is-auto');
    window.addEventListener('resize', measure);

    /* --- Pausas: mouse encima, dedo, teclado, o fuera de pantalla --- */
    track.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
    track.addEventListener('pointerleave', () => { hovering = false; });
    track.addEventListener('focusin', () => { hovering = true; });
    track.addEventListener('focusout', () => { hovering = false; });
    track.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    track.addEventListener('touchend', () => { touching = false; hold(2500); }, { passive: true });
    track.addEventListener('touchcancel', () => { touching = false; hold(2500); }, { passive: true });
    track.addEventListener('wheel', () => hold(1500), { passive: true });

    // Solo se mueve cuando se ve (ahorra batería y CPU)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(track);
    } else { visible = true; }

    /* --- Motor: se ejecuta en cada frame --- */
    let pos = track.scrollLeft, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - last, 50) / 1000; // limita saltos si la pestaña estuvo oculta
      last = now;
      const paused = hovering || touching || down || !visible || now < holdUntil;

      if (paused) {
        pos = track.scrollLeft;            // sigue la posición manual del usuario
      } else {
        pos += SPEED * dt;
        if (pos >= loopW) pos -= loopW;    // al terminar un ciclo vuelve al inicio sin que se note
        track.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  window.WeddingGallery = {
    init() { initLightbox(); initCamera(); initFilmstrip(); },
  };
})();
