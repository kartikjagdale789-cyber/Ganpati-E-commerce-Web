const logger = require('../utils/logger');
const Sentry = require('@sentry/node');

const errorHandler = (err, req, res, _next) => {
  logger.error({ err, method: req.method, path: req.originalUrl }, 'Request failed');
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Uploaded file is too large' });
  if (err.name === 'MulterError') return res.status(400).json({ success: false, message: 'Invalid file upload' });
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Invalid request data' });
  res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Internal server error' });
};

module.exports = errorHandler;