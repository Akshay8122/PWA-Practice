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

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "dd1e54cc5f6590c60b20e5e4ff8beb28"
  },
  {
    "url": "manifest.json",
    "revision": "d11c7965f5cfba711c8e74afa6c703d7"
  },
  {
    "url": "offline.html",
    "revision": "45352e71a80a5c75d25e226e7330871b"
  },
  {
    "url": "src/css/app.css",
    "revision": "59d917c544c1928dd9a9e1099b0abd71"
  },
  {
    "url": "src/css/feed.css",
    "revision": "e873411a63b23939f405669eb8927a25"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "757fd6f5708b093ccb56b604036bf880"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "be11bb1207975b15bb95e938a7010950"
  },
  {
    "url": "src/js/fetch.min.js",
    "revision": "f258cf8e71371bd6f158a7fffe7df405"
  },
  {
    "url": "src/js/idb.min.js",
    "revision": "d8dd6e8a931d2a556beeaae3bb16c985"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.min.js",
    "revision": "f874d37f9e9202ba09b3f2e4995c4827"
  },
  {
    "url": "src/js/utility.min.js",
    "revision": "109b2f15f904fdc6f47081e064afb458"
  }
]);

self.addEventListener("sync", function (event) {
  console.log("[Service Worker] Background syncing", event);
  if (event.tag === "sync-new-posts") {
    console.log("[Service Worker] Syncing new Posts");
    event.waitUntil(
      readAllData("sync-posts").then(function (data) {
        for (var dt of data) {
          console.log(dt, "dt>>>");

          fetch(
            "https://pwagram-b89fc-default-rtdb.firebaseio.com/pwagram/posts.json",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image:
                  "https://firebasestorage.googleapis.com/v0/b/pwagram-b89fc.appspot.com/o/sf-boat.jpg?alt=media&token=b8e0516a-81c8-408b-bd95-bf4ba367e308",
                rawLocationLat: toString(dt.rawLocation.lat),
                rawLocationLng: toString(dt.rawLocation.lng),
              }),
            }
          )
            .then(function (res) {
              console.log("Sent data", res);
              if (res.ok) {
                deleteItemFromData("sync-posts", dt.id); // Isn't working correctly!
              }
            })
            .catch(function (err) {
              console.log("Error while sending data", err);
            });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === "confirm") {
    console.log("Confirm was chosen");
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll().then(function (clis) {
        var client = clis.find(function (c) {
          return c.visibilityState === "visible";
        });

        if (client !== undefined) {
          client.navigate("http://localhost:8000");
          client.focus();
        } else {
          clients.openWindow("http://localhost:8000");
        }
        notification.close();
      })
    );
  }
});

self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed", event);
});

self.addEventListener("push", function (event) {
  console.log("Push Notification received", event);

  var data = {
    title: "New!",
    content: "Something new happened!",
    openUrl: "/",
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  var options = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: data.openUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
