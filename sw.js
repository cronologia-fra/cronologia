/* Cronologia universale, versione per il telefono: conserva la pagina per usarla senza rete.
   Si apre sempre la copia conservata (subito, anche senza rete); se c'è rete si scarica in sottofondo quella nuova,
   che vale dall'apertura successiva. L'archivio non passa di qui: sta nella memoria di Chrome sul telefono. */
const CACHE = "cronologia-16375530db74";
const FILE = ["./", "./index.html", "./manifest.webmanifest", "./icona-192.png", "./icona-512.png", "./icona-maschera-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const conservata = await c.match(e.request, { ignoreSearch: true });
    const rete = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    if (conservata) { e.waitUntil(rete.catch(() => {})); return conservata; }
    return rete.catch(async () => (await c.match("./index.html")) || Response.error());
  }));
});
