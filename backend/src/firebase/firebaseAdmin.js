// ============================================
// Firebase Admin SDK Initialization
// ============================================
// Uses service account key stored at keys/serviceAccountKey.json
// This file must NEVER be committed to version control.
// ============================================

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let app;

function getFirebaseAdmin() {
  if (app) return app;

  const keyPath = path.resolve(__dirname, '../../keys/serviceAccountKey.json');

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Firebase service account key not found at: ${keyPath}\n` +
        'Download it from Firebase Console → Project Settings → Service Accounts → Generate new private key\n' +
        'Place it at: backend/keys/serviceAccountKey.json'
    );
  }

  const serviceAccount = require(keyPath);

  if (admin.apps.length === 0) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    app = admin.apps[0];
  }

  return app;
}

module.exports = { getFirebaseAdmin, admin };
