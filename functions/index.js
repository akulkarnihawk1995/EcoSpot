const functions = require('firebase-functions');

// Your web app's Firebase configuration
const app = require('express')();
const FBAuth = require('./util/FBAuth');


//get all screams
const {getScreams, createScream, getScreamsbyId, commentOnScream,likeScream,unlikeScream,deleteScream} = require('./handlers/getScreams');
const {signup, login,uploadImage, addUserDetails,getAuthenticatedUser} = require('./handlers/users');

//scream routes
app.get('/getScreams',getScreams);
app.post('/createScream',FBAuth,createScream);
app.get('/getScreams/:screamId',getScreamsbyId);
app.delete('/getScreams/:screamId',FBAuth,deleteScream);
app.get('/getScreams/:screamId/like',FBAuth,likeScream);
app.get('/getScreams/:screamId/unlike',FBAuth,unlikeScream);
app.post('/getScreams/:screamId/comment',FBAuth,commentOnScream);

//users route
app.post('/signup',signup);
app.post('/login',login);
app.post('/user/image',FBAuth,uploadImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user',FBAuth,getAuthenticatedUser);



exports.api = functions.https.onRequest(app);