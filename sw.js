const CACHE_NAME = 'sman-crm-v2'; // 👈 رفعنا الرقم عشان يجبر متصفحك يرمي القديم ويسحب الجديد

// الملفات الأساسية للوحة الإدارة اللي هتتحفظ للطوارئ
const ASSETS_TO_CACHE = [
  './',
  './manifest.json'
  // لو عندك ملفات css أو js خارجية للإدارة ضيفها هنا
];

// تسطيب المحرك
self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل فوري بدون انتظار
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// تفعيل المحرك وتنظيف الأشباح القديمة (الكاش القديم)
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('تم تنظيف كاش الإدارة القديم:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// التعامل مع الطلبات باستراتيجية (Network First - الإنترنت أولاً)
self.addEventListener('fetch', event => {
  // نتجاهل طلبات فايربيس عشان دي داتا حية
  if (event.request.method !== 'GET' || event.request.url.includes('firestore.googleapis.com')) return;

  event.respondWith(
    // 1. نحاول نجيب أحدث حاجة من السيرفر (النت)
    fetch(event.request).then(networkResponse => {
      return caches.open(CACHE_NAME).then(cache => {
        // لو النت شغال، هنحدث الكاش بالنسخة الجديدة ونعرضها
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    }).catch(() => {
      // 2. لو النت فاصل تماماً، نعرض آخر نسخة كانت محفوظة في الكاش
      return caches.match(event.request);
    })
  );
});
