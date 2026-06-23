const CACHE_NAME = 'sman-crm-v1';

// تسطيب المحرك
self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// تفعيل المحرك
self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

// التعامل مع الطلبات (عشان لو النت فصل الموقع ميكراشش)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
