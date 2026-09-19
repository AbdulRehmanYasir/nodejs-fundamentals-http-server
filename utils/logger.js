// utils/logger.js
// Demonstrates the "events" core module.
// Instead of calling console.log directly all over the codebase, the server
// emits a "request" event whenever it handles a request, and this module
// just happens to be one of the things listening for it. That decoupling
// (emit here, react over there) is the whole point of EventEmitter.

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

class Logger extends EventEmitter {}

const logger = new Logger();
const logFilePath = path.join(__dirname, '..', 'data', 'access.log');

// Listener #1: print a readable line to the console.
logger.on('request', ({ method, url, statusCode, durationMs }) => {
  console.log(`[${new Date().toISOString()}] ${method} ${url} -> ${statusCode} (${durationMs}ms)`);
});

// Listener #2: append the same event to a log file, using a write stream
// in "append" mode. This is the streams module doing I/O without loading
// the whole file into memory.
const accessLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });

logger.on('request', ({ method, url, statusCode, durationMs }) => {
  const line = `${new Date().toISOString()} ${method} ${url} ${statusCode} ${durationMs}ms\n`;
  accessLogStream.write(line);
});

// EventEmitters can have more than one listener per event, and Node calls
// them in the order they were registered - both fire above for every
// single "request" event.

module.exports = logger;
