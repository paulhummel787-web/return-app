const CACHE_NAME = "architect-os-v2";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

/* ACTIVATE (clean old caches) */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* FETCH (network first, fallback cache) */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

/* 🔔 PUSH NOTIFICATIONS */
self.addEventListener("push", event => {
  const data = event.data?.text() || "RETURN TO EXECUTION";

  event.waitUntil(
    self.registration.showNotification("ARCHITECT OS", {
      body: data,
      icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
      vibrate: [200, 100, 200],
      tag: "architect-alert"
    })
  );
});

/* 🔘 NOTIFICATION CLICK */
self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (let client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});

/* 📡 BACKGROUND SYNC (retry logs if offline) */
self.addEventListener("sync", event => {
  if (event.tag === "sync-sessions") {
    event.waitUntil(syncSessions());
  }
});

async function syncSessions() {
  // Placeholder for future server sync
  console.log("Syncing session data...");
}

/* ⏱ PERIODIC BACKGROUND TASK */
self.addEventListener("periodicsync", event => {
  if (event.tag === "reminder") {
    event.waitUntil(sendReminder());
  }
});

async function sendReminder() {
  self.registration.showNotification("ARCHITECT OS", {
    body: "SYSTEM IDLE — RE-ENGAGE",
    vibrate: [100, 50, 100]
  });
}
