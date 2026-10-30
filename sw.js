/* App GUMED: guarda la "cáscara" (esta página, íconos y manifiesto) para que abra al instante y sin señal.
   v2 (30 oct 2026): primero contesta con lo guardado en el teléfono y actualiza por detrás (antes esperaba a internet).
   El sistema en sí se baja del Apps Script y se guarda en el teléfono (ver index.html). */
var CACHE = "gumed-app-v2";
var ARCHIVOS = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "sw.js"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (guardado) {
      var red = fetch(e.request).then(function (r) {
        if (r && r.ok) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copia); }); }
        return r;
      }).catch(function () { return guardado || caches.match("index.html"); });
      return guardado || red;
    })
  );
});
