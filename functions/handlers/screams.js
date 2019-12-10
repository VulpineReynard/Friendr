const { db, admin } = require('../util/admin.js');

exports.getAllScreams = (req, res) => {
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
}

exports.postOneScream = (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
}