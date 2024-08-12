const admin = require("firebase-admin");

const serviceAccount = require("./chat-app-95ba0-firebase-adminsdk-ljugr-5d7be01990.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

module.exports = { admin, firestore };
