const CACHE_NAME = 'aetherflow-v28';
const ASSETS = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'assets/fonts/fonts.css',
  'assets/js/lucide.min.js',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((asset) => cache.add(asset))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Intercept and Cache First
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache external scripts like Lucide icons or Google Fonts dynamically when fetched!
        // We EXCLUDE any database requests to Supabase so we always get fresh online data.
        if (!e.request.url.includes('supabase.co') && 
            !e.request.url.includes('/api/nouns') && 
            (e.request.url.startsWith('http') || e.request.url.includes('unpkg') || e.request.url.includes('fonts'))) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    })
  );
});
