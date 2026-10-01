<div align="center">

# 🚀 NODE.JS FUNDAMENTALS HTTP SERVER

### Core Node.js HTTP & REST API Project

A Node.js HTTP server built from scratch using **Node.js core modules**, without Express or any web framework.

The project demonstrates HTTP server creation, REST API development, JSON request handling, file operations, streams, events, the Node.js event loop, and deployment to Vercel.

**Build. Understand. Debug. Deploy.**

</div>

---

## 📌 About

**Node.js Fundamentals HTTP Server** is a backend project built as part of my **Node.js Fundamentals learning track**.

The project focuses on understanding Node.js at the core level by building an HTTP server using native Node.js modules instead of relying on frameworks such as Express.

It provides a REST-style Notes API with CRUD operations, file-based data storage, request-body parsing, event-loop demonstrations, access logging, and streamed file downloads.

The application was developed and tested locally and then deployed to **Vercel**.

---

## ✨ Features

* 🚀 HTTP server built with Node.js `http` module
* 📝 Notes REST API
* ➕ Create notes
* 📖 Read all notes
* 🔎 Read a note by ID
* 🗑️ Delete notes
* 📦 JSON request & response handling
* 📂 File-based data storage
* 📄 Access logging
* 🌊 Node.js streams
* 🔄 Request-body stream handling
* ⚡ Node.js event-loop demonstration
* 🛡️ Error handling & validation
* 🔧 Core Node.js modules
* ☁️ Vercel deployment
* 🧪 Local & production API testing

---

## 🔄 Application Flow

```text
HTTP Request
      ↓
Node.js HTTP Server
      ↓
URL & Method Routing
      ↓
Request Body Handling
      ↓
Route Handler
      ↓
File Storage
      ↓
JSON Response
      ↓
Client
```

For a note creation request:

```text
POST /api/notes
      ↓
Parse JSON Body
      ↓
Validate title & body
      ↓
Create Note
      ↓
Write to JSON Storage
      ↓
Return 201 Created
```

---

## 🏗 Project Structure

```text
nodejs-fundamentals-http-server/
│
├── data/
│   ├── notes.json
│   └── access.log
│
├── public/
│   └── index.html
│
├── routes/
│   └── notes.js
│
├── utils/
│   ├── fileStore.js
│   └── logger.js
│
├── server.js
├── server.ts
├── package.json
├── package-lock.json
└── README.md
```

---

## 🛠 Tech Stack

| Technology           | Usage                       |
| -------------------- | --------------------------- |
| Node.js              | Backend runtime             |
| `http`               | HTTP server                 |
| `fs` / `fs/promises` | File operations             |
| `path`               | File path handling          |
| `url`                | URL parsing                 |
| `events`             | Event-driven programming    |
| `stream`             | Stream-based data handling  |
| JSON                 | Data storage & API format   |
| npm                  | Project & script management |
| Vercel               | Deployment                  |

No Express or backend framework is used.

---

## 📡 API

### Notes

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/api/notes`     | Get all notes       |
| POST   | `/api/notes`     | Create a new note   |
| GET    | `/api/notes/:id` | Get a specific note |
| DELETE | `/api/notes/:id` | Delete a note       |

### Event Loop

| Method | Endpoint               | Description                              |
| ------ | ---------------------- | ---------------------------------------- |
| GET    | `/api/event-loop-demo` | Demonstrates Node.js event-loop behavior |

### Logs

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/download-log` | Download the server access log |

---

## 📝 Create a Note

Send a `POST` request to:

```text
/api/notes
```

with:

```json
{
  "title": "My First Note",
  "body": "Learning Node.js fundamentals"
}
```

Successful requests return:

```text
201 Created
```

with the newly created note.

---

## 🧠 Node.js Event Loop

The project includes an endpoint specifically designed to demonstrate how Node.js handles asynchronous operations.

It explores the relationship between:

```text
JavaScript Execution
        ↓
Call Stack
        ↓
Asynchronous Operations
        ↓
Callbacks / Tasks
        ↓
Event Loop
        ↓
Call Stack
```

This helped me understand why asynchronous Node.js operations do not necessarily execute in the same order in which they are written.

---

## 📂 File System

The project uses Node's filesystem APIs to manage application data.

Local development uses:

```text
data/notes.json
```

for note storage.

The application performs asynchronous operations for:

* Reading notes
* Creating notes
* Updating notes
* Deleting notes
* Reading log files
* Writing log data

