const CACHE_NAME = 'reserve-ease-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/reserve_ease_logo_192.png',
  '/reserve_ease_logo_512.png',
  '/assets/index.css',
  '/assets/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );

  self.skipWaiting();
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});


self.addEventListener('fetch', (event) => {

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }


  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.url.includes('/reservations/') || event.request.url.includes('/walkins/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

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
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Cache update failed:', error);
              });

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
            console.error('Fetch failed:', error);
          
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'LOADING_ERROR',
                  url: event.request.url,
                  error: error.message
                });
              });
            });

            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }

            throw error;
          });
      })
  );
}); 