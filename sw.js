/* «Проверка связи»: страница открывается и без сети / при «белых списках» (последняя сохранённая), замер ping.txt всегда идёт в сеть. */
const C = 'svz-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./'])).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('svz-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('/ping.txt')) return;
  e.respondWith(fetch(r, r.mode === 'navigate' ? { cache: 'no-cache' } : undefined).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(C).then(c => c.put(r.url.split('?')[0], copy)); }
    return res;
  }).catch(() => caches.match(r.url.split('?')[0]).then(m => m || caches.match(new URL('./', self.registration.scope).href))));
});
