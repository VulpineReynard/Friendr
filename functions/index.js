const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const app = require('express')();
admin.initializeApp();

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

app.get('/screams', (req, res) => {
  admin
    .firestore()
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

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };

  admin.firestore().collection('screams').add(newScream)
    .then(doc => {
      res.json({ message: `Document ${doc.id} created successfully.` })
    })
    .catch(err => {
      res.status(500).json({ error: 'Something went wrong.' });
      console.error(err);
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

  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res.status(201).json({ message: `User ${data.user.uid} signed up successfully.` })
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    })
})

exports.api = functions.https.onRequest(app);