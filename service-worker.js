const CACHE_NAME = 'weather-pwa-auto-cache';
const urlsToCache = [
    '.',
    './index.html',
    './styles.css',  // якщо є
    './script.js',   // якщо є
    './jaromirka.jpg',
    './zavadyntsi.jpg',
    './icon-192.png',
    './icon-512.png'
];

// Під час інсталяції кешуємо базові ресурси
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Очищуємо старі кеші при активації
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (!cacheWhitelist.includes(key)) {
                    return caches.delete(key);
                }
            })
        ))
    );
    self.clients.claim();
});

// Стратегія stale-while-revalidate
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Оновлюємо кеш
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(() => {
                // Якщо мережа недоступна — повертаємо кеш (якщо є)
                return cachedResponse;
            });

            // Повертаємо кеш негайно, або очікуємо на мережу, якщо кешу немає
            return cachedResponse || fetchPromise;
        })
    );
});
