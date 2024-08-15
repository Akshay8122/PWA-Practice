importScripts("workbox-sw.prod.v2.1.3.js");
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts",
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    },
  })
);

workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "material-css",
  })
);

workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "post-images",
  })
);

workboxSW.router.registerRoute(
  "https://pwagram-b89fc-default-rtdb.firebaseio.com/pwagram/posts.json",
  async function (args) {
    const res = await fetch(args.event.request);
    var clonedRes = res.clone();
    clearAllData("posts")
      .then(function () {
        return clonedRes.json();
      })
      .then(function (data) {
        for (var key in data) {
          writeData("posts", data[key]);
        }
      });
    return res;
  }
);

workboxSW.router.registerRoute(
  function (routeData) {
    return routeData.event.request.headers.get("accept").includes("text/html");
  },
  async function (args) {
    const response = await caches.match(args.event.request);
    if (response) {
      return response;
    } else {
      return fetch(args.event.request)
        .then(async function (res) {
          const cache = await caches.open("dynamic");
          cache.put(args.event.request.url, res.clone());
          return res;
        })
        .catch(async function (err) {
          const res_1 = await caches.match("/offline.html");
          return res_1;
        });
    }
  }
);

workboxSW.precache([]);
