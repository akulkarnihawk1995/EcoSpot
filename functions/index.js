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
  getUserDetail,
  markNotificationsRead,
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
app.get("/user/:handle", getUserDetail);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("us-central1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().userhandle != snapshot.data().userhandle) {
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
        if (doc.exists && doc.data().userhandle != snapshot.data().userhandle) {
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
      .catch((err) => {
        console.log(err);
      });
  });

//change Image Url on scream if User updates his scream
exports.onUserImageChange = functions
  .region("us-central1")
  .firestore.document("/users/{userId}")
  .onUpdate((change) => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("screams")
        .where("userhandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    }else{
      return true;
    }
  });

exports.onScreamDelete = functions
  .region("us-central1")
  .firestore.document("/screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("screamId", "==", screamId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db.collection("notifications").where("screamId", "==", screamId).get();
      }).then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      }).catch(err=>{
        console.log(err);
      })
  });
