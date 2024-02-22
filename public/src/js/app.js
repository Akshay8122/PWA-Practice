var deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("[Service worker] is registered !!");
    })
    .catch(function (err) {
      console.log(err);
    });
}

addEventListener("beforeinstallPrompt", function (event) {
  console.log("beforeinstallPrompt fired!");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
