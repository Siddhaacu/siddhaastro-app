const CACHE_NAME = "siddha-astro-pwa-v2";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/logo.png",
  "/styles.css",
  "/app.js",
  "/panchangam.js",
  "/daily-slokas.js",
  "/panchangam.html",
  "/astrology.html",
  "/horoscope.html",
  "/kundali.html",
  "/library.html",
  "/more.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("siddha-astro-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/.netlify/") || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (error) {
        return (await caches.match(request)) || (await caches.match("/index.html")) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const update = fetch(request).then(response => {
      if (response && response.ok && response.type === "basic") {
        caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      }
      return response;
    }).catch(() => cached);
    return cached || update;
  })());
});

self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = { body: event.data?.text() || "Today's Panchangam is ready." };
  }

  const title = data.title || "Siddha Astro";
  const options = {
    body: data.body || "Today's Panchangam is ready.",
    icon: data.icon || "/logo.png",
    badge: data.badge || "/logo.png",
    tag: "daily-panchangam",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [{ action: "open-panchangam", title: "View Panchangam" }],
    data: { url: data.url || "/panchangam.html" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = event.notification.data?.url || "/panchangam.html";
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      try {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return;
        }
      } catch (error) {}
    }
    if (clients.openWindow) await clients.openWindow(target);
  })());
});