This provides practical experience with Node.js file I/O.

---

## 🌊 Streams

Node.js streams are used for handling data incrementally.

The project demonstrates streams through:

* HTTP request-body handling
* File downloading
* Access-log processing

Instead of always loading an entire file into memory, the application can stream file data directly through the HTTP response.

---

## 🛡️ Error Handling

The API handles different types of errors separately.

Examples include:

```text
400 Bad Request
```

for invalid JSON or missing required fields.

```text
404 Not Found
```

when a requested note does not exist.

```text
500 Internal Server Error
```

for unexpected server-side failures.

The application also provides useful error information during development instead of incorrectly reporting every failure as an invalid JSON request.

---

## ☁️ Vercel Deployment

The project is deployed as a Node.js application on Vercel.

```text
Client
   ↓
Vercel
   ↓
Node.js HTTP Server
   ↓
REST API
   ↓
File Storage
```

A deployment-specific storage layer was added because Vercel's deployed filesystem is not writable like a normal local filesystem.

On Vercel, runtime note data is stored in temporary storage while the local development environment continues using:

```text
data/notes.json
```

---

## 🐛 Deployment Challenge

One of the main challenges was handling POST requests after deploying to Vercel.

Initially, valid JSON requests were returning:

```json
{
  "error": "Invalid JSON body"
}
```

The issue was caused by differences between a normal Node.js HTTP request stream and the request body provided by the Vercel runtime.

The request-body parser was updated to support both:

```text
Normal Node.js HTTP stream
        +
Pre-parsed request body
```

Error handling was also separated so JSON parsing errors, validation errors, and filesystem errors are handled independently.

This was an important lesson in understanding the difference between local Node.js execution and serverless deployment environments.

---

## ⚙️ Run Locally

Clone the repository:

```bash
git clone https://github.com/AbdulRehmanYasir/nodejs-fundamentals-http-server.git
```

Move into the project:

```bash
cd nodejs-fundamentals-http-server
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

The server runs locally at:

```text
http://localhost:3000
```

---

## 🧪 Testing

The application was tested both locally and on the deployed Vercel application.

### Local Tests

```text
GET /api/notes          → 200 OK
POST /api/notes         → 201 Created
GET /api/notes/:id      → 200 OK
DELETE /api/notes/:id   → 204 No Content
GET /api/event-loop-demo → 200 OK
GET /api/download-log   → 200 OK
```

### Vercel Tests

```text
GET /api/notes           → 200 OK
POST /api/notes          → 201 Created
GET /api/notes/:id       → 200 OK
DELETE /api/notes/:id    → 204 No Content
GET /api/event-loop-demo → 200 OK
```

Malformed JSON requests are also handled with an appropriate:

```text
400 Bad Request
```

response.

---

## 🎯 Learning Goals

The project was built around a simple progression:

```text
Understand Node.js
       ↓
Build an HTTP Server
       ↓
Handle Requests
       ↓
Work With Files
       ↓
Understand Streams
       ↓
Learn the Event Loop
       ↓
Build a REST API
       ↓
Debug Real Problems
       ↓
Deploy to Vercel
```

The main goal was to understand what happens underneath backend frameworks by building the HTTP server directly with Node.js core functionality.

---

## 📚 Key Learnings

Through this project, I gained practical experience with:

* Creating HTTP servers using the `http` module
* Handling HTTP methods and routes
* Working with request and response objects
* Parsing JSON request bodies
* Reading and writing files using `fs`
* Understanding asynchronous file operations
* Working with Node.js streams
* Understanding the event loop
* Using events and callbacks
* Managing projects with npm and `package.json`
* Handling server-side errors
* Debugging production-specific issues
* Deploying Node.js applications to Vercel

---

## 🌐 Project Links

**GitHub Repository**

https://github.com/AbdulRehmanYasir/nodejs-fundamentals-http-server

**Live API**

https://nodejs-fundamentals-http-server-plum.vercel.app

---

## 👨‍💻 Author

<div align="center">

### Abdul Rehman Yasir

**BS Artificial Intelligence Student | Developer**

Building real-world software & AI projects.

[GitHub](https://github.com/AbdulRehmanYasir)

</div>

---

<div align="center">

### 🚀 NODE.JS FUNDAMENTALS

**Build. Understand. Debug. Deploy.**

Built with Node.js Core Modules.

</div>
