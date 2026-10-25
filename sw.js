// Cache-first service worker: the board works offline after the first visit.
var CACHE = 'planche-volley-v33';
var CORE = ['./', 'index.html', 'fondamentaux.html', 'fondamentaux/fiche-reception-service.jpg', 'fondamentaux/fiche-technique-de-bloc.jpg', 'fondamentaux/fiche-bloc-defense.jpg', 'manifest.webmanifest', 'logo.png', 'logos/police.png', 'logos/safran.png', 'logos/stromain.png', 'logos/etretat.png', 'logos/gravenchon.png', 'logos/harfleur.png', 'logos/lesloges.png', 'crest-lhevb.png', 'defaults.js', 'crest-lhevb.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.headers.has('range') || /\.mp4$/i.test(new URL(e.request.url).pathname)) return;   // videos are streamed, not cached
  e.respondWith(caches.match(e.request).then(function (hit) {
    var net = fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
