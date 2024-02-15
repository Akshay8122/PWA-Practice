var deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired!");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

// make request using traditional xml

let xhr = new XMLHttpRequest();
xhr.open("GET", "https://httpbin.org/ip");
xhr.responseType = "json";

xhr.onload = function () {
  console.log(xhr.response);
};

xhr.onerror = function () {
  console.log("Error!");
};

xhr.send();

//make GET request using fetch method
fetch("https://httpbin.org/ip")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

// make POST request with configuration using fetch method
fetch("https://httpbin.org/post", {
  method: "POST",
  headers: {
    "Content-type": "Application/json",
    Accept: "Application/json",
  },
  body: JSON.stringify({ message: "Are you okay ?" }),
  mode: "cors",
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

//callback function using promises
let promise = new Promise(function (resolve, reject) {
  setTimeout(() => {
    // resolve("Hello PWA");
    reject({ code: 500, message: "An error occured!" });
    // console.log("This is execute after below timer is complete");
  }, 3000);
});

// using then and handle err through callback fn
promise
  .then(
    function (textMsg) {
      return textMsg;
    },
    function (err) {
      console.log(err.code, err.message);
    }
  )
  .then(function (newTextMsg) {
    console.log(newTextMsg);
  });

// Make simpler above code using catch insted of invoke function for catch error
promise
  .then((text) => console(text))
  .catch((err) => console.log(err.code, err.message));

console.log("This is execute before timer start");
