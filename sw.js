/**
 * Service Worker for 广西旅游达人 PWA
 * 缓存策略：Cache First, Network Fallback
 * @version 2.0
 */

const CACHE_NAME = 'guangxi-travel-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const IMAGE_CACHE = 'images-v2';

// 预缓存核心资源
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/main.css',
  '/js/banner.js',
  '/data/content.js',
  '/data/search.js',
  '/data/filter.js'
];

// 安装事件：预缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching assets:', PRECACHE_ASSETS.length);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Precache complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除非当前版本的缓存
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned');
        return self.clients.claim();
      })
  );
});

// 判断是否是静态资源
function isStaticResource(url) {
  const staticExtensions = ['.js', '.css', '.html', '.json', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// 判断是否是图片资源
function isImageResource(url) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
  return imageExtensions.some(ext => url.pathname.endsWith(ext));
}

// 判断是否是 API 请求
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || url.hostname.includes('api.');
}

// 获取缓存策略
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // 静态资源：Cache First
  if (isStaticResource(url)) {
    return 'cacheFirst';
  }
  
  // 图片资源：Cache First with Cache
  if (isImageResource(url)) {
    return 'imageCache';
  }
  
  // API 请求：Network First
  if (isAPIRequest(url)) {
    return 'networkFirst';
  }
  
  // 默认：Network First with Cache Fallback
  return 'networkFirst';
}

// 处理请求
async function handleRequest(request) {
  const strategy = getCacheStrategy(request);
  
  switch (strategy) {
    case 'cacheFirst':
      return handleCacheFirst(request, STATIC_CACHE);
    
    case 'imageCache':
      return handleCacheFirst(request, IMAGE_CACHE);
    
    case 'networkFirst':
      return handleNetworkFirst(request, DYNAMIC_CACHE);
    
    default:
      return handleNetworkFirst(request, DYNAMIC_CACHE);
  }
}

// Cache First 策略
async function handleCacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // 后台更新缓存
    fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Network error', { status: 408 });
  }
}

// Network First 策略
async function handleNetworkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Network error', { status: 408 });
  }
}

// 获取事件
self.addEventListener('fetch', (event) => {
  // 忽略非 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 忽略 chrome 扩展和 blob 请求
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || url.protocol === 'blob:') {
    return;
  }
  
  event.respondWith(handleRequest(event.request));
});

// 后台同步（用于表单提交等）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

async function syncFormData() {
  // 实现表单数据同步逻辑
  console.log('[SW] Syncing form data...');
}

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '有新的消息',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    tag: 'guangxi-travel-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('广西旅游达人', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded');