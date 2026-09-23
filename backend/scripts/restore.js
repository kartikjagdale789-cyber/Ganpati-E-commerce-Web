require('../config/env');
const { execFile } = require('child_process');

const backupPath = process.argv[2];
if (!backupPath) {
  console.error('Usage: npm run restore -- <backup-directory>');
  process.exit(1);
}

execFile('mongorestore', ['--uri', process.env.MONGODB_URI, '--drop', backupPath], (error, _stdout, stderr) => {
  if (error) {
    console.error('Database restore failed:', stderr || error.message);
    process.exit(1);
  }
  console.log(`Database restored from ${backupPath}`);
});