const CACHE = 'esh-w-v4';
const urls = [
  'index.html',
  'styles.css?3',
  'app.js?3',
  'manifest.json',
  'favicon.ico',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(urls)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);

  // network-first for HTML
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('index.html')));
    return;
  }

  // Cloudinary images — cache-first for offline
  if (u.hostname.includes('cloudinary.com') || u.hostname.includes('res.cloudinary.com')) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        try {
          const res = await fetch(e.request);
          if (res.ok) c.put(e.request, res.clone());
          return res;
        } catch {
          return hit || new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // app shell — cache-first
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => {
      if (u.pathname.startsWith('/api/')) {
        return new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } });
      }
    }))
  );
});
