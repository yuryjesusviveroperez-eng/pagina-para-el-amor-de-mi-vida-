/* =========================================================
   NUESTRO UNIVERSO ❤️ — sw.js (v5)
   Caché del "app shell" para carga rápida y uso sin conexión.
   - La nueva versión NO se activa sola: la página muestra un
     botón "Actualizar" y solo entonces se activa (SKIP_WAITING).
   - Los audios (.mp3, .m4a…) no se cachean: pesan mucho y el
     reproductor ya busca variantes de nombre por su cuenta.
   - Firebase y otros CDN externos no se interceptan.
========================================================= */

const CACHE_VERSION = 'v5';
const CACHE_NAME = 'universo-scarleth-' + CACHE_VERSION;

const ARCHIVOS_ESENCIALES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icono.png',
  './icono-192.png',
];

const EXTENSIONES_IGNORADAS = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'];

self.addEventListener('install', event => {
  // Sin skipWaiting aquí: la activación la decide la persona desde la página.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(ARCHIVOS_ESENCIALES.map(url => cache.add(url).catch(() => { /* archivo opcional ausente */ })))
    )
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(
        nombres
          .filter(n => n.startsWith('universo-scarleth-') && n !== CACHE_NAME)
          .map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (EXTENSIONES_IGNORADAS.some(ext => url.pathname.toLowerCase().endsWith(ext))) return;

  if (request.mode === 'navigate') {
    // HTML: red primero (para recibir cambios), caché si no hay conexión
    event.respondWith(
      fetch(request)
        .then(respuesta => {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copia));
          return respuesta;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // CSS/JS/imágenes: caché al instante y actualización en segundo plano
  event.respondWith(
    caches.match(request).then(enCache => {
      const enRed = fetch(request)
        .then(respuesta => {
          if (respuesta && respuesta.status === 200) {
            const copia = respuesta.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copia));
          }
          return respuesta;
        })
        .catch(() => enCache);
      return enCache || enRed;
    })
  );
});
