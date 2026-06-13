// 왓뉴스 — 푸시 알림 + 오프라인 캐시 서비스워커

const CACHE = 'news-v1'
const PRECACHE = ['/', '/manifest.json', '/favicon.svg', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 페이지 이동: 네트워크 우선(최신 뉴스), 실패 시 캐시 → 홈 순으로 폴백
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
          return res
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/')))
    )
    return
  }

  // 정적 자산: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || '왓뉴스'
  const options = {
    body: payload.body || '오늘의 새 키워드가 도착했어요.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'daily-keywords',
    data: { url: payload.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // 푸시 페이로드의 url은 신뢰하지 않는다. 같은 오리진으로만 이동시켜 오픈 리다이렉트를 막는다.
  const raw = (event.notification.data && event.notification.data.url) || '/'
  let target = '/'
  try {
    const resolved = new URL(raw, self.location.origin)
    if (resolved.origin === self.location.origin) target = resolved.pathname + resolved.search
  } catch {}
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(target) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(target)
    })
  )
})
