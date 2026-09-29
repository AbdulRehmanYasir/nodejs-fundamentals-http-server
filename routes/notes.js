
// routes/notes.js
// Plain request handlers - no framework, just functions that take
// (req, res) and use the fileStore for persistence.

const {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
} = require('../utils/fileStore');

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });

  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    // 1. Check if req.body was pre-parsed by the runtime/platform.
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'object') {
        return resolve(req.body);
      }

      if (typeof req.body === 'string') {
        try {
          return resolve(req.body ? JSON.parse(req.body) : {});
        } catch (err) {
          return reject(err);
        }
      }

      if (Buffer.isBuffer(req.body)) {
        try {
          const str = req.body.toString('utf8');
          return resolve(str ? JSON.parse(str) : {});
        } catch (err) {
          return reject(err);
        }
      }
    }

    // 2. Standard Node.js IncomingMessage stream parsing.
    let raw = '';

    req.on('data', (chunk) => {
      if (typeof chunk === 'string') {
        raw += chunk;
      } else if (Buffer.isBuffer(chunk)) {
        raw += chunk.toString('utf8');
      }
    });

    req.on('end', () => {
      if (!raw) {
        return resolve({});
      }

      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', reject);
  });
}

async function handleGetAll(req, res) {
  const notes = await getAllNotes();
  sendJson(res, 200, notes);
}

async function handleGetOne(req, res, id) {
  const note = await getNoteById(id);

  if (!note) {
    return sendJson(res, 404, {
      error: 'Note not found',
    });
  }

  sendJson(res, 200, note);
}

async function handleCreate(req, res) {
  let parsedBody;
  try {
    parsedBody = await readRequestBody(req);
  } catch (err) {
    console.error('Body parse error:', err);
    return sendJson(res, 400, {
      error: 'Invalid JSON body',
      details: err.message,
    });
  }

  const { title, body } = parsedBody || {};

  if (!title || !body) {
    return sendJson(res, 400, {
      error: 'title and body are required',
    });
  }

  try {
    const note = await createNote({
      title,
      body,
    });

    return sendJson(res, 201, note);
  } catch (err) {
    console.error('Create note storage error:', err);

    return sendJson(res, 500, {
      error: 'Failed to create note',
      details: err.message || 'Internal server error',
    });
  }
}

async function handleDelete(req, res, id) {
  const deleted = await deleteNote(id);

  if (!deleted) {
    return sendJson(res, 404, {
      error: 'Note not found',
    });
  }

  res.writeHead(204);
  res.end();
}

module.exports = {
  handleGetAll,
  handleGetOne,
  handleCreate,
  handleDelete,
};

