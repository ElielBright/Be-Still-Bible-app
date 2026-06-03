const CACHE_NAME = "edify-cache-v1"
const STATIC_ASSETS = ["/", "/home", "/bible", "/sermons", "/notes"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse
      return fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const url = new URL(event.request.url)
            if (url.protocol === "http:" || url.protocol === "https:") {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone)
              })
            }
          }
          return response
        })

        .catch(() => {
          return caches.match(event.request)
        })
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
})

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}
  const title = data.notification?.title || "Edify"
  const body = data.notification?.body || "Time for your quiet time"

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      data: { url: data.data?.url || "/" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const urlToOpen = event.notification.data?.url || "/"
  event.waitUntil(clients.openWindow(urlToOpen))
})
