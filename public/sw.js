const CACHE_NAME = "my-app-v1";

const APP_ROUTES = [
  "/",
  "/active-clients",
  "/clients",
  "/pipeline",
  "/properties",
  "/attendance",
  "/visits",
  "/employee",
  "/analytics",
];

const OFFLINE_PAGE = "/offline";

// ----------------------------------------------------
// INSTALL
// ----------------------------------------------------

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache offline page
      await cachePage(cache, OFFLINE_PAGE);

      // Pre-cache every application route
      for (const route of APP_ROUTES) {
        await cachePage(cache, route);
      }

      self.skipWaiting();
    })()
  );
});


// ----------------------------------------------------
// ACTIVATE
// ----------------------------------------------------

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});


// ----------------------------------------------------
// FETCH
// ----------------------------------------------------

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Only handle our own domain
  if (url.origin !== self.location.origin) {
    return;
  }

  // Don't cache API/backend requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Next.js static JS/CSS/assets
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      cacheFirst(request)
    );

    return;
  }

  // Images/fonts/etc.
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      cacheFirst(request)
    );

    return;
  }

  // Page navigation
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirstNavigation(request)
    );

    return;
  }
});


// ----------------------------------------------------
// CACHE PAGE + ITS NEXT.JS ASSETS
// ----------------------------------------------------

async function cachePage(cache, route) {
  try {
    const response = await fetch(route, {
      credentials: "include",
    });

    if (!response.ok) {
      console.warn(
        `[SW] Could not cache ${route}: ${response.status}`
      );

      return;
    }

    // Clone because response can only be consumed once
    const responseClone = response.clone();

    await cache.put(route, responseClone);

    // Read HTML and find referenced assets
    const html = await response.text();

    const assets = extractAssets(html);

    await Promise.all(
      assets.map(async (asset) => {
        try {
          const assetResponse = await fetch(asset, {
            credentials: "include",
          });

          if (assetResponse.ok) {
            await cache.put(asset, assetResponse);
          }
        } catch (error) {
          console.warn(
            `[SW] Failed to cache asset: ${asset}`,
            error
          );
        }
      })
    );

    console.log(
      `[SW] Cached page: ${route}`
    );

  } catch (error) {
    console.warn(
      `[SW] Failed to cache page: ${route}`,
      error
    );
  }
}


// ----------------------------------------------------
// EXTRACT JS / CSS / IMAGE ASSETS FROM HTML
// ----------------------------------------------------

function extractAssets(html) {
  const assets = new Set();

  // JS
  const scripts = html.matchAll(
    /<script[^>]+src=["']([^"']+)["']/gi
  );

  for (const match of scripts) {
    addAsset(match[1], assets);
  }

  // CSS
  const styles = html.matchAll(
    /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi
  );

  for (const match of styles) {
    addAsset(match[1], assets);
  }

  // Images
  const images = html.matchAll(
    /<img[^>]+src=["']([^"']+)["']/gi
  );

  for (const match of images) {
    addAsset(match[1], assets);
  }

  return [...assets];
}


// ----------------------------------------------------
// NORMALIZE ASSET URL
// ----------------------------------------------------

function addAsset(asset, assets) {
  try {
    const url = new URL(
      asset,
      self.location.origin
    );

    if (url.origin !== self.location.origin) {
      return;
    }

    assets.add(url.href);

  } catch {
    // Ignore invalid URLs
  }
}


// ----------------------------------------------------
// CACHE FIRST
// ----------------------------------------------------

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(
        request,
        response.clone()
      );
    }

    return response;

  } catch {
    return new Response(
      "Offline",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  }
}


// ----------------------------------------------------
// NAVIGATION: NETWORK FIRST → CACHE → OFFLINE
// ----------------------------------------------------

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(
        request,
        response.clone()
      );
    }

    return response;

  } catch {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return (
      (await cache.match(OFFLINE_PAGE)) ||
      new Response(
        "You are offline.",
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain",
          },
        }
      )
    );
  }
}