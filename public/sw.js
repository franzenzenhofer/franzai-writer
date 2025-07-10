/**
 * Franz AI Writer Service Worker
 * Provides offline functionality for document editing
 */

const CACHE_NAME = 'franzai-writer-v1';
const OFFLINE_URL = '/offline';

// Critical resources to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/offline',
  '/login',
  '/signup',
  // CSS and fonts
  '/_next/static/css/',
  // Icons and images
  '/favicon.ico',
  // Critical JS chunks will be added dynamically
];

// Resources that should be cached on first visit
const DYNAMIC_CACHE_URLS = [
  // API routes that might work offline
  '/api/documents/list',
  '/api/documents/save',
  '/api/documents/load',
];

// Resources to cache from CDN
const EXTERNAL_CACHE_URLS = [
  // Add any external resources here
];

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching critical resources...');
        // Cache static resources
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker install failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip Firebase Auth requests (they need real-time connection)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebase')) {
    return;
  }
  
  // Skip AI API requests (they need internet connection)
  if (url.pathname.startsWith('/api/ai/') || url.pathname.startsWith('/api/wizard/')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

/**
 * Handle different types of requests with appropriate caching strategies
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First for API routes (with offline fallback)
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstWithOfflineFallback(request);
    }
    
    // Strategy 3: Stale While Revalidate for pages
    if (isNavigationRequest(request)) {
      return await staleWhileRevalidate(request);
    }
    
    // Strategy 4: Network First for other requests
    return await networkFirst(request);
    
  } catch (error) {
    console.error('Request handling failed:', error);
    return await getOfflineFallback(request);
  }
}

/**
 * Cache First strategy - for static assets
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache first failed:', error);
    throw error;
  }
}

/**
 * Network First strategy - for dynamic content
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate strategy - for pages
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.error('Background fetch failed:', error);
    });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // If no cached version, wait for network
  return await fetchPromise;
}

/**
 * Network First with offline fallback for API routes
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Cache successful API responses
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // For document-related APIs, try to return cached version
    if (request.url.includes('/api/documents/')) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
    }
    
    // Return offline response for other API calls
    return new Response(
      JSON.stringify({
        error: 'Offline mode: This feature requires internet connection',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
  if (isNavigationRequest(request)) {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_URL);
    
    if (offlinePage) {
      return offlinePage;
    }
    
    // Return basic offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Franz AI Writer</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
            h1 { color: #333; }
            p { color: #666; line-height: 1.6; }
            .retry-btn { background: #007bff; color: white; padding: 10px 20px; border: none; 
                        border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 20px; }
            .retry-btn:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>Franz AI Writer is currently offline. Some features may not be available, but you can still work on your documents.</p>
            <p>Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
  
  return new Response('Offline', { status: 503 });
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2');
}

/**
 * Check if request is a navigation request
 */
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'document-save') {
    event.waitUntil(syncDocumentSave());
  }
});

/**
 * Sync document saves when back online
 */
async function syncDocumentSave() {
  try {
    // Get pending saves from IndexedDB or cache
    // This would need to be implemented with the client-side code
    console.log('Syncing offline document saves...');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Handle push notifications (for future use)
 */
self.addEventListener('push', (event) => {
  const options = {
    body: 'Your document is ready!',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  
  event.waitUntil(
    self.registration.showNotification('Franz AI Writer', options)
  );
});

console.log('Franz AI Writer Service Worker loaded');