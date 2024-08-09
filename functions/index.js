import { https } from "firebase-functions";

import {
  initializeApp,
  credential as _credential,
  database,
} from "firebase-admin";
var cors = require("cors")({ origin: true });
import { setVapidDetails, sendNotification } from "web-push";
import formidable from "formidable";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import { tmpdir } from "os";
import Busboy from "busboy";
import { join } from "path";

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

import serviceAccount from "./pwagram-fb-key.json";

var gcconfig = {
  projectId: "pwagram-b89fc",
  keyFilename: "pwagram-fb-key.json",
};

var gcs = require("@google-cloud/storage")(gcconfig);

initializeApp({
  credential: _credential.cert(serviceAccount),
  databaseURL: "https://pwagram-b89fc-default-rtdb.firebaseio.com/",
});

export const storePostData = https.onRequest(function (request, response) {
  cors(request, response, function () {
    var uuid = uuidv4();

    const busboy = new Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      console.log(
        `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      );
      const filepath = join(tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on(
      "field",
      function (
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        fields[fieldname] = val;
      }
    );

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", () => {
      var bucket = gcs.bucket("pwagram-b89fc.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid,
            },
          },
        },
        function (err, uploadedFile) {
          if (!err) {
            database()
              .ref("posts")
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(uploadedFile.name) +
                  "?alt=media&token=" +
                  uuid,
              })
              .then(function () {
                setVapidDetails(
                  "mailto:business@academind.com",
                  "BP6KzieHU7e99VsKeKTY8-3La3Q7apU3Gr-Kvc4WfYaUWi-FVTPQf4FBZXbwhA7966zH9YJAYEBntUhWeZ9BkH0",
                  "5HSnw0DfCwxNGnp3BltLbiD9DXDBXc1NXiVPZzeTkGY"
                );
                return database().ref("subscriptions").once("value");
              })
              .then(function (subscriptions) {
                subscriptions.forEach(function (sub) {
                  var pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh,
                    },
                  };

                  sendNotification(
                    pushConfig,
                    JSON.stringify({
                      title: "New Post",
                      content: "New Post added!",
                      openUrl: "/help",
                    })
                  ).catch(function (err) {
                    console.log(err);
                  });
                });
                response
                  .status(201)
                  .json({ message: "Data stored", id: fields.id });
              })
              .catch(function (err) {
                response.status(500).json({ error: err });
              });
          } else {
            console.log(err);
          }
        }
      );
    });

    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(request.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, "/tmp/" + files.file.name);
    //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
    // });
  });
});
