# Node.js Fundamentals HTTP Server

A basic HTTP server built entirely on Node's core modules — no Express, no
dependencies. Covers: the `http` module, `fs`, `events`, `stream`, and
`npm`/`package.json` scripts.

## Project structure

```
node-fundamentals-http-server/
├── server.js           # http.createServer + routing
├── routes/
│   └── notes.js        # request handlers for /api/notes
├── utils/
│   ├── fileStore.js     # fs-based JSON "database"
│   ├── logger.js         # EventEmitter-based request logger
│   └── seed.js           # one-off fs write script (npm run seed)
├── public/
│   └── index.html        # served for GET /
├── data/
│   └── notes.json        # persisted notes (created/updated via fs)
└── package.json
```

## Setup

```bash
npm install    # no external deps, but this creates package-lock.json
npm start      # node server.js
# or, for auto-restart on save (Node 18.11+):
npm run dev
```

Visit `http://localhost:3000/`.

## API

| Method | Path                    | Description                          |
|--------|--------------------------|---------------------------------------|
| GET    | `/api/notes`             | List all notes                        |
| POST   | `/api/notes`             | Create a note — body: `{ "title", "body" }` |
| GET    | `/api/notes/:id`         | Get one note                          |
| DELETE | `/api/notes/:id`         | Delete a note                         |
| GET    | `/api/event-loop-demo`   | Triggers callback-ordering demo (see server console) |
| GET    | `/api/download-log`      | Streams `data/access.log` as a file download |

Example:

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"First note","body":"Hello Node"}'

curl http://localhost:3000/api/notes
```

## npm scripts

- `npm start` — runs `node server.js`
- `npm run dev` — runs the server with `--watch` so it restarts on file changes
- `npm run seed` — overwrites `data/notes.json` with sample data via `fs.writeFileSync`

These live in `package.json` under `"scripts"`, which is npm's mechanism for
naming shell commands so the whole team runs them the same way instead of
memorizing raw `node` invocations.

## Explaining the event loop

Node.js runs JavaScript on a single thread, but I/O (file access, network
requests, timers) doesn't block that thread — it's handed off to the
system (via libuv's thread pool or OS-level async APIs), and the **event
loop** is what checks in on that offloaded work and runs your callbacks
once it's done.

Each pass of the event loop moves through a fixed set of phases:

1. **Timers** — runs callbacks scheduled by `setTimeout`/`setInterval` whose
   time has elapsed.
2. **Pending callbacks** — some system-level callbacks deferred from the
   previous cycle.
3. **Poll** — retrieves new I/O events (e.g. `fs.readFile` completing) and
   runs their callbacks; this is where the loop spends most of its time.
4. **Check** — runs `setImmediate` callbacks.
5. **Close callbacks** — e.g. `socket.on('close', ...)`.

Two things run *between* every phase, not as a phase themselves:

- **`process.nextTick` callbacks** — always run first, before anything else,
  even before promises.
- **Microtasks** (resolved Promises, `async`/`await` continuations) — run
  right after `nextTick`, still before the loop moves to the next phase.

So for the same tick, the rough order is: synchronous code → `nextTick`
queue → microtask (Promise) queue → timers → poll (I/O) → check
(`setImmediate`) → close callbacks → repeat.

This is exactly what `GET /api/event-loop-demo` demonstrates: it logs
synchronous code immediately, then queues a `nextTick`, a Promise
microtask, a `setTimeout`, an `fs.readFile`, and a `setImmediate` — and the
server console shows them resolving in that order, not the order they were
written in.

**Why it matters in this project:** every route handler here is
non-blocking. `fs/promises` in `fileStore.js` and `fs.createReadStream` in
`server.js` never freeze the whole server while a file is being read —
other incoming requests keep being accepted and handled concurrently on
the same thread, because the actual disk I/O happens off-thread and the
event loop just picks up the result when it's ready.

## Streams

- **Static files and the log download** are served with
  `fs.createReadStream(...).pipe(res)` instead of `fs.readFile` +
  `res.end`. This keeps memory usage flat regardless of file size, since
  only one chunk is buffered at a time.
- **Incoming request bodies** are also streams — `readRequestBody` in
  `routes/notes.js` listens for `data` and `end` events on `req` to
  manually assemble the JSON body, which is what frameworks like Express
  do for you under the hood via `body-parser`.

## Events

`utils/logger.js` defines a custom `EventEmitter`. `server.js` emits a
single `"request"` event per request (once the response has finished),
and two independent listeners react to it: one prints to the console, the
other appends a line to `data/access.log` via a write stream. Neither
listener knows about the other — that decoupling is the reason
`EventEmitter` exists.
