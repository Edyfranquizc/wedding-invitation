# Edithgary & Cristian — Invitación digital

Landing de boda con dirección de arte Regency / Bridgerton: papel marfil, encaje dorado, filigranas, sobre interactivo del que salen las fotos, reproductor de música, cámara con flash y RSVP con Tally + Google Sheets.

HTML5 + CSS3 + JavaScript (sin frameworks) + GSAP/ScrollTrigger por CDN. Listo para GitHub + Vercel (sin build).

## Estructura

```
index.html
css/styles.css
js/
  config.js      ← TODO lo editable: fecha, música, fotos de la cámara, regalos, Tally
  main.js        ← arranque, apertura del sobre, placeholders, mapas, copiar datos
  player.js      ← reproductor tipo Spotify (play/pausa, barra, tiempos)
  countdown.js   ← cuenta regresiva (hora de Caracas) + calendario
  gallery.js     ← lightbox, cámara, tira de película
  animations.js  ← GSAP: sobre, revelado de la carta, scroll, parallax
  rsvp.js        ← embed de Tally + mensaje de agradecimiento real
assets/images/ y assets/music/
```

## 1. Recursos: renombrar y copiar

Los nombres con espacios, tildes y "&" fallan en servidores. Renombrá tus archivos así:

| Tu archivo | Guardar como |
|---|---|
| Sobre Marfil con Sello Dorado E&C.png | `assets/images/envelope.png` |
| Sobre con sello de cera dorado.png (sobre abierto) | `assets/images/envelope-open.png` |
| Querubín victoriano con arco y alas.png | `assets/images/cupids/cupido-arco-alas.png` |
| Querubín alado con arco dorado.png | `assets/images/cupids/cupido-arco-dorado.png` |
| Mi cámara favorita retro.png | `assets/images/camera.png` |
| Flores (PNG transparente) | `assets/images/flowers/flores-esquina.png`, `rama-rosas.png`, `flor-lateral.png` |
| Portada de la canción | `assets/images/music-cover.jpg` |
| Canción | `assets/music/nuestra-cancion.mp3` |

Fotos de la pareja en `assets/images/couple/`:
`portada.jpg`, `sobre-01..03.jpg` (salen del sobre), `historia-01..05.jpg`, `camara-01..04.jpg`, `film-01..06.jpg`, `cierre.jpg`, y `assets/images/og-cover.jpg` (1200×630, vista previa en WhatsApp).

Mientras falte un archivo, la página muestra un marco con encaje y el nombre del archivo pendiente (nunca un ícono roto). Si faltan las imágenes del sobre, se dibuja un sobre de respaldo en CSS.

Optimizá las fotos antes de subirlas (≈1600 px de lado largo, JPG/WebP calidad 75–80).

## 2. Ajustes finos de tus imágenes (en `css/styles.css`)

- **Boca del sobre abierto**: `.envelope { --pocket-bottom: 46%; }` — altura desde abajo donde las fotos "entran" al sobre. Subila o bajala hasta que las fotos parezcan salir de adentro.
- **Pantalla de la cámara**: `.camera { --cam-top; --cam-left; --cam-w; --cam-h }` — posición del hueco de la foto dentro de `camera.png`.

## 3. RSVP con Tally + Google Sheets

1. En Tally crear el formulario con: Nombre y apellido · ¿Vas a asistir? (Sí/No) · Cantidad de acompañantes · Restricciones alimentarias · Mensaje (opcional).
2. Lógica condicional: si "¿Vas a asistir?" = No → ocultar acompañantes y restricciones.
3. Integrations → Google Sheets → conectar (cada respuesta queda como fila).
4. Settings → Email notifications para que les llegue un correo a los novios.
5. Copiar el ID del link (`tally.so/r/ABC123` → `ABC123`) en `js/config.js → rsvp.tallyFormId`.

El agradecimiento de la página aparece solo cuando Tally confirma el envío real (`Tally.FormSubmitted`).

## 4. Regalos

Completar `gifts` en `js/config.js`. Mientras haya valores vacíos se muestra "Por confirmar" y el botón no copia nada inventado.

## 5. Probar y publicar

```bash
npx serve .          # o: python3 -m http.server
```
Abrí `http://localhost:3000`. Para publicar: subir el repo a GitHub → Vercel → "Add New Project" → importar → Deploy (sin configuración extra).

## 6. Reutilizar como plantilla

Para otra pareja: cambiar textos en `index.html`, datos en `js/config.js` y, si hace falta, los tokens de color/fuente en `:root` de `css/styles.css`.

## Decisiones de diseño (para Behance)

- **Paleta** respetada; se agregó `--gold-ink #86703F` solo para texto pequeño, porque el dorado #CBAE71 sobre marfil no alcanza contraste AA.
- **Tipografía**: Playwrite England SemiJoined itálica (títulos y nombres), Edu QLD Hand (acentos manuscritos), Mozilla Text (lectura, números de la cuenta regresiva en peso 200).
- **Texturas** generadas en SVG (encaje, red de encaje, grano de papel, lino): pesan casi nada y escalan nítidas.
- **Motion**: un solo clic abre todo; vibración del sobre → destello del sello → fotos que salen → transición a la carta con revelado fotográfico. Respeta `prefers-reduced-motion` y funciona aunque GSAP no cargue.
