/* ==========================================================================
   ANIMACIONES — GSAP + ScrollTrigger.
   Si GSAP no carga o el usuario pide "reducir movimiento", todo queda
   visible y funcional sin animación.
   ========================================================================== */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const motion = () => hasGsap() && !reduced;

  const WeddingAnimations = {
    reduced,

    ambient: [],   // NUEVO: guarda las animaciones infinitas del sobre para poder detenerlas

    /** Estados iniciales + animaciones ambientales del sobre. */
    prepare() {
      if (!motion()) {
        document.documentElement.classList.add('no-motion');
        return;
      }
      if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

      // Hero oculto hasta abrir
      gsap.set('[data-hero]', { autoAlpha: 0, y: 18 });
      gsap.set('[data-hero-photo]', { clipPath: 'inset(0% 0% 100% 0%)' });

      // Entrada del sobre
      gsap.from('.intro__inner > *', { autoAlpha: 0, y: 22, duration: 1.1, ease: 'power3.out', stagger: .12, delay: .15 });
      gsap.from('.intro__flower', { autoAlpha: 0, scale: .9, duration: 1.6, ease: 'power2.out', stagger: .2 });

      // Movimiento ambiental suave (NUEVO: se guarda en this.ambient para detenerlo al abrir)
      this.ambient = [
        gsap.to('.cupid--left', { y: -14, rotation: 2.5, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        gsap.to('.cupid--right', { y: 12, rotation: -2, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: .8 }),
        gsap.to('.intro__flower--tl', { rotation: 1.5, y: 5, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        gsap.to('.intro__flower--br', { rotation: 181.5, y: -5, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      ];
    },

    /** NUEVO: detiene los movimientos infinitos del sobre (ya no se ven y gastaban CPU). */
    stopIntro() {
      this.ambient.forEach((t) => t.kill());
      this.ambient = [];
    },

    sparkle(container) {
      for (let i = 0; i < 14; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        container.appendChild(s);
        const angle = (Math.PI * 2 * i) / 14 + Math.random() * .4;
        const dist = 60 + Math.random() * 90;
        gsap.fromTo(s, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, {
          x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: .2, autoAlpha: 0,
          duration: 1.4 + Math.random() * .8, ease: 'power2.out', onComplete: () => s.remove(),
        });
      }
    },

    /** Apertura: vibra, estalla el sello y se abre.
        Las fotos salen por CSS (clase .is-open), así funcionan siempre,
        aunque GSAP no cargue. La velocidad se controla con --speed en el CSS. */
    openEnvelope({ envelope, button, burst }, done) {
      const HOLD = reduced ? 300 : 1800;   // pausa con las fotos afuera antes de pasar a la carta
      const photos = envelope.querySelectorAll('.polaroid');
      const last = photos[photos.length - 1];
      let finished = false;
      const finish = () => { if (finished) return; finished = true; setTimeout(done, HOLD); };

      const intro = envelope.closest('.intro');
      if (intro) intro.classList.add('is-opening');

      const open = () => {
        envelope.classList.add('is-open');
        // Avanza cuando la última foto terminó de salir (con respaldo por si acaso)
        if (last) last.addEventListener('transitionend', (e) => { if (e.propertyName === 'transform') finish(); });
        setTimeout(finish, 9000);
      };

      if (!motion()) { open(); return; }

      gsap.timeline()
        .to(button, { autoAlpha: 0, y: 8, duration: .6, ease: 'power2.in' })
        .to(envelope, {
          keyframes: [
            { rotation: -2, duration: .16 }, { rotation: 2, duration: .2 },
            { rotation: -1.2, duration: .18 }, { rotation: .6, duration: .16 }, { rotation: 0, duration: .2 },
          ],
          ease: 'sine.inOut',
        }, '+=.2')
        .add(() => this.sparkle(envelope))
        .fromTo(burst, { scale: .2, autoAlpha: .95 }, { scale: 3, autoAlpha: 0, duration: 1.0, ease: 'power2.out' }, '<')
        .add(open, '<.2');
    },

    /** Transición cinematográfica del sobre a la carta. */
    exitIntro(intro, done) {
      if (!motion()) {
        intro.style.transition = 'opacity .5s';
        intro.style.opacity = 0;
        setTimeout(done, reduced ? 50 : 900);
        return;
      }
      gsap.timeline({ onComplete: done })
        .to(intro.querySelector('.intro__inner'), { scale: 1.1, autoAlpha: 0, filter: 'blur(6px)', duration: 1.0, ease: 'power2.inOut' })
        .to(intro, { autoAlpha: 0, duration: 1, ease: 'power1.out' }, '-=.6');
    },

    /** Revelado de la carta: la foto aparece como si se sacara del sobre. */
    revealHero() {
      if (!motion()) return;
      const photoImg = document.querySelector('[data-hero-photo] img');
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.hero__letter', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 })
        .to('.hero__kicker', { autoAlpha: 1, y: 0, duration: .8 }, '-=.6')
        .to('[data-hero-photo]', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut' }, '-=.4')
        .fromTo(photoImg, { scale: 1.25, filter: 'sepia(.8) brightness(1.4) blur(3px)' },
          { scale: 1, filter: 'sepia(0) brightness(1) blur(0px)', duration: 2.2, ease: 'power2.out' }, '<')
        .to('.hero__names [data-hero]', { autoAlpha: 1, y: 0, duration: 1, stagger: .18 }, '-=1.4')
        .to('.hero__letter .flourish, .hero__date', { autoAlpha: 1, y: 0, duration: .8, stagger: .12 }, '-=.6')
        .to('.scroll-cue', { autoAlpha: 1, y: 0, duration: .8 }, '-=.3')
        .from('.hero__flower', { autoAlpha: 0, x: 40, rotation: 8, duration: 1.6, ease: 'power2.out' }, 0.4);
    },

    /** Animaciones por scroll (se crean al desbloquear la página). */
    initScroll() {
      if (!motion() || !window.ScrollTrigger) return;
      ScrollTrigger.refresh();

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0, y: 30, duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      // Álbum: revelado con máscara + leve zoom
      gsap.utils.toArray('.album__item').forEach((item, i) => {
        const media = item.querySelector('.album__media');
        const img = item.querySelector('img');
        gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 85%', once: true } })
          .from(item, { autoAlpha: 0, y: 40, duration: .9, ease: 'power2.out', delay: (i % 2) * .12 })
          .fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' }, '<')
          .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'power2.out' }, '<');
      });

      // Parallax muy suave solo en pantallas grandes
      const mm = gsap.matchMedia();
      mm.add('(min-width: 700px)', () => {
        gsap.utils.toArray('.album__item[data-speed]').forEach((item) => {
          gsap.to(item, {
            y: () => parseFloat(item.dataset.speed) * -60, ease: 'none',
            scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
        });
        gsap.utils.toArray('.side-flower, .closing__flower').forEach((f, i) => {
          gsap.to(f, {
            y: i % 2 ? 40 : -40, rotation: i % 2 ? -4 : 4, ease: 'none',
            scrollTrigger: { trigger: f.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
          });
        });
      });

      // Flores que florecen al llegar a su sección
      gsap.utils.toArray('.side-flower, .closing__flower, .album__cupid').forEach((f) => {
        gsap.from(f, { autoAlpha: 0, scale: .85, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: f.parentElement, start: 'top 75%', once: true } });
      });
      gsap.to('.album__cupid', { y: -10, rotation: 3, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // Cámara: revelado fotográfico al aparecer
      const cam = document.getElementById('camera');
      if (cam) {
        ScrollTrigger.create({
          trigger: cam, start: 'top 75%', once: true,
          onEnter: () => { cam.classList.add('is-flash'); setTimeout(() => cam.classList.add('is-developing'), 120); },
        });
      }

      // Traje y vestido: se dibujan trazo a trazo
      gsap.utils.toArray('.attire__item').forEach((fig, i) => {
        const strokes = fig.querySelectorAll('.attire__svg path, .attire__svg circle');
        strokes.forEach((s) => s.setAttribute('pathLength', '1'));
        gsap.fromTo(strokes, { strokeDasharray: 1, strokeDashoffset: 1 }, {
          strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', stagger: .06, delay: i * .25,
          clearProps: 'strokeDasharray,strokeDashoffset',
          scrollTrigger: { trigger: fig, start: 'top 85%', once: true },
        });
      });

      // Foto de cierre: se abre como una ventana en arco
      const closing = document.querySelector('.closing__photo img');
      if (closing) {
        gsap.fromTo(closing, { clipPath: 'inset(100% 0% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut',
          scrollTrigger: { trigger: closing, start: 'top 80%', once: true },
        });
      }

      // NUEVO: recalcula posiciones cuando cargan las fotos "lazy" (cambian la altura de la página)
      let t;
      const refreshSoon = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); };
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        if (!img.complete) img.addEventListener('load', refreshSoon, { once: true });
      });
      refreshSoon();                                          // una vez ahora
      setTimeout(() => ScrollTrigger.refresh(), 1500);        // y una de respaldo
    },
  };

  window.WeddingAnimations = WeddingAnimations;
})();