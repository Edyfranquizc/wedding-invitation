/* ==========================================================================
   CUENTA REGRESIVA + CALENDARIO
   La fecha incluye su zona horaria (-04:00, Caracas), así el conteo es
   correcto sin importar desde qué país abran la invitación.
   ========================================================================== */
(function () {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');

  const WeddingCountdown = {
    timer: null,

    init() {
      const cfg = (window.WEDDING_CONFIG || {}).event || {};

      const clock = document.getElementById('countdown');
      const done = document.getElementById('countdown-done');
      if (!clock || !cfg.date) return;

      const target = new Date(cfg.date).getTime();
      if (Number.isNaN(target)) { console.warn('[countdown] Fecha inválida en config.js'); return; }

      const els = {};
      clock.querySelectorAll('[data-unit]').forEach((el) => { els[el.dataset.unit] = el; });

      const set = (el, value) => {
        if (!el || el.textContent === value) return;
        el.textContent = value;
        el.classList.remove('tick');
        void el.offsetWidth; // reinicia la animación
        el.classList.add('tick');
      };

      const tick = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
          clock.hidden = true;
          if (done) done.hidden = false;
          clearInterval(this.timer);
          return;
        }
        const s = Math.floor(diff / 1000);
        set(els.days, pad(Math.floor(s / 86400)));
        set(els.hours, pad(Math.floor((s % 86400) / 3600)));
        set(els.minutes, pad(Math.floor((s % 3600) / 60)));
        set(els.seconds, pad(s % 60));
      };

      tick();
      this.timer = setInterval(tick, 1000);
    },

    renderCalendar(dateStr) {
      const box = document.getElementById('calendar');
      if (!box || !dateStr) return;
      const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
      const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();   // 0 = domingo
      const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const fmt = (opts) => new Intl.DateTimeFormat('es', { timeZone: 'UTC', ...opts });
      const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
      const ref = new Date(Date.UTC(y, m - 1, d, 12));

      const dows = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
      let cells = dows.map((x) => `<span class="calendar__dow">${x}</span>`).join('');
      for (let i = 0; i < first; i++) cells += '<span></span>';
      for (let day = 1; day <= total; day++) {
        cells += `<span class="calendar__day${day === d ? ' calendar__day--event' : ''}">${day}</span>`;
      }

      box.innerHTML = `
        <p class="calendar__month">${cap(fmt({ month: 'long', year: 'numeric' }).format(ref))}</p>
        <div class="calendar__grid" aria-hidden="true">${cells}</div>
        <span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">
          ${fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(ref)}
        </span>`;
    },
  };

  window.WeddingCountdown = WeddingCountdown;
})();
