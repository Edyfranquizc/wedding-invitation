/* ==========================================================================
   CONFIGURACIÓN — el único archivo que hay que tocar para adaptar la
   invitación a otra pareja (plantilla reutilizable).
   ========================================================================== */
window.WEDDING_CONFIG = {
  couple: {
    bride: 'Edithgary',
    groom: 'Cristian',
  },

  event: {
    // 18/12/2026 19:00 hora de Caracas (Venezuela: UTC-4 todo el año)
    date: '2026-12-18T19:00:00-04:00',
  },

  // Enlaces de Google Maps (búsqueda por nombre). Si tienen el pin exacto,
  // peguen aquí el enlace "Compartir" de Google Maps.
  maps: {
    ceremony: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Iglesia La Salle La Colina, Colina de los Caobos, Caracas'),
    party: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Residencias El Cóndor, Los Palos Grandes, Caracas'),
  },

  music: {
    title: 'Marry You',          // PLACEHOLDER
    artist: 'Bruno Mars',                // PLACEHOLDER
    cover: '/assets/images/couple/historia-01.jpg',
    src: '/assets/music/Bruno Mars - Marry You (Official Lyric Video).mp3',
    volume: 0.7,
  },

  // Fotos que va revelando la cámara (en orden)
  camera: {
    photos: [
      '/assets/images/couple/historia-01.jpg',
      '/assets/images/couple/historia-02.jpg',
      '/assets/images/couple/historia-03.jpg',
      '/assets/images/couple/historia-04.jpg',
      '/assets/images/couple/historia-05.jpg',
    ],
  },

  // Datos bancarios: completar cuando los novios los envíen.
  // Mientras un valor esté vacío se muestra "Por confirmar" y el botón no copia nada.
  gifts: [
    { label: 'Titular', value: 'Edithgary Franquiz' },
    { label: 'Banco', value: 'Mercantil' },
    { label: 'Cédula', value: '19289739' },
    { label: 'Celular', value: '04142146671' },
  ],

  rsvp: {
    // ID del formulario de Tally: en https://tally.so/r/w4ZQ9a el ID es "w4ZQ9a"
    tallyFormId: 'e5D2Nq',
    deadline: '2026-12-10',
    closeAfterDeadline: false,   // true = oculta el formulario pasado el 10/12
  },
};
