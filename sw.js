// Nama cache untuk service worker Anda
const CACHE_FORTOFOLIO = 'my-cache-cv';

// Versi cache saat ini untuk memungkinkan pembaruan cache
const CURRENT_CACHE_VERSION = 1;

// Event listener untuk menginstal service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(`${CACHE_FORTOFOLIO}-v${CURRENT_CACHE_VERSION}`).then((cache) => {
      return cache.addAll([
        '/index.html',
        '/script.js',
        '/style.css',
        '/manifest.json',
        '/brewoknavia425.png',
        '/brewoknavia512.png',
        '/brewoknavia192.png'
      ]);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Event listener untuk mengaktifkan service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_FORTOFOLIO) && cacheName !== `${CACHE_FORTOFOLIO}-v${CURRENT_CACHE_VERSION}`) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event listener untuk menangani permintaan fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(`${CACHE_FORTOFOLIO}-v${CURRENT_CACHE_VERSION}`).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});