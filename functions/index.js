const config = require('./util/config.js');
const admin = require('firebase-admin');
const firebase = require('firebase');
firebase.initializeApp(config);

const serviceAccount = require('./util/friendr-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://friendr-5bde1.firebaseio.com"
});

const { db } = require('./util/admin.js');

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
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
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
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);


// SignUp/Login Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

const functions = require('firebase-functions');
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
.onCreate((snapshot) => {
  db.doc(`/screams/${snapshot.data().screamId}`).get()
  .then(doc => {
    if (doc.exists) {
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'like',
        read: false,
        screamId: doc.id
      })
    }
  })
  .then(() => {
    return;
  })
  .catch(err => {
    console.error(err);
    return;
  })
});

exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
.onDelete((snapshot) => {
  db.doc(`/notifications/${snapshot.id}`)
  .delete()
  .then(() => {
    return;
  })
  .catch(err => {
    console.error(err);
    return;
  })
})

exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
.onCreate((snapshot) => {
  db.doc(`/screams/${snapshot.data().screamId}`).get()
  .then(doc => {
    if (doc.exists) {
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'comment',
        read: false,
        screamId: doc.id
      })
    }
  })
  .then(() => {
    return;
  })
  .catch(err => {
    console.error(err);
    return;
  })
})