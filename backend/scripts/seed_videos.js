#!/usr/bin/env node
// ============================================
// Seed Videos to Firestore
// Usage: node scripts/seed_videos.js [--dry-run]
//
// Pushes the 4 default Mongolian history videos to Firestore.
// Safe to re-run — uses named doc IDs to avoid duplicates.
// ============================================

'use strict';

const { getFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');
getFirebaseAdmin();
const db = admin.firestore();

const isDryRun = process.argv.includes('--dry-run');

// ── Seed data matching VideoModel fields ──────────────────────
const videos = [
  {
    id: 'video_chinggis_khan',
    youtubeId: 'Yd3-a-HYkMg',
    title: 'Монголын Эзэнт Гүрэн: Чингис Хаан',
    subtitle: 'Дэлхийн хамгийн агуу эзэнт гүрний түүх',
    duration: '16:30',
    iconName: 'shield',
    accentHex: 'F4C84A',
    order: 1,
    isPublished: true,
    updatedBy: 'seed_script',
  },
  {
    id: 'video_military_tactics',
    youtubeId: 'ANrMdh-F4Fk',
    title: 'Чингис Хааны цэргийн тактик',
    subtitle: 'Монголын цэргийн стратегийн нууц',
    duration: '14:05',
    iconName: 'route',
    accentHex: '64B5F6',
    order: 2,
    isPublished: true,
    updatedBy: 'seed_script',
  },
  {
    id: 'video_nomadic_culture',
    youtubeId: 'fDAT98eEN5Q',
    title: 'Монголчуудын нүүдлийн соёл',
    subtitle: 'Тал нутгийн амьдралын хэв маяг',
    duration: '10:22',
    iconName: 'landscape',
    accentHex: '4ADE80',
    order: 3,
    isPublished: true,
    updatedBy: 'seed_script',
  },
  {
    id: 'video_silk_road',
    youtubeId: 'OeKYLsHSmHc',
    title: 'Торгоны замын түүх',
    subtitle: 'Дорно–Өрнийг холбосон худалдааны зам',
    duration: '12:47',
    iconName: 'swap_horiz',
    accentHex: 'FF9F43',
    order: 4,
    isPublished: true,
    updatedBy: 'seed_script',
  },
];

async function seed() {
  console.log(`\n🎬 Seeding ${videos.length} videos to Firestore${isDryRun ? ' (DRY RUN)' : ''}...\n`);

  const batch = db.batch();

  for (const video of videos) {
    const { id, ...data } = video;
    const ref = db.collection('videos').doc(id);

    const payload = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (isDryRun) {
      console.log(`[DRY] Would write videos/${id}:`, JSON.stringify(payload, null, 2));
    } else {
      batch.set(ref, payload, { merge: true });
    }
  }

  if (!isDryRun) {
    await batch.commit();
    console.log(`✅ Successfully written ${videos.length} video docs to Firestore.`);
  } else {
    console.log('\n✅ Dry run complete — no writes made.');
  }
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
