#!/usr/bin/env node
// ============================================
// Upload culture images to Firebase Storage
// and update coverImageUrl in Firestore.
//
// Usage: node scripts/upload_culture_images.js
// ============================================

'use strict';

const path = require('path');
const fs = require('fs');

const { getFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');
getFirebaseAdmin();

const db = admin.firestore();
const bucket = admin.storage().bucket('historyapp-d1d66.firebasestorage.app');

// Map culture order → local image file (relative to flutter_app/assets/images)
const IMAGES_DIR = path.resolve(
  __dirname,
  '../../flutter_app/assets/images'
);

const IMAGE_MAP = [
  { order: 1, file: 'pic_1.png' },   // Нүүдлийн соёл
  { order: 2, file: 'pic_2.png' },   // Цэргийн зохион байгуулалт
  { order: 3, file: 'pic_3.png' },   // Торгоны зам
  { order: 4, file: 'logo_1.png' },  // Шашин шүтлэг
  { order: 5, file: 'logo_2.png' },  // Бичиг үсэг
  { order: 6, file: 'logo_3.png' },  // Хоол, ундаа
];

async function uploadImage(localFile, destPath) {
  const [file] = await bucket.upload(localFile, {
    destination: destPath,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  // Make publicly readable
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
}

async function run() {
  console.log('\n================================================');
  console.log(' 🖼   Culture Image Uploader');
  console.log('================================================\n');

  // Load all culture docs from Firestore, keyed by order
  const snap = await db.collection('cultures').orderBy('order').get();
  const docs = snap.docs;

  if (docs.length === 0) {
    console.error('❌ No culture documents found in Firestore. Run seed first.');
    process.exit(1);
  }

  for (const entry of IMAGE_MAP) {
    const localPath = path.join(IMAGES_DIR, entry.file);

    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠  File not found, skipping: ${localPath}`);
      continue;
    }

    // Find the matching Firestore doc by order field
    const doc = docs.find((d) => d.data().order === entry.order);
    if (!doc) {
      console.warn(`  ⚠  No culture doc with order=${entry.order}, skipping.`);
      continue;
    }

    const storagePath = `cultures/${entry.file}`;
    process.stdout.write(
      `  ↑  Uploading "${entry.file}" → ${storagePath} ... `
    );

    try {
      const url = await uploadImage(localPath, storagePath);
      await db.collection('cultures').doc(doc.id).update({
        coverImageUrl: url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅');
      console.log(`     URL: ${url}`);
    } catch (err) {
      console.log('❌');
      console.error(`     Error: ${err.message}`);
    }
  }

  console.log('\n🎉  Done.\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
