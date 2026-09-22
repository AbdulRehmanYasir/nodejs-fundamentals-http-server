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

    // Vercel body
    if (req.body) {
      try {
        if (typeof req.body === "string") {
          return resolve(JSON.parse(req.body));
        }

        return resolve(req.body);

      } catch (err) {
        return reject(err);
      }
    }


    // Local Node.js HTTP stream
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk.toString();
    });


    req.on("end", () => {
      if (!raw) {
        return resolve({});
      }

      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });


    req.on("error", reject);
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
      error: "Note not found",
    });
  }

  sendJson(res, 200, note);
}



async function handleCreate(req, res) {
  try {

    const { title, body } = await readRequestBody(req);


    if (!title || !body) {
      return sendJson(res, 400, {
        error: "title and body are required",
      });
    }


    const note = await createNote({
      title,
      body,
    });


    sendJson(res, 201, note);


  } catch (err) {

    console.error("Create note error:", err);

    sendJson(res, 400, {
      error: "Invalid JSON body",
    });

  }
}



async function handleDelete(req, res, id) {

  const deleted = await deleteNote(id);


  if (!deleted) {
    return sendJson(res, 404, {
      error: "Note not found",
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