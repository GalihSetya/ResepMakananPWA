// Nama cache untuk aplikasi
const CACHE_NAME = 'my-app-cache';

// Daftar file yang akan dicache
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/index.js'
];

// Event listener saat Service Worker diinstall
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Event listener saat Service Worker diaktifkan
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
  );
});

// Event listener saat ada permintaan fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
