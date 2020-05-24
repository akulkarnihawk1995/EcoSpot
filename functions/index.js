const functions = require('firebase-functions');


// Your web app's Firebase configuration

const app = require('express')();
const FBAuth = require('./util/FBAuth');


//get all screams
const {getScreams, createScream} = require('./handlers/getScreams');
const {signup, login,uploadImage} = require('./handlers/users');

//scream routes
app.get('/getScreams',getScreams);
app.post('/createScream',FBAuth,createScream);

//users route
app.post('/signup',signup);
app.post('/login',login);
app.post('/user/image',FBAuth,uploadImage);



exports.api = functions.https.onRequest(app);