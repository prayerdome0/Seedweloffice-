/* Seedwel Office service worker — offline shell for the app.
   Strategy:
   • navigations  → network first, falling back to the cached shell
   • static assets (fonts, icons, brand) → cache first, then network
   Document data stays in Firestore/localStorage and is never cached here. */

const VERSION = "seedwel-v2";
const SHELL = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/brand/logo-full.svg",
  "/brand/mark.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL).catch(() => undefined)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/* ── Web push (FCM) ───────────────────────────────────────────────────────
   The FCM token is obtained from the page against this worker, so pushes
   land here. Payload shapes vary by sender (HTTP v1 `webpush.notification`,
   legacy `notification`, plain `data`), so everything is normalised first. */

const normalizePush = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const notification = payload.notification ?? payload.webpush?.notification ?? {};
  const data = payload.data ?? {};
  return {
    title: notification.title ?? payload.title ?? data.title ?? "Seedwel Office",
    body: notification.body ?? payload.body ?? data.body ?? "",
    icon: notification.icon ?? payload.icon ?? data.icon ?? "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url:
      payload.fcmOptions?.link ??
      notification.click_action ??
      payload.click_action ??
      data.url ??
      data.link ??
      "/app",
    tag: notification.tag ?? data.tag ?? undefined,
  };
};

self.addEventListener("push", (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }
  const push = normalizePush(payload);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const visible = windows.find((client) => client.visibilityState === "visible");
      if (visible) {
        // App is in view — let the page show an in-app toast instead.
        visible.postMessage({ seedwelPush: push });
        return;
      }
      await self.registration.showNotification(push.title, {
        body: push.body,
        icon: push.icon,
        badge: push.badge,
        tag: push.tag,
        data: { url: push.url },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/app";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("navigate" in client) {
          try {
            await client.navigate(url);
          } catch {
            /* cross-origin or mid-navigation — just focus instead */
          }
        }
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStatic = /^\/(_next\/static|_next\/image|fonts|icons|brand)\//.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        });
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/offline"))),
    );
  }
});
