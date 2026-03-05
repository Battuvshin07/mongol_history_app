#!/usr/bin/env node
// ============================================
// Firestore Seeder Script
// Usage: node scripts/seed_firestore.js [--collection=<name>] [--dry-run]
//
// Source: JSON fixture files in scripts/fixtures/<collection>.json
//
// Options:
//   --collection=<name>  Seed only this collection (e.g. --collection=persons)
//   --dry-run            Print what would be written without touching Firestore
//   --clear              Delete existing Firestore docs before seeding
// ============================================

'use strict';

const path = require('path');
const fs = require('fs');

// ── Firebase
const { getFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');
getFirebaseAdmin();
const db = admin.firestore();

// ── Parse CLI args
const args = process.argv.slice(2);
const targetCollection = (args.find((a) => a.startsWith('--collection=')) || '').replace('--collection=', '') || null;
const isDryRun = args.includes('--dry-run');
const clearFirst = args.includes('--clear');

// ──────────────────────────────────────────────────────────────────
//  SENSITIVE FIELDS STRIPPED FROM EVERY DOC
// ──────────────────────────────────────────────────────────────────
const STRIP_FIELDS = ['password', 'passwordHash', '__v', 'salt'];

// ──────────────────────────────────────────────────────────────────
//  COLLECTION LIST
// ──────────────────────────────────────────────────────────────────
// Fixture file = scripts/fixtures/<collection>.json
const COLLECTION_CONFIG = [
  { collection: 'contents' },
  { collection: 'cultures' },
  { collection: 'events' },
  { collection: 'family_tree' },
  { collection: 'persons' },
  { collection: 'person_details' },
  { collection: 'progresses' },
  { collection: 'quizzes' },
  { collection: 'stories' },
];

// ──────────────────────────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────────────────────────

/**
 * Recursively convert JS Date objects → Firestore Timestamp.
 * Leaves everything else intact.
 */
function convertDates(obj) {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Date) {
    return admin.firestore.Timestamp.fromDate(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  }

  if (typeof obj === 'object' && !(obj instanceof admin.firestore.Timestamp)) {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      out[key] = convertDates(value);
    }
    return out;
  }

  return obj;
}

/**
 * Strip sensitive and internal fields from a plain object.
 */
function sanitize(doc) {
  const obj = { ...doc };
  for (const field of STRIP_FIELDS) {
    delete obj[field];
  }
  return obj;
}

/**
 * Convert a Mongoose document to a plain Firestore-ready object.
 * - Uses _id.toString() as the document ID (returned separately).
 * - Converts Dates to Timestamps.
 * - Strips internal Mongoose fields.
 */
function toFirestoreDoc(mongoDoc) {
  // toObject() gives a plain JS object with virtuals and __v removed per schema config
  const plain = mongoDoc.toObject
    ? mongoDoc.toObject({ versionKey: false, virtuals: false })
    : { ...mongoDoc };

  const id = (plain._id || plain.id || '').toString();

  // Remove _id / id from the stored fields (they become the doc ID)
  delete plain._id;
  delete plain.id;
  delete plain.__v;

  const sanitized = sanitize(plain);
  const withTimestamps = convertDates(sanitized);

  return { id, data: withTimestamps };
}

/**
 * Write a batch of up to 500 {id, data} pairs to a Firestore collection.
 */
async function writeBatch(colName, docs, batchNum, totalBatches) {
  if (isDryRun) {
    console.log(`  [DRY-RUN] Batch ${batchNum}/${totalBatches} – would write ${docs.length} docs to "${colName}"`);
    if (docs.length > 0) {
      const sample = docs[0];
      console.log(`    Sample doc id: ${sample.id}`);
      console.log(`    Sample fields: ${Object.keys(sample.data).join(', ')}`);
    }
    return;
  }

  const batch = db.batch();
  for (const { id, data } of docs) {
    const ref = db.collection(colName).doc(id);
    batch.set(ref, data, { merge: false });
  }
  await batch.commit();
  console.log(`  ✔  Batch ${batchNum}/${totalBatches} committed (${docs.length} docs)`);
}

/**
 * Delete all documents in a Firestore collection in batches of 400.
 */
async function clearCollection(colName) {
  let deleted = 0;
  let snapshot;
  do {
    snapshot = await db.collection(colName).limit(400).get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snapshot.size;
    process.stdout.write(`  Clearing "${colName}": ${deleted} deleted...\r`);
  } while (!snapshot.empty);
  console.log(`  Cleared "${colName}": ${deleted} docs deleted.       `);
}

/**
 * Chunk an array into slices of `size`.
 */
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ──────────────────────────────────────────────────────────────────
//  LOAD DATA — fixture files only
// ──────────────────────────────────────────────────────────────────

/**
 * Load data for a collection from scripts/fixtures/<collection>.json
 * Returns an array of Firestore-ready {id, data} objects.
 */
function loadDocs(config) {
  const fixturePath = path.join(__dirname, 'fixtures', `${config.collection}.json`);
  if (!fs.existsSync(fixturePath)) {
    console.warn(`  ⚠  No fixture file: ${fixturePath} – skipping.`);
    return [];
  }

  const raw = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const arr = Array.isArray(raw) ? raw : raw.data || [];

  return arr.map((plain) => {
    let id = plain._id;
    if (id && typeof id === 'object' && id.$oid) id = id.$oid;
    if (!id) id = db.collection(config.collection).doc().id;
    const copy = { ...plain };
    delete copy._id;
    delete copy.__v;
    const sanitized = sanitize(copy);
    const withTs = convertDates(sanitized);
    return { id: String(id), data: withTs };
  });
}

// ──────────────────────────────────────────────────────────────────
//  SEED ONE COLLECTION
// ──────────────────────────────────────────────────────────────────

async function seedCollection(config) {
  const { collection } = config;
  console.log(`\n▶  Seeding "${collection}"...`);

  if (clearFirst) {
    await clearCollection(collection);
  }

  const docs = loadDocs(config);

  if (docs.length === 0) {
    console.log(`  ℹ  No documents found – collection skipped.`);
    return;
  }

  const BATCH_SIZE = 500;
  const batches = chunk(docs, BATCH_SIZE);
  console.log(`  ℹ  ${docs.length} docs → ${batches.length} batch(es)`);

  for (let i = 0; i < batches.length; i++) {
    await writeBatch(collection, batches[i], i + 1, batches.length);
  }

  console.log(`  ✅  "${collection}" done – ${docs.length} docs written.`);
}

// ──────────────────────────────────────────────────────────────────
//  ENTRY POINT
// ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n================================================');
  console.log(' 🔥  Firestore Seeder');
  console.log('================================================');
  if (isDryRun) console.log(' ⚠  DRY-RUN mode – no data will be written\n');
  if (clearFirst) console.log(' ⚠  --clear mode – existing docs will be deleted first\n');

  // Filter to requested collection or run all
  const toSeed = targetCollection
    ? COLLECTION_CONFIG.filter((c) => c.collection === targetCollection)
    : COLLECTION_CONFIG;

  if (toSeed.length === 0) {
    console.error(`\n❌  Unknown collection: "${targetCollection}"`);
    console.error(`   Valid names: ${COLLECTION_CONFIG.map((c) => c.collection).join(', ')}`);
    process.exit(1);
  }

  const start = Date.now();
  for (const config of toSeed) {
    await seedCollection(config);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🎉  Seeding complete in ${elapsed}s`);
  console.log('================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
