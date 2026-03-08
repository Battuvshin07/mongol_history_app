# Firestore Seeder — Setup & Usage Guide

Pushes data from MongoDB (or local JSON fixtures) into Firebase Firestore using the Admin SDK.

---

## Files Created / Modified

| File | Status | Description |
|---|---|---|
| `backend/src/firebase/firebaseAdmin.js` | **NEW** | Firebase Admin SDK singleton init |
| `backend/src/firebase/firestore.js` | **NEW** | Lazy Firestore `db` instance export |
| `backend/scripts/seed_firestore.js` | **NEW** | CLI seeder script |
| `backend/scripts/fixtures/README.md` | **NEW** | Fixture JSON format documentation |
| `backend/package.json` | modified | Added 3 `seed:firestore` npm scripts |
| `backend/.gitignore` | modified | Added `keys/` and `scripts/fixtures/*.json` |
| `backend/.env.example` | modified | Documented service account key placement |

---

## Step 1 — Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Project Settings**
2. Click the **Service accounts** tab
3. Click **Generate new private key** → confirm
4. A JSON file downloads (e.g. `historyapp-d1d66-firebase-adminsdk-xxx.json`)
5. Rename it to **`serviceAccountKey.json`**
6. Place it at:

```
backend/
  keys/
    serviceAccountKey.json   ← here
```

> ⚠️ **Never commit this file.** It is already gitignored via `keys/` in `.gitignore`.

---

## Step 2 — Configure `.env`

Make sure `backend/.env` contains your MongoDB connection string (if seeding from MongoDB):

```dotenv
MONGO_URI=mongodb://localhost:27017/mongol_history
```

If `MONGO_URI` is missing or MongoDB is unreachable, the seeder automatically falls back to JSON fixture files (see Step 4).

---

## Step 3 — Run the Seeder

From the `backend/` directory:

```bash
# Seed ALL collections from MongoDB (or fixtures fallback)
npm run seed:firestore

# Preview what would be written — no changes made
npm run seed:firestore:dry

# Clear existing Firestore docs first, then re-seed
npm run seed:firestore:clear
```

You can also run the script directly with extra options:

```bash
# Seed a single collection only
node scripts/seed_firestore.js --collection=persons

# Seed one collection in dry-run mode
node scripts/seed_firestore.js --collection=quizzes --dry-run

# Clear a single collection then re-seed it
node scripts/seed_firestore.js --collection=stories --clear
```

### Available CLI flags

| Flag | Description |
|---|---|
| `--collection=<name>` | Seed only the named collection |
| `--dry-run` | Print what would be written; skip all Firestore writes |
| `--clear` | Delete all existing docs in the target collection(s) before seeding |

### Valid collection names

```
 cultures  events  family_trees  persons
person_details  progresses  quizzes  stories
```

---

## Step 4 — Using JSON Fixtures (No MongoDB Required)

Place JSON files in `backend/scripts/fixtures/` named after the collection:

```
scripts/fixtures/
  persons.json
  quizzes.json
  stories.json
  ...
```

Each file must be an array of objects **or** a wrapper object with a `data` array:

```json
[
  {
    "_id": { "$oid": "507f1f77bcf86cd799439011" },
    "name": "Чингис Хаан",
    "birthYear": 1162,
    "createdAt": { "$date": "2024-01-01T00:00:00Z" }
  }
]
```

Supported `_id` formats:
- `{ "$oid": "..." }` — MongoDB Extended JSON
- `"507f1f77bcf86cd799439011"` — plain string
- *(omitted)* — Firestore auto-generates an ID

> Fixture JSON files are gitignored (`scripts/fixtures/*.json`).

---

## Document ID Strategy

Every Firestore document uses the MongoDB `_id` (as a string) as its Firestore document ID:

```
Firestore: /persons/507f1f77bcf86cd799439011
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                       = MongoDB _id.toString()
```

This makes the mapping **deterministic** — re-running the seeder updates the same documents rather than creating duplicates.

---

## Example Firestore Document

**Collection:** `persons`  
**Document ID:** `507f1f77bcf86cd799439011`

