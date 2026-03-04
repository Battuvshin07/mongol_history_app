#!/usr/bin/env node
// ============================================
// Asset → Fixture Converter
// Reads flutter_app/assets/data/*.json and writes
// Firestore-ready fixture files to scripts/fixtures/
//
// Usage: node scripts/convert_assets.js
// ============================================

'use strict';

const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.resolve(__dirname, '../../flutter_app/assets/data');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

// Ensure fixtures dir exists
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

// ──────────────────────────────────────────────────────────────────
//  TRANSFORMERS — each returns an array of Firestore-ready objects
// ──────────────────────────────────────────────────────────────────

function transformPersons(raw) {
  return raw.map((p) => ({
    _id: `person_${p.person_id}`,
    name: p.name,
    birthDate: p.birth_date || null,
    deathDate: p.death_date || null,
    description: p.description || '',
    imageUrl: p.image_url || '',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function transformEvents(raw) {
  return raw.map((e) => ({
    _id: `event_${e.event_id}`,
    title: e.title,
    date: e.date || '',
    description: e.description || '',
    personId: e.person_id ? `person_${e.person_id}` : null,
    location: '',
    coverImageUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function transformCultures(raw) {
  return raw.map((c) => ({
    _id: `culture_${c.id}`,
    title: c.title,
    icon: c.icon || '',
    description: c.description || '',
    details: c.details || '',
    imageUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function transformQuizzes(raw) {
  return raw.map((q) => {
    // answers field is a JSON-encoded string in the asset file
    let answers = q.answers;
    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers);
      } catch {
        answers = [answers];
      }
    }

    return {
      _id: `quiz_${q.quiz_id}`,
      question: q.question,
      answers: answers,
      correctAnswer: q.correct_answer,
      // Build a structured options array with isCorrect flag for Firestore
      options: answers.map((text, idx) => ({
        text,
        isCorrect: idx === q.correct_answer,
      })),
      storyId: null,
      xpReward: 10,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

// ──────────────────────────────────────────────────────────────────
//  FILE MAPPING
// ──────────────────────────────────────────────────────────────────

const CONVERSIONS = [
  {
    src: 'persons.json',
    dest: 'persons.json',
    transform: transformPersons,
  },
  {
    src: 'events.json',
    dest: 'events.json',
    transform: transformEvents,
  },
  {
    src: 'culture.json',      // source file is singular
    dest: 'cultures.json',    // fixture must match collection name
    transform: transformCultures,
  },
  {
    src: 'quizzes.json',
    dest: 'quizzes.json',
    transform: transformQuizzes,
  },
];

// ──────────────────────────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────────────────────────

let total = 0;

for (const conv of CONVERSIONS) {
  const srcPath = path.join(ASSETS_DIR, conv.src);
  const destPath = path.join(FIXTURES_DIR, conv.dest);

  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠  Source not found, skipping: ${srcPath}`);
    continue;
  }

  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  const converted = conv.transform(raw);

  fs.writeFileSync(destPath, JSON.stringify(converted, null, 2), 'utf8');
  console.log(`✅  ${conv.src} → fixtures/${conv.dest}  (${converted.length} docs)`);
  total += converted.length;
}

console.log(`\n🎉  Done — ${total} total documents written to scripts/fixtures/`);
console.log('   Now run: npm run seed:firestore:dry');
