// Service Worker for CA Final Tracker PWA
const CACHE_NAME = 'ca-tracker-v1';
const RUNTIME_CACHE = 'ca-tracker-runtime';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    let data = { title: 'CA Tracker', body: 'Notification', icon: '/icons/icon.png' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon.png',
        badge: '/icons/icon.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'ca-tracker-notification',
        requireInteraction: false,
        data: data.data || {},
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tracker-data') {
        event.waitUntil(syncTrackerData());
    }
});

async function syncTrackerData() {
    // Placeholder for future sync implementation
    console.log('Background sync triggered');
}
