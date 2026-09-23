const dotenv = require('dotenv');

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

if (process.env.JWT_SECRET.length < 64) {
  throw new Error('JWT_SECRET must be at least 64 characters long');
}

const allowedOrigins = process.env.CLIENT_URL
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!allowedOrigins.length || process.env.NODE_ENV === 'production' && allowedOrigins.some((origin) => /localhost|127\.0\.0\.1/i.test(origin))) {
  throw new Error('CLIENT_URL must contain production origins only');
}

module.exports = { allowedOrigins };