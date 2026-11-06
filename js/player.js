/* ==========================================================================
   REPRODUCTOR DE MÚSICA — play/pausa, barra de progreso accesible, tiempos.
   Nunca reproduce automáticamente.
   ========================================================================== */
(function () {
  'use strict';

  const formatTime = (s) => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const WeddingPlayer = {
    root: null,

    init() {
      const cfg = (window.WEDDING_CONFIG || {}).music || {};
      const root = document.getElementById('player');
      if (!root) return;
      this.root = root;

      const audio = root.querySelector('#player-audio');
      const btn = root.querySelector('#player-toggle');
      const seek = root.querySelector('#player-seek');
      const cur = root.querySelector('#player-current');
      const dur = root.querySelector('#player-duration');
      const artist = root.querySelector('#player-artist');

      root.querySelector('#player-title').textContent = cfg.title || 'Nuestra canción';
      artist.textContent = cfg.artist || '';
      if (cfg.cover) root.querySelector('#player-cover').src = cfg.cover;
      audio.volume = typeof cfg.volume === 'number' ? cfg.volume : 0.7;

      const setError = (msg) => {
        root.classList.add('is-error');
        root.classList.remove('is-playing');
        artist.textContent = msg;
        btn.disabled = true;
      };

      if (!cfg.src) { setError('Agrega tu canción en js/config.js'); return; }
      audio.src = cfg.src;

      let seeking = false;
      const paint = () => {
        const max = Number(seek.max) || 1;
        seek.style.setProperty('--p', `${(Number(seek.value) / max) * 100}%`);
      };
      const setPlaying = (playing) => {
        root.classList.toggle('is-playing', playing);
        btn.setAttribute('aria-pressed', String(playing));
        btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
      };

      btn.addEventListener('click', () => {
        if (audio.paused) {
          const p = audio.play();
          if (p && p.catch) p.catch(() => setPlaying(false)); // evita el "Uncaught (in promise)"
        } else {
          audio.pause();
        }
      });

      audio.addEventListener('play', () => setPlaying(true));
      audio.addEventListener('pause', () => setPlaying(false));
      audio.addEventListener('ended', () => { setPlaying(false); audio.currentTime = 0; });
      audio.addEventListener('error', () => setError('Canción no disponible'));

      audio.addEventListener('loadedmetadata', () => {
        seek.max = audio.duration || 100;
        dur.textContent = formatTime(audio.duration);
        paint();
      });
      audio.addEventListener('timeupdate', () => {
        if (seeking) return;
        seek.value = audio.currentTime;
        cur.textContent = formatTime(audio.currentTime);
        paint();
      });

      seek.addEventListener('input', () => {
        seeking = true;
        cur.textContent = formatTime(Number(seek.value));
        paint();
      });
      seek.addEventListener('change', () => {
        if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value);
        seeking = false;
      });
    },

    /** Mueve el reproductor fuera del sobre y lo fija abajo. */
    dock() {
      const root = this.root;
      if (!root || root.classList.contains('player--docked')) return;
      document.body.appendChild(root);
      root.classList.add('player--docked');
      document.body.classList.add('has-player');
      if (window.gsap && !window.WeddingAnimations.reduced) {
        gsap.fromTo(root, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', delay: .3 });
      }
    },
  };

  window.WeddingPlayer = WeddingPlayer;
})();
