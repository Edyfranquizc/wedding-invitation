/* ==========================================================================
   RSVP — Formulario de Tally embebido (las respuestas van a Google Sheets
   mediante la integración nativa de Tally, configurada en su panel).
   Muestra el agradecimiento solo cuando Tally confirma el envío real.
   ========================================================================== */
(function () {
  'use strict';

  const TALLY_ORIGIN = 'https://tally.so';

  const WeddingRSVP = {
    init() {
      const cfg = (window.WEDDING_CONFIG || {}).rsvp || {};
      const embed = document.getElementById('rsvp-embed');
      const notice = document.getElementById('rsvp-notice');
      const closed = document.getElementById('rsvp-closed');
      const thanks = document.getElementById('rsvp-thanks');
      const deadlineEl = document.getElementById('rsvp-deadline');
      if (!embed) return;

      // Fecha límite legible (mediodía UTC para no correr el día por zona horaria)
      if (cfg.deadline && deadlineEl) {
        const [y, m, d] = cfg.deadline.split('-').map(Number);
        deadlineEl.textContent = new Intl.DateTimeFormat('es', {
          day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
        }).format(new Date(Date.UTC(y, m - 1, d, 12)));

        const endOfDeadline = new Date(`${cfg.deadline}T23:59:59-04:00`).getTime();
        if (cfg.closeAfterDeadline && Date.now() > endOfDeadline) {
          closed.hidden = false;
          return;
        }
      }

      if (!cfg.tallyFormId) {
        notice.hidden = false;
        console.info('[rsvp] Falta rsvp.tallyFormId en js/config.js');
        return;
      }

      const src = `${TALLY_ORIGIN}/embed/${encodeURIComponent(cfg.tallyFormId)}` +
        '?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';
      const iframe = document.createElement('iframe');
      iframe.dataset.tallySrc = src;
      iframe.title = 'Formulario de confirmación de asistencia';
      iframe.loading = 'lazy';
      iframe.width = '100%';
      iframe.height = '520';
      embed.appendChild(iframe);

      // Script oficial de Tally: ajusta la altura del iframe automáticamente
      const script = document.createElement('script');
      script.src = `${TALLY_ORIGIN}/widgets/embed.js`;
      script.async = true;
      const fallback = () => { if (!iframe.src) iframe.src = src; };
      script.onload = () => (window.Tally ? window.Tally.loadEmbeds() : fallback());
      script.onerror = fallback;
      document.body.appendChild(script);
      setTimeout(fallback, 4000);

      // Evento real de envío emitido por Tally
      window.addEventListener('message', (e) => {
        if (e.origin !== TALLY_ORIGIN) return;
        let data = e.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch (_) { return; } }
        if (!data || data.event !== 'Tally.FormSubmitted') return;
        embed.hidden = true;
        thanks.hidden = false;
        thanks.focus({ preventScroll: true });
        thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    },
  };

  window.WeddingRSVP = WeddingRSVP;
})();
