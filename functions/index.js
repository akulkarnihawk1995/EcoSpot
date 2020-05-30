const functions = require('firebase-functions');

// Your web app's Firebase configuration
const app = require('express')();
const FBAuth = require('./util/FBAuth');


//get all screams
const {getScreams, createScream, getScreamsbyId, commentOnScream} = require('./handlers/getScreams');
const {signup, login,uploadImage, addUserDetails,getAuthenticatedUser} = require('./handlers/users');

//scream routes
app.get('/getScreams',getScreams);
app.post('/createScream',FBAuth,createScream);
app.get('/getScreams/:screamId',getScreamsbyId);
// TODO:deleting scream
// TODO:like a scream
// TODO: unliking a scream
app.post('/getScreams/:screamId/comment',FBAuth,commentOnScream);

//users route
app.post('/signup',signup);
app.post('/login',login);
app.post('/user/image',FBAuth,uploadImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user',FBAuth,getAuthenticatedUser);



exports.api = functions.https.onRequest(app);