const config = require('./util/config.js');
const admin = require('firebase-admin');
const firebase = require('firebase');
firebase.initializeApp(config);

const serviceAccount = require("C:/Users/milar/Downloads/friendr-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://friendr-5bde1.firebaseio.com"
});

// MIDDLEWARE //
const FBAuth = require('./util/fbAuth.js');

const app = require('express')();
// Sanity Check
app.get('/', (req, res) => res.status(200).json({ message: "Good to go." }));

// Route Handlers
const { 
  getAllScreams, 
  postOneScream,
  getScream,
  commentOnScream
} = require('./handlers/screams.js');
const { 
  signup, 
  login, 
  uploadImage, 
  addUserDetails,
  getAuthenticatedUser 
} = require('./handlers/users.js');

// Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
// TODO: delete scream
// TODO: like a scream
// TODO: unlike a scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);


// SignUp/Login Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

const functions = require('firebase-functions');
exports.api = functions.https.onRequest(app);