<<<<<<< HEAD
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
=======
// Service Worker - Claude Code Haha 优化版
const CACHE_NAME = 'guangxi-travel-v3-' + new Date().toISOString().slice(0, 10);
const OFFLINE_URL = '/offline.html';

// 需要缓存的资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
  '/images/logo.png',
  '/images/logo.webp',
  '/manifest.json'
];

// 安装阶段
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装开始');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 预缓存资源');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] 安装失败:', error);
>>>>>>> 3a450e1 (优化版广西旅游网站)
      })
  );
});

<<<<<<< HEAD
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
=======
// 激活阶段
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧缓存
          if (cacheName.startsWith('guangxi-travel-') && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] 激活完成');
      return self.clients.claim();
    })
  );
});

// 请求拦截
self.addEventListener('fetch', event => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') return;
  
  // 跳过Chrome扩展等
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  const requestUrl = new URL(event.request.url);
  
  // 处理API请求
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 缓存API响应（短期）
          const apiCache = caches.open('api-cache');
          apiCache.then(cache => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => {
          // API失败时尝试从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 处理图片请求
  if (/\.(jpg|png|webp|gif|svg)$/.test(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] 从缓存返回图片:', requestUrl.pathname);
            return cachedResponse;
          }
          
          // 网络请求
          return fetch(event.request)
            .then(response => {
              // 检查响应是否有效
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // 缓存图片
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(error => {
              console.error('[Service Worker] 图片加载失败:', error);
              // 返回占位图
              return caches.match('/images/placeholder.png');
            });
        })
    );
    return;
  }
  
  // 处理HTML/CSS/JS请求
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 网络优先策略
        return fetch(event.request)
          .then(response => {
            // 更新缓存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] 网络请求失败:', error);
            
            // 返回缓存内容
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // 如果是HTML请求，返回离线页面
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            
            // 其他资源返回空响应
            return new Response('网络连接失败', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
>>>>>>> 3a450e1 (优化版广西旅游网站)
      })
  );
});

<<<<<<< HEAD
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
=======
// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] 后台同步开始');
    event.waitUntil(syncData());
  }
});

// 推送通知
self.addEventListener('push', event => {
  console.log('[Service Worker] 推送通知:', event);
  
  const options = {
    body: event.data ? event.data.text() : '新消息',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('广西旅游', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] 通知点击:', event.notification.tag);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// 辅助函数
async function syncData() {
  try {
    // 这里可以添加需要同步的数据
    console.log('[Service Worker] 数据同步完成');
  } catch (error) {
    console.error('[Service Worker] 同步失败:', error);
  }
}

// 缓存清理（定期运行）
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCache = cacheNames.find(name => name === CACHE_NAME);
  
  if (currentCache) {
    // 保留最近3个版本的缓存
    const oldCaches = cacheNames
      .filter(name => name.startsWith('guangxi-travel-') && name !== CACHE_NAME)
      .sort()
      .slice(0, -2); // 保留最后2个旧缓存
    
    await Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
    
    console.log('[Service Worker] 清理旧缓存完成');
  }
}

// 定期清理（每月一次）
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cleanup-caches') {
    event.waitUntil(cleanupOldCaches());
  }
});
>>>>>>> 3a450e1 (优化版广西旅游网站)
