const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const app = require('express')();

serviceAccount = require("C:/Users/milar/Downloads/friendr-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://friendr-5bde1.firebaseio.com"
});

const firebaseConfig = {
  apiKey: "AIzaSyBw5jw70KpTD7cjUy-v1R6w8lNAhkrWtYY",
  authDomain: "friendr-5bde1.firebaseapp.com",
  databaseURL: "https://friendr-5bde1.firebaseio.com",
  projectId: "friendr-5bde1",
  storageBucket: "friendr-5bde1.appspot.com",
  messagingSenderId: "127324395138",
  appId: "1:127324395138:web:7e600d65a1babef86c869b",
  measurementId: "G-ZHRLSY7T24"
};
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/', (req, res) => {
  return res.status(200).json({ message: "Good to go." })
})

app.get('/screams', (req, res) => {
  db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: new Date().toISOString()
        });
      });
      return res.json(screams);
    })

    .catch(err => {
      console.error(err);
    })
})

// Post new scream
app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };

  db
    .collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `Document ${doc.id} created successfully.` })
    })
    .catch(err => {
      res.status(500).json({ error: 'Something went wrong.' });
      // console.error(err);
    })
})

// Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  //TODO: Validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if (doc.exists) {
        // console.log(doc.exists)
        return res.status(400).json({ handle: 'This handle is already taken.' })
      } else {
        // console.log(doc.exists)
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      // console.log(idToken)
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      // console.log(userCredentials)
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      // console.error(err);
      if (err.code = 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use.' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    })
})

exports.api = functions.https.onRequest(app);