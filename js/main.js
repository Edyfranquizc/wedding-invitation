/* ==========================================================================
   MAIN — arranque, apertura del sobre, placeholders de imágenes,
   enlaces de mapas, botón "Copiar datos" y reproductor flotante (disco).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Scroll: que el navegador no "recuerde" dónde te quedaste ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const CFG = window.WEDDING_CONFIG || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* ---------- Imágenes faltantes: placeholder elegante en vez de ícono roto ---------- */
  function imageFallbacks() {
    document.querySelectorAll('img').forEach((img) => {
      const box = img.closest('.envelope') || img.parentElement;
      const fail = () => {
        if (!img.getAttribute('src')) return;
        if (img.classList.contains('deco')) { img.style.display = 'none'; return; }
        if (img.classList.contains('camera__body')) { img.closest('.camera').classList.add('is-missing'); return; }
        box.classList.add('is-missing');
        if (!box.dataset.placeholder) {
          box.dataset.placeholder = `Foto pendiente · ${img.getAttribute('src').split('/').pop()}`;
        }
      };
      img.addEventListener('error', fail);
      img.addEventListener('load', () => {
        if (!img.closest('.envelope')) box.classList.remove('is-missing');
      });
      if (img.complete && img.getAttribute('src') && img.naturalWidth === 0) fail();
    });
  }

  /* ---------- Mapas ---------- */
  function initMaps() {
    const maps = CFG.maps || {};
    const set = (id, url) => { const a = document.getElementById(id); if (a && url) a.href = url; };
    set('map-ceremony', maps.ceremony);
    set('map-party', maps.party);
  }

  /* ---------- Regalos ---------- */
  function initGifts() {
    const dl = $('#gift-data');
    const btn = $('#copy-btn');
    const status = $('#copy-status');
    if (!dl || !btn) return;
    const lines = Array.isArray(CFG.gifts) ? CFG.gifts : [];

    dl.innerHTML = '';
    lines.forEach(({ label, value }) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value || 'Por confirmar';
      if (!value) dd.classList.add('is-pending');
      row.append(dt, dd);
      dl.appendChild(row);
    });

    const complete = lines.length > 0 && lines.every((l) => l.value);
    const label = btn.querySelector('.btn__label');
    let timer;

    const copyText = async (text) => {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      const ta = document.createElement('textarea');   // respaldo para http / navegadores viejos
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) throw new Error('copy failed');
    };

    btn.addEventListener('click', async () => {
      clearTimeout(timer);
      if (!complete) {
        status.textContent = 'Los datos bancarios se publicarán muy pronto.';
        return;
      }
      try {
        await copyText(lines.map((l) => `${l.label}: ${l.value}`).join('\n'));
        btn.classList.add('is-copied');
        label.textContent = '¡Datos copiados!';
        status.textContent = 'Listo, ya puedes pegarlos en tu app del banco.';
        if (window.gsap && !window.WeddingAnimations.reduced) gsap.fromTo(btn, { scale: .94 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
      } catch (_) {
        status.textContent = 'No pudimos copiar automáticamente. Mantén presionado el texto para copiarlo.';
      }
      timer = setTimeout(() => {
        btn.classList.remove('is-copied');
        label.textContent = 'Copiar datos';
        status.textContent = '';
      }, 2600);
    });
  }

  /* ---------- Reproductor: en móvil se pliega a un disco flotante ---------- */ // NUEVO
  function initPlayerDisc() {
  const player = $('#player');
  if (!player) return;
  const cover = $('.player__cover', player);
  const toggleBtn = $('#player-toggle');
  const phone = window.matchMedia('(max-width: 767px)');
  const isDisc = () => player.classList.contains('player--docked') && phone.matches;

  const sync = () => {
    if (isDisc()) {
      cover.setAttribute('role', 'button');
      cover.setAttribute('tabindex', '0');
      cover.setAttribute('aria-label', 'Reproducir o pausar la música');
    } else {
      ['role', 'tabindex', 'aria-label'].forEach((a) => cover.removeAttribute(a));
    }
  };
  new MutationObserver(sync).observe(player, { attributes: true, attributeFilter: ['class'] });
  phone.addEventListener('change', sync);

  // En celular, tocar el disco = pausar / reproducir
  cover.addEventListener('click', () => { if (isDisc()) toggleBtn.click(); });
  cover.addEventListener('keydown', (e) => {
    if (isDisc() && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleBtn.click(); }
  });
  sync();
}

  /* ---------- Apertura del sobre ---------- */
  function initEnvelope() {
    const intro = $('#intro');
    const main = $('#invitation');
    const btn = $('#open-btn');
    const envelope = $('#envelope');
    if (!intro || !btn) return;

    main.inert = true;
    main.setAttribute('aria-hidden', 'true');
    let opened = false;

    const unlock = () => {
      intro.hidden = true;
      document.body.classList.remove('is-locked');
      main.inert = false;
      main.removeAttribute('aria-hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });  // 'instant' ignora el scroll-behavior: smooth del CSS
      window.WeddingAnimations.stopIntro();              // detiene las animaciones infinitas del sobre
      window.WeddingAnimations.revealHero();
      window.WeddingAnimations.initScroll();

      const target = location.hash && document.querySelector(location.hash);
      if (target && target.id !== 'hero') setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 900);
      else $('#hero').focus({ preventScroll: true });
    };

    btn.addEventListener('click', () => {
      if (opened) return;
      opened = true;
      btn.disabled = true;
      window.WeddingPlayer.play();   // el clic es un gesto válido: la música arranca aquí
      window.WeddingAnimations.openEnvelope({
        envelope,
        closed: $('.envelope__img--closed', envelope),
        open: $('.envelope__img--open', envelope),
        burst: $('.envelope__burst', envelope),
        button: btn,
      }, () => {
        window.WeddingPlayer.dock();
        window.WeddingAnimations.exitIntro(intro, unlock);
      });
    });
  }

  /* ---------- Arranque ---------- */
  function boot() {
    document.documentElement.classList.replace('no-js', 'js');
    imageFallbacks();

    const showText = () => document.documentElement.classList.add('fonts-ready');
if (document.fonts && document.fonts.load) {
  Promise.race([
    Promise.all([
      document.fonts.load('italic 300 1em "Playwrite GB S"'),
      document.fonts.load('500 1em "Mozilla Text"'),
    ]),
    new Promise((r) => setTimeout(r, 1500)),
  ]).then(showText, showText);
} else showText();

    // Cada módulo se aísla: si uno falla, los demás siguen funcionando.
    const safe = (name, fn) => { try { fn(); } catch (err) { console.error(`[${name}]`, err); } };
    safe('animations', () => window.WeddingAnimations.prepare());
    safe('player', () => window.WeddingPlayer.init());
    safe('player-disc', initPlayerDisc);   // NUEVO: va después de 'player'
    safe('countdown', () => window.WeddingCountdown.init());
    safe('gallery', () => window.WeddingGallery.init());
    safe('rsvp', () => window.WeddingRSVP.init());
    safe('maps', initMaps);
    safe('gifts', initGifts);
    safe('envelope', initEnvelope);

    // Al volver a la pestaña o con el botón "atrás", recalcula posiciones del scroll
    const resync = () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); };
    window.addEventListener('pageshow', (e) => { if (e.persisted) resync(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resync(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();