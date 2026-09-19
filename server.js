// server.js
// A basic HTTP server built with only Node's core modules: http, fs, path,
// url, and events. No Express, no dependencies at all.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const logger = require('./utils/logger');
const notes = require('./routes/notes');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
};

function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Streams in action: instead of fs.readFile-ing the whole file into
  // memory and then writing it out, we pipe a read stream straight into
  // the response stream. For large files this keeps memory flat because
  // only one chunk at a time is ever held in memory.
  const stream = fs.createReadStream(filePath);

  stream.on('open', () => {
    res.writeHead(200, { 'Content-Type': contentType });
  });

  stream.on('error', () => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  stream.pipe(res);
}

function handleEventLoopDemo(req, res) {
  // Demonstrates ordering across the event loop's phases / microtasks:
  // synchronous code always runs first, then process.nextTick /
  // microtasks, then timers (setTimeout), then I/O callbacks, then
  // setImmediate (check phase). Watch the server console when you hit
  // this route - the response itself just explains what's happening.
  const order = [];
  order.push('1. synchronous code');

  process.nextTick(() => console.log('2. process.nextTick callback'));
  Promise.resolve().then(() => console.log('3. Promise microtask'));

  setTimeout(() => console.log('5. setTimeout (timers phase)'), 0);

  fs.readFile(__filename, () => {
    console.log('6. fs.readFile callback (poll phase)');
    setImmediate(() => console.log('7. setImmediate (check phase, queued from inside I/O)'));
  });

  setImmediate(() => console.log('4. setImmediate (check phase, queued from main script)'));

  console.log(order[0]);

  sendJson(res, 200, {
    message: 'Check the server console for the callback ordering. Sync code ran immediately; the rest fires on later event loop turns.',
    expectedRoughOrder: [
      'synchronous code',
      'process.nextTick callback',
      'Promise microtask',
      'setImmediate (queued from main script)',
      'setTimeout (timers phase)',
      'fs.readFile callback (poll phase)',
      'setImmediate (queued from inside I/O, runs right after its poll callback)',
    ],
  });
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const start = process.hrtime.bigint();
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Emit the "request" event once we know the final status code, by
  // hooking the response's "finish" event.
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.emit('request', {
      method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: durationMs.toFixed(2),
    });
  });

  try {
    // --- API routes ---
    if (pathname === '/api/notes' && method === 'GET') {
      return await notes.handleGetAll(req, res);
    }
    if (pathname === '/api/notes' && method === 'POST') {
      return await notes.handleCreate(req, res);
    }
    const noteMatch = pathname.match(/^\/api\/notes\/([^/]+)$/);
    if (noteMatch && method === 'GET') {
      return await notes.handleGetOne(req, res, noteMatch[1]);
    }
    if (noteMatch && method === 'DELETE') {
      return await notes.handleDelete(req, res, noteMatch[1]);
    }

    // --- fun/demo route ---
    if (pathname === '/api/event-loop-demo' && method === 'GET') {
      return handleEventLoopDemo(req, res);
    }

    // --- streamed file download ---
    if (pathname === '/api/download-log' && method === 'GET') {
      const logPath = path.join(__dirname, 'data', 'access.log');
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="access.log"',
      });
      const stream = fs.createReadStream(logPath);
      stream.on('error', () => sendJson(res, 404, { error: 'No log file yet - make a few requests first' }));
      return stream.pipe(res);
    }

    // --- static files (serves public/index.html at "/") ---
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(PUBLIC_DIR, filePath);

    // Guard against path traversal (e.g. /../server.js)
    if (!filePath.startsWith(PUBLIC_DIR)) {
      return sendJson(res, 400, { error: 'Invalid path' });
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        return sendJson(res, 404, { error: 'Not found' });
      }
      serveStaticFile(req, res, filePath);
    });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = server;
