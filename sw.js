/**
 * 布可快速登入 Service Worker
 * 提供離線快取與 PWA 安裝支援
 */

const CACHE_NAME = 'bookplanet-quicklogin-v1';
const ASSETS_TO_CACHE = [
    '/quick-login.html',
    '/install.html',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/favicon.svg'
];

// 安裝時快取資源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] 快取資源中...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 啟用時清理舊快取
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// 網路優先，失敗時使用快取
self.addEventListener('fetch', (event) => {
    // 只處理 GET 請求
    if (event.request.method !== 'GET') return;
    
    // 跳過外部請求 (如登入頁)
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 成功取得網路回應，更新快取
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // 網路失敗，使用快取
                return caches.match(event.request);
            })
    );
});
