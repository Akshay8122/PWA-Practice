var CACHE_STATIC_NAME = "static-v6";
var CACHE_DYNAMIC_NAME = "static-v8";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[Service worker] PreCaching App shell");

      cache.addAll([
        "/",
        "/index.html",
        "/src/js/app.js",
        "/src/js/fetch.js",
        "/src/js/main.js",
        "/src/js/material.min.js",
        "/src/js/promise.js",
        "/src/css/app.css",
        "/src/css/dynamic.css",
        "/src/css/main.css",
        "/src/images/icons/app-icon-48x48.png",
        "/src/images/icons/app-icon-96x96.png",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log(key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(function (err) {});
      }
    })
  );
});
