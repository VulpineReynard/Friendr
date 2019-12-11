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
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', markNotificationsRead);

const functions = require('firebase-functions');
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
.onCreate((snapshot) => {
  return db.doc(`/screams/${snapshot.data().screamId}`).get()
  .then(doc => {
    if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
  .catch(err => {
    console.error(err);
  })
});

exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
.onDelete((snapshot) => {
  return db.doc(`/notifications/${snapshot.id}`)
  .delete()
  .catch(err => {
    console.error(err);
  })
})

exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
.onCreate((snapshot) => {
  return db.doc(`/screams/${snapshot.data().screamId}`).get()
  .then(doc => {
    if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
  .catch(err => {
    console.error(err);
  })
});

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
.onUpdate((change) => {
  if (change.before.data().imageUrl !== change.after.data().imageUrl) {
    let batch = db.batch();
    return db
      .collection('screams')
      .where('userHandle', '==', change.before.data().handle)
      .get()
      .then(data => {
        data.forEach(doc => {
          const scream = db.doc(`/screams/${doc.id}`)
          batch.update(scream, { userImage: change.after.data().imageUrl })
        })
      return db
        .collection('comments')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const comment = db.doc(`/comments/${doc.id}`)
            batch.update(comment, { userImage: change.after.data().imageUrl })
          })
          return batch.commit();
        })
    })
  } else return true;
});

exports.onScreamDelete = functions.firestore.document('/screams/{screamId}')
.onDelete((snapshot, context) => {
  const screamId = context.params.screamId;
  const batch = db.batch();
  return db
    .collection('comments')
    .where('screamId', '==', screamId)
    .get()
    // Delete comments from scream
    .then(data => {
      data.forEach(doc => {
        batch.delete(db.doc(`/comments/${doc.id}`));
      });
      return db.collection('likes').where('screamId', '==', screamId).get()
    })
    // Delete likes from scream
    .then(data => {
      data.forEach(doc => {
        batch.delete(db.doc(`/likes/${doc.id}`));
      });
      return db.collection('notifications').where('screamId', '==', screamId).get()
    })
    // Delete notifications from scream
    .then(data => {
      data.forEach(doc => {
        batch.delete(db.doc(`/notifications/${doc.id}`));
      });
      return batch.commit();
    })
    .catch(err => {
      console.error(err);
    })
})