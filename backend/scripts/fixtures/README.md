# Fixture Files (JSON Fallback)

Place JSON fixture files here when MongoDB is unavailable.
File names must match collection names exactly:

- `cultures.json`
- `events.json`
- `family_trees.json`
- `persons.json`
- `person_details.json`
- `progresses.json`
- `quizzes.json`
- `stories.json`

## Format

Each file must be either:

```json
[
  { "_id": "64f...", "title": "...", "createdAt": "2024-01-01T00:00:00Z" }
]
```

or wrapped:

```json
{
  "data": [
    { "_id": "64f...", "title": "..." }
  ]
}
```

MongoDB Extended JSON `{ "$oid": "..." }` is also accepted for `_id`.

Dates in ISO string format (`"2024-01-01T00:00:00Z"`) will be automatically converted to Firestore Timestamps.
