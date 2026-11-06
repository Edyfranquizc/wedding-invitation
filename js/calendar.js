/* js/calendar.js · Calendario del mes de la boda con el día del evento en forma de corazón.
   Se dibuja dentro de <div id="calendar">. Para otra pareja, cambiá solo EVENT. */
(() => {
  const EVENT = { year: 2026, month: 11, day: 18 };          // month: 0-11 (11 = diciembre)
  const root = document.getElementById('calendar');
  if (!root || root.children.length) return;                  // no pisa nada si ya tiene contenido

  const first = new Date(EVENT.year, EVENT.month, 1);
  const total = new Date(EVENT.year, EVENT.month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;                    // la semana empieza en lunes
  const month = first.toLocaleDateString('es', { month: 'long' });
  const title = month.charAt(0).toUpperCase() + month.slice(1) + ' ' + EVENT.year;

  const dows = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    .map(d => `<span class="calendar__dow">${d}</span>`);
  const blanks = Array.from({ length: offset }, () => '<span class="calendar__day"></span>');
  const days = Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    return n === EVENT.day
      ? `<span class="calendar__day calendar__day--event">${n}</span>`
      : `<span class="calendar__day">${n}</span>`;
  });

  root.innerHTML =
    `<p class="calendar__month">${title}</p>` +
    `<div class="calendar__grid" role="img" aria-label="Calendario de ${month} de ${EVENT.year}, con el día ${EVENT.day} marcado: día de la boda">` +
    [...dows, ...blanks, ...days].join('') + '</div>';

  if (window.ScrollTrigger) ScrollTrigger.refresh();          // recalcula posiciones tras insertar el calendario
})();