#!/usr/bin/env node
// ============================================================
// Migration: progress subcollection-оос storiesCompleted тоолж update хий
//
// users/{uid}/progress дотор studied == true байгаа doc-уудыг тоолж
// users/{uid}.storiesCompleted-д бичнэ.
//
// Usage:
//   node scripts/migrate_sync_stories_completed.js           (бодит)
//   node scripts/migrate_sync_stories_completed.js --dry-run (хуурамч)
// ============================================================

'use strict';

const { getFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');
getFirebaseAdmin();
const db = admin.firestore();

const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log(`\n${isDryRun ? '[DRY-RUN] ' : ''}Migration эхэллээ...`);
  console.log('progress.studied == true тоолж storiesCompleted шинэчилнэ.\n');

  const usersSnap = await db.collection('users').get();
  if (usersSnap.empty) {
    console.log('users collection хоосон байна.');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const currentCount = userDoc.data().storiesCompleted ?? 0;

    // progress subcollection-оос studied == true тоол
    const progressSnap = await db
      .collection('users')
      .doc(uid)
      .collection('progress')
      .where('studied', '==', true)
      .get();

    const realCount = progressSnap.size;

    if (realCount === currentCount) {
      console.log(`  [ok]     uid=${uid} | storiesCompleted=${currentCount} (өөрчлөлт хэрэггүй)`);
      skipped++;
      continue;
    }

    console.log(
      `  ${isDryRun ? '[skip]  ' : '[update]'} uid=${uid} | ${currentCount} → ${realCount} (${realCount - currentCount > 0 ? '+' : ''}${realCount - currentCount})`
    );

    if (!isDryRun) {
      await db.collection('users').doc(uid).update({
        storiesCompleted: realCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    updated++;
  }

  console.log(`\nДүн:`);
  console.log(`  Нийт хэрэглэгч    : ${usersSnap.size}`);
  console.log(`  Шинэчлэгдсэн      : ${updated}`);
  console.log(`  Өөрчлөлтгүй       : ${skipped}`);
  if (isDryRun) console.log('\n[DRY-RUN] Бодит өөрчлөлт хийгдсэнгүй.');
  console.log('\nDone.\n');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration алдаа:', err);
  process.exit(1);
});
