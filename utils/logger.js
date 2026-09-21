// utils/logger.js
// Demonstrates the "events" core module.
// Locally, requests are also written to data/access.log.
// On Vercel, the deployed filesystem is read-only, so requests
// are logged to the console instead.

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

class Logger extends EventEmitter {}

const logger = new Logger();
const logFilePath = path.join(__dirname, '..', 'data', 'access.log');

// Listener #1: print a readable line to the console.
logger.on('request', ({ method, url, statusCode, durationMs }) => {
  console.log(
    `[${new Date().toISOString()}] ${method} ${url} -> ${statusCode} (${durationMs}ms)`
  );
});

// Vercel's filesystem is read-only.
// Keep file logging for local development, but use console logging
// when running in Vercel.
const isVercel = Boolean(process.env.VERCEL);

let accessLogStream = null;

if (!isVercel) {
  accessLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  accessLogStream.on('error', (error) => {
    console.error('Access log stream error:', error.message);
  });
}

logger.on('request', ({ method, url, statusCode, durationMs }) => {
  const line = `${new Date().toISOString()} ${method} ${url} ${statusCode} ${durationMs}ms`;

  if (accessLogStream) {
    accessLogStream.write(`${line}\n`);
  }
});

// EventEmitters can have more than one listener per event.
// Both listeners react to every "request" event.

module.exports = logger;