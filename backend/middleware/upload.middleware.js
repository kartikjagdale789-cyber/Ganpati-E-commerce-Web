const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename   : (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

const fileFilter = (_req, file, cb) => {
  const allowed = { '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = allowed[ext] === file.mimetype;
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