Mongoose source:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "__v": 0,
  "name": "Чингис Хаан",
  "birthYear": 1162,
  "deathYear": 1227,
  "description": "Монгол эзэнт гүрний үндэслэгч",
  "nationality": "Монгол",
  "role": "Их Хаан",
  "imageUrl": "https://example.com/chinggis.jpg",
  "tags": ["Хаан", "Цэрэг", "Улстөрч"],
  "isPublished": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-03-01T12:00:00Z"
}
```

Stored in Firestore (after conversion):
```json
{
  "name": "Чингис Хаан",
  "birthYear": 1162,
  "deathYear": 1227,
  "description": "Монгол эзэнт гүрний үндэслэгч",
  "nationality": "Монгол",
  "role": "Их Хаан",
  "imageUrl": "https://example.com/chinggis.jpg",
  "tags": ["Хаан", "Цэрэг", "Улстөрч"],
  "isPublished": true,
  "createdAt": { "_seconds": 1704067200, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1709294400, "_nanoseconds": 0 }
}
```

Note:
- `_id` and `__v` are **not** stored in the document body (they become the doc ID or are stripped)
- `createdAt` / `updatedAt` are converted to **Firestore Timestamps**
- Sensitive fields (`password`, `passwordHash`, `salt`) are always stripped

---

## Batch Write Details

- Firestore hard limit: **500 operations per batch**
- The seeder chunks documents into slices of 500 and commits each as an atomic batch
- Each batch uses `batch.set(ref, data, { merge: false })` — full overwrite (idempotent re-runs)
- The `--clear` flag deletes using loops of **400** docs per batch (leaves headroom for safety)

---

## Seeder Output Example

```
================================================
 🔥  Firestore Seeder
================================================

✔  MongoDB connected: mongodb://localhost:27017/mongol_history

▶  Seeding "persons"...
  ℹ  150 docs → 1 batch(es)
  ✔  Batch 1/1 committed (150 docs)
  ✅  "persons" done – 150 docs written.

▶  Seeding "quizzes"...
  ℹ  60 docs → 1 batch(es)
  ✔  Batch 1/1 committed (60 docs)
  ✅  "quizzes" done – 60 docs written.

...

🎉  Seeding complete in 4.2s
================================================
```

---

## Firestore Collection Mapping

| MongoDB Model | Firestore Collection |
|---|---|
| `Culture.model.js` | `cultures` |
| `Event.model.js` | `events` |
| `FamilyTree.model.js` | `family_trees` |
| `Person.model.js` | `persons` |
| `PersonDetail.model.js` | `person_details` |
| `Progress.model.js` | `progresses` |
| `Quiz.model.js` | `quizzes` |
| `Story.model.js` | `stories` |

---

## Using Firestore in Other Backend Files

Import the `getDb()` helper wherever you need Firestore access:

```js
const { getDb } = require('./src/firebase/firestore');

async function getPersonFromFirestore(id) {
  const db = getDb();
  const snap = await db.collection('persons').doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}
```

---

## Assumptions

1. **Service account key path** is always `backend/keys/serviceAccountKey.json` (relative to the backend root). Change `__dirname` resolution in `firebaseAdmin.js` if needed.
2. **MongoDB models** are assumed to use Mongoose's default `_id` (ObjectId). String IDs also work.
3. **Dates** — only JS `Date` instances are converted to Firestore Timestamps. ISO strings are stored as plain strings (consistent with how Mongoose `lean()` returns them for non-Date fields).
4. **`merge: false`** — each seeder run fully overwrites existing documents. This means field deletions in MongoDB will propagate to Firestore on the next seed (no ghost fields). If you prefer additive updates, change to `{ merge: true }`.
5. **`progresses` collection** stores user progress records as-is. No anonymisation is applied — do not expose this collection via Firestore rules to users other than the document owner.
6. **`Story.subtitle`** — the Flutter data model (`story_model.dart`) has a `subtitle` field that the backend `Story.model.js` does not yet define. The seeder will not error, but `subtitle` will only appear in documents seeded from fixtures that include it.
7. **`firebase-admin`** is installed as a **production** dependency (`--save`). If you prefer it as a dev/script-only tool, move it to `devDependencies`.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Firebase service account key not found` | `keys/serviceAccountKey.json` missing | Download from Firebase Console (see Step 1) |
| `MONGO_URI not set` warning | `.env` missing or no `MONGO_URI` key | Add to `.env`, or use fixture JSON files |
| `MongoDB connection failed` warning | MongoDB not running | Start MongoDB, or use `--dry-run` with fixture fallback |
| `Unknown collection: "foo"` | Typo in `--collection=` value | Use one of the valid names listed above |
| Firestore permission denied | Security rules blocking write | Current open rules expire `2026-03-30` — write proper rules before then |
| Batch size error | More than 500 ops in one batch | Already handled — seeder chunks at 500 |
