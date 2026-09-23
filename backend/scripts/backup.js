require('../config/env');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDirectory = path.join(__dirname, '../backups', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(backupDirectory, { recursive: true });

execFile('mongodump', ['--uri', process.env.MONGODB_URI, '--out', backupDirectory], (error, _stdout, stderr) => {
  if (error) {
    console.error('Database backup failed:', stderr || error.message);
    process.exit(1);
  }
  console.log(`Database backup created at ${backupDirectory}`);
});