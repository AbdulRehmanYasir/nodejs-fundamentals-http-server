// utils/seed.js
// Run with: npm run seed
// Demonstrates a one-off fs write - resets data/notes.json with sample data.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'notes.json');

const sampleNotes = [
  {
    id: 'seed1',
    title: 'Welcome',
    body: 'This note was written by the seed script using fs.writeFileSync.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed2',
    title: 'Event loop',
    body: 'Hit GET /api/event-loop-demo and watch the server console.',
    createdAt: new Date().toISOString(),
  },
];

fs.writeFileSync(DATA_FILE, JSON.stringify(sampleNotes, null, 2));
console.log(`Seeded ${sampleNotes.length} notes into ${DATA_FILE}`);
