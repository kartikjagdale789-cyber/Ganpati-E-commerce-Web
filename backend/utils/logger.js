const pino = require('pino');
const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');
fs.mkdirSync(logDirectory, { recursive: true });

const destination = pino.destination({
  dest: path.join(logDirectory, 'application.log'),
  sync: false,
});

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'password', 'token', '*.password'],
}, destination);

module.exports = logger;