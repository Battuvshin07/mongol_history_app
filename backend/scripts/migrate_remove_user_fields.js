#!/usr/bin/env node
// ============================================================
// Migration: users collection-оос хэрэггүй талбаруудыг устга
//
// Устгах талбарууд: bio, darkMode, quizzesCompleted
//
// Usage:
//   node scripts/migrate_remove_user_fields.js           (бодит)
//   node scripts/migrate_remove_user_fields.js --dry-run (хуурамч)
// ============================================================

'use strict';

const { getFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');
getFirebaseAdmin();
const db = admin.firestore();

const FIELDS_TO_REMOVE = ['bio', 'darkMode', 'quizzesCompleted'];
const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log(`\n${isDryRun ? '[DRY-RUN] ' : ''}Migration эхэллээ...`);
  console.log(`Устгах талбарууд: ${FIELDS_TO_REMOVE.join(', ')}\n`);

  const snapshot = await db.collection('users').get();
  if (snapshot.empty) {
    console.log('users collection хоосон байна.');
    return;
  }

  const deleteValue = admin.firestore.FieldValue.delete();
  let updated = 0;
  let skipped = 0;

  // Batch write (max 500 docs per batch)
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const hasFields = FIELDS_TO_REMOVE.some((f) => f in data);

    if (!hasFields) {
      skipped++;
      continue;
    }

    const update = {};
    for (const field of FIELDS_TO_REMOVE) {
      if (field in data) {
        update[field] = deleteValue;
      }
    }

    console.log(`  ${isDryRun ? '[skip] ' : '[update] '}uid=${doc.id} | устгах: ${Object.keys(update).join(', ')}`);

    if (!isDryRun) {
      batch.update(doc.ref, update);
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    updated++;
  }

  // Flush remaining
  if (!isDryRun && batchCount > 0) {
    await batch.commit();
  }

  console.log(`\nДүн:`);
  console.log(`  Нийт хэрэглэгч : ${snapshot.size}`);
  console.log(`  Шинэчлэгдсэн   : ${updated}`);
  console.log(`  Алгасагдсан    : ${skipped} (талбар байхгүй)`);
  if (isDryRun) console.log('\n[DRY-RUN] Бодит өөрчлөлт хийгдсэнгүй.');
  console.log('\nDone.\n');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration алдаа:', err);
  process.exit(1);
});
