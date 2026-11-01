const CACHE = 'xingwei-mobile-v1';
const FILES = ['./', './index.html', './styles.css', './manifest.webmanifest', './src/app.js', './src/data.js', './src/engine.js', './src/icons.js', ...['flagship', 'avatar', 'nebula', 'sentinel', 'lances', 'abyss', 'dyson', 'computer', 'biopod', 'portal', 'collector', 'fuelship', 'planet', 'relic', 'upgrade', 'cruiser'].map(name => `./assets/${name}.webp`), './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('xingwei-mobile-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const clone = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, clone))); }
    return response;
  }).catch(() => caches.match(event.request)));
});
