// Minimal Service Worker to enable PWA installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Just a pass-through for now to satisfy PWA requirements
  // In the future, we can add caching logic here
});
