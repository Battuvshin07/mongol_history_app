#!/usr/bin/env node
// ============================================
// Set coverImageUrl for each culture document
// using Wikimedia Commons public domain images.
// No Firebase Storage billing required.
//
// Usage: node scripts/set_culture_images.js
// ============================================

'use strict';

const { getFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');
getFirebaseAdmin();
const db = admin.firestore();

// Public domain / CC-licensed images from Wikimedia Commons
// keyed by culture order
const IMAGE_URLS = {
  1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Mongolian_ger.jpg/640px-Mongolian_ger.jpg',
  2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Genghis_Khan_on_horse.jpg/480px-Genghis_Khan_on_horse.jpg',
  3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Silk_route.jpg/640px-Silk_route.jpg',
  4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/AmarbayasgalantMonastery.jpg/640px-AmarbayasgalantMonastery.jpg',
  5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Uyghur_script.jpg/480px-Uyghur_script.jpg',
  6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Buuz.jpg/480px-Buuz.jpg',
};

async function run() {
  console.log('\n================================================');
  console.log(' 🖼   Culture Image URL Updater');
  console.log('================================================\n');

  const snap = await db
    .collection('cultures')
    .orderBy('order')
    .get();

  if (snap.empty) {
    console.error('❌ No culture documents found. Run seed_firestore.js first.');
    process.exit(1);
  }

  const batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    const order = doc.data().order;
    const url = IMAGE_URLS[order];
    if (!url) {
      console.warn(`  ⚠  No image mapping for order=${order}, skipping.`);
      continue;
    }
    batch.update(doc.ref, {
      coverImageUrl: url,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✏  order=${order}  →  ${url}`);
    count++;
  }

  await batch.commit();
  console.log(`\n✅  Updated ${count} culture documents.\n`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
