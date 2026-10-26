// Service Worker — Task Manager PWA
// Cache-first for CDN assets (versioned, stable), network-first for app HTML.

const CACHE_VERSION = 'task-manager-v6.12-1';
const CDN_CACHE = 'tm-cdn-v1';
const APP_CACHE = 'tm-app-v1';

const CDN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/js-yaml@4/dist/js-yaml.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Install: pre-cache CDN assets and app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CDN_CACHE).then(cache => cache.addAll(CDN_ASSETS).catch(() => {
        // If any CDN fetch fails during install, skip — we'll try network at runtime
        console.log('[SW] Some CDN assets failed to pre-cache, will try at runtime');
      })),
      caches.open(APP_CACHE).then(cache => cache.add('./')).catch(() => {
        console.log('[SW] App shell failed to pre-cache');
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CDN_CACHE && key !== APP_CACHE)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CDN assets: cache-first (versioned, won't change)
  if (CDN_ASSETS.some(a => url.href.startsWith(a.split('?')[0]))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CDN_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // App shell (same-origin): network-first, fall back to cache when offline
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(APP_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./')))
    );
    return;
  }

  // Google Fonts CSS and font files: stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CDN_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});