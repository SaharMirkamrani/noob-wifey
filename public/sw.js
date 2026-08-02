// Minimal offline service worker: runtime-caches the app shell so Noob Wifey
// opens without a connection. Never caches the data API.
// Bump CACHE when the caching strategy changes so old caches are purged.
const CACHE = 'noob-wifey-v2'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)

  // only handle same-origin GETs; let the data API always hit the network
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  // navigations: always pull a FRESH shell from the network, bypassing the HTTP
  // cache, so a new deploy shows up on next launch instead of waiting for the
  // Pages CDN cache to expire. Fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(new Request(req.url, { cache: 'no-store' }))
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copy))
          return res
        })
        .catch(() => caches.match('./').then((r) => r || caches.match('./index.html')))
    )
    return
  }

  // hashed assets: cache-first, then network (filenames change per build, so a
  // new build always fetches fresh files instead of serving stale ones)
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      }).catch(() => cached)
    })
  )
})
