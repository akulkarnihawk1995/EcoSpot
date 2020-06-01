const functions = require("firebase-functions");

// Your web app's Firebase configuration
const app = require("express")();
const FBAuth = require("./util/FBAuth");

const { db } = require("./util/admin");

//get all screams
const {
  getScreams,
  createScream,
  getScreamsbyId,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/getScreams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

//scream routes
app.get("/getScreams", getScreams);
app.post("/createScream", FBAuth, createScream);
app.get("/getScreams/:screamId", getScreamsbyId);
app.delete("/getScreams/:screamId", FBAuth, deleteScream);
app.get("/getScreams/:screamId/like", FBAuth, likeScream);
app.get("/getScreams/:screamId/unlike", FBAuth, unlikeScream);
app.post("/getScreams/:screamId/comment", FBAuth, commentOnScream);

//users route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("us-central1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userhandle,
            sender: snapshot.data().userhandle,
            read: false,
            screamId: doc.id,
            type: "like",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

exports.deleteNotificationOnUnLike = functions
  .region("us-central1")
  .firestore.document("/likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
  });

exports.createNotificationOnComment = functions
  .region("us-central1")
  .firestore.document("/comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userhandle,
            sender: snapshot.data().userhandle,
            read: false,
            screamId: doc.id,
            type: "comment",
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
  });