const CACHE_NAME = 'reserve-ease-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/reserve_ease_logo_192.png',
  '/reserve_ease_logo_512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Notify client that we're loading from network
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'LOADING_START',
              url: event.request.url
            });
          });
        });

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            // Notify client that loading is complete
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'LOADING_END',
                  url: event.request.url
                });
              });
            });

            return response;
          })
          .catch(error => {
            // Notify client that loading failed
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'LOADING_ERROR',
                  url: event.request.url,
                  error: error.message
                });
              });
            });

            // If offline and request is for HTML, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }

            throw error;
          });
      })
  );
}); 