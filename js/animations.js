/* ==========================================================================
   ANIMACIONES — GSAP + ScrollTrigger (versión ligera para celular).
   Solo anima transform/opacity (rápido en GPU). Sin blur ni filtros.
   ========================================================================== */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lite = window.matchMedia('(max-width: 767px)').matches;   // celular
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const motion = () => hasGsap() && !reduced;

  const WeddingAnimations = {
    reduced,
    ambient: [],

    prepare() {
      if (!motion()) {
        document.documentElement.classList.add('no-motion');
        return;
      }
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });   // evita recálculos por la barra del navegador
      }

      // Hero oculto hasta abrir
      gsap.set('[data-hero]', { autoAlpha: 0, y: 14 });
      if (lite) gsap.set('[data-hero-photo]', { autoAlpha: 0, y: 16 });
      else gsap.set('[data-hero-photo]', { clipPath: 'inset(0% 0% 100% 0%)' });

      // Entrada del sobre (fromTo: destino explícito = nunca queda invisible)
      gsap.fromTo('.intro__inner > *', { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: lite ? .6 : 1.1, ease: 'power3.out', stagger: lite ? .06 : .12, delay: .05 });
      gsap.fromTo('.intro__flower', { autoAlpha: 0 },
        { autoAlpha: 1, duration: lite ? .8 : 1.6, ease: 'power2.out' });

      // Movimiento ambiental: solo en pantallas grandes (en celular gasta batería)
      if (!lite) {
        this.ambient = [
          gsap.to('.cupid--left', { y: -14, rotation: 2.5, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
          gsap.to('.cupid--right', { y: 12, rotation: -2, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: .8 }),
          gsap.to('.intro__flower--tl', { rotation: 1.5, y: 5, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
          gsap.to('.intro__flower--br', { rotation: 181.5, y: -5, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        ];
      }
    },

    stopIntro() {
      this.ambient.forEach((t) => t.kill());
      this.ambient = [];
    },

    sparkle(container) {
      const n = lite ? 7 : 14;   // menos partículas en celular
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        container.appendChild(s);
        const angle = (Math.PI * 2 * i) / n + Math.random() * .4;
        const dist = 60 + Math.random() * 90;
        gsap.fromTo(s, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, {
          x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: .2, autoAlpha: 0,
          duration: 1.2 + Math.random() * .6, ease: 'power2.out', onComplete: () => s.remove(),
        });
      }
    },

    openEnvelope({ envelope, button, burst }, done) {
      const HOLD = reduced ? 300 : (lite ? 900 : 1800);   // pausa con las fotos afuera
      const photos = envelope.querySelectorAll('.polaroid');
      const last = photos[photos.length - 1];
      let finished = false;
      const finish = () => { if (finished) return; finished = true; setTimeout(done, HOLD); };

      const intro = envelope.closest('.intro');
      if (intro) intro.classList.add('is-opening');

      const open = () => {
        envelope.classList.add('is-open');
        if (last) last.addEventListener('transitionend', (e) => { if (e.propertyName === 'transform') finish(); });
        setTimeout(finish, 9000);
      };

      if (!motion()) { open(); return; }

      gsap.timeline()
        .to(button, { autoAlpha: 0, y: 8, duration: .4, ease: 'power2.in' })
        .to(envelope, {
          keyframes: [
            { rotation: -2, duration: .14 }, { rotation: 2, duration: .16 },
            { rotation: -1, duration: .14 }, { rotation: 0, duration: .14 },
          ],
          ease: 'sine.inOut',
        }, '+=.1')
        .add(() => this.sparkle(envelope))
        .fromTo(burst, { scale: .2, autoAlpha: .95 }, { scale: 3, autoAlpha: 0, duration: .9, ease: 'power2.out' }, '<')
        .add(open, '<.15');
    },

    /** Salida del sobre: solo opacidad y escala (sin blur). */
    exitIntro(intro, done) {
      if (!motion()) {
        intro.style.transition = 'opacity .4s';
        intro.style.opacity = 0;
        setTimeout(done, reduced ? 50 : 500);
        return;
      }
      gsap.to(intro, { autoAlpha: 0, duration: lite ? .5 : .9, ease: 'power1.inOut', onComplete: done });
    },

    /** Revelado de la carta: rápido y solo con transform/opacity. */
    revealHero() {
      if (!motion()) return;
      const photoImg = document.querySelector('[data-hero-photo] img');

      const run = () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo('.hero__letter', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: lite ? .6 : 1 })
          .to('.hero__kicker', { autoAlpha: 1, y: 0, duration: .5 }, '-=.4');

        if (lite) {
          tl.to('[data-hero-photo]', { autoAlpha: 1, y: 0, duration: .6 }, '-=.3');
        } else {
          tl.to('[data-hero-photo]', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' }, '-=.4')
            .fromTo(photoImg, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'power2.out' }, '<');
        }

        tl.to('.hero__names [data-hero]', { autoAlpha: 1, y: 0, duration: lite ? .5 : .9, stagger: lite ? .08 : .16 }, lite ? '-=.3' : '-=1')
          .to('.hero__letter .flourish, .hero__date', { autoAlpha: 1, y: 0, duration: .5, stagger: .08 }, '-=.3')
          .to('.scroll-cue', { autoAlpha: 1, y: 0, duration: .5 }, '-=.2')
          .fromTo('.hero__flower', { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: lite ? .8 : 1.4, ease: 'power2.out' }, 0.2);
      };

      // Espera a que la foto esté decodificada (máx. 1,2 s) para que no aparezca a tirones
      const ready = photoImg && photoImg.decode ? photoImg.decode().catch(() => {}) : Promise.resolve();
      Promise.race([ready, new Promise((r) => setTimeout(r, 1200))]).then(run);
    },

    initScroll() {
      if (!motion() || !window.ScrollTrigger) return;
      ScrollTrigger.refresh();

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0, y: 24, duration: lite ? .7 : 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      // Álbum: en celular solo aparece (sin máscara ni zoom); en desktop, el efecto completo
      gsap.utils.toArray('.album__item').forEach((item, i) => {
        const media = item.querySelector('.album__media');
        const img = item.querySelector('img');
        const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%', once: true } })
          .from(item, { autoAlpha: 0, y: 30, duration: lite ? .7 : .9, ease: 'power2.out', delay: (i % 2) * .1 });
        if (!lite) {
          tl.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' }, '<')
            .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'power2.out' }, '<');
        }
      });

      // Parallax solo en pantallas grandes
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

      gsap.utils.toArray('.side-flower, .closing__flower, .album__cupid').forEach((f) => {
        gsap.from(f, { autoAlpha: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: f.parentElement, start: 'top 80%', once: true } });
      });
      if (!lite) gsap.to('.album__cupid', { y: -10, rotation: 3, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // Cámara
      const cam = document.getElementById('camera');
      if (cam) {
        ScrollTrigger.create({
          trigger: cam, start: 'top 75%', once: true,
          onEnter: () => { cam.classList.add('is-flash'); setTimeout(() => cam.classList.add('is-developing'), 120); },
        });
      }

      // Traje y vestido (trazo a trazo, más rápido en celular)
      gsap.utils.toArray('.attire__item').forEach((fig, i) => {
        const strokes = fig.querySelectorAll('.attire__svg path, .attire__svg circle');
        strokes.forEach((s) => s.setAttribute('pathLength', '1'));
        gsap.fromTo(strokes, { strokeDasharray: 1, strokeDashoffset: 1 }, {
          strokeDashoffset: 0, duration: lite ? 1.2 : 2, ease: 'power2.inOut', stagger: lite ? .03 : .06, delay: i * .2,
          clearProps: 'strokeDasharray,strokeDashoffset',
          scrollTrigger: { trigger: fig, start: 'top 88%', once: true },
        });
      });

      // Foto de cierre
      const closing = document.querySelector('.closing__photo img');
      if (closing) {
        if (lite) {
          gsap.from(closing, { autoAlpha: 0, duration: .8, scrollTrigger: { trigger: closing, start: 'top 85%', once: true } });
        } else {
          gsap.fromTo(closing, { clipPath: 'inset(100% 0% 0% 0%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut',
            scrollTrigger: { trigger: closing, start: 'top 80%', once: true },
          });
        }
      }

      // Recalcula cuando cargan las fotos lazy
      let t;
      const refreshSoon = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); };
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        if (!img.complete) img.addEventListener('load', refreshSoon, { once: true });
      });
      refreshSoon();
      setTimeout(() => ScrollTrigger.refresh(), 1500);
    },
  };

  window.WeddingAnimations = WeddingAnimations;
})();

