// ============================================
// Firestore DB Instance
// ============================================
// Call getFirebaseAdmin() first to ensure the app is initialized,
// then get the Firestore instance.
// ============================================

const { getFirebaseAdmin, admin } = require('./firebaseAdmin');

let _db;

function getDb() {
  if (!_db) {
    getFirebaseAdmin(); // ensures app is initialized
    _db = admin.firestore();
  }
  return _db;
}

module.exports = { getDb };
