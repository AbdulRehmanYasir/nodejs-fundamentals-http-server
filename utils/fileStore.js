// utils/fileStore.js
// Demonstrates the "fs" module (promise-based API) for reading and writing
// a JSON file that acts as a tiny flat-file database for notes.

const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'notes.json');

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // File doesn't exist yet - create it with an empty array.
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

async function readNotes() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

async function writeNotes(notes) {
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2));
}

async function getAllNotes() {
  return readNotes();
}

async function getNoteById(id) {
  const notes = await readNotes();
  return notes.find((note) => note.id === id);
}

async function createNote({ title, body }) {
  const notes = await readNotes();
  const note = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    body,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  await writeNotes(notes);
  return note;
}

async function deleteNote(id) {
  const notes = await readNotes();
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  await writeNotes(notes);
  return true;
}

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
};
