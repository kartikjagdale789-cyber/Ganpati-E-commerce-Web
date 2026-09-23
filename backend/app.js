const express = require('express');
const cors    = require('cors');
const path    = require('path');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean/lib/xss').clean;
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const Sentry = require('@sentry/node');
const logger = require('./utils/logger');
const { allowedOrigins } = require('./config/env');
const errorHandler = require('./middleware/error.middleware');

const app = express();

if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'production' });

/* ─── Middleware ─────────────────────────────────────────────────────────── */
app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(hpp());
app.use((req, _res, next) => {
  ['body', 'params', 'headers', 'query'].forEach((key) => {
    const source = req[key];
    if (!source) return;
    const sanitized = mongoSanitize.sanitize(source);
    if (key === 'query') {
      Object.keys(source).forEach((name) => delete source[name]);
      Object.assign(source, sanitized);
    } else {
      req[key] = sanitized;
    }
  });
  next();
});
app.use((req, _res, next) => {
  ['body', 'params', 'query'].forEach((key) => {
    const source = req[key];
    if (!source) return;
    const sanitized = xssClean(source);
    if (key === 'query') {
      Object.keys(source).forEach((name) => delete source[name]);
      Object.assign(source, sanitized);
    } else {
      req[key] = sanitized;
    }
  });
  next();
});
app.use(pinoHttp({ logger }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ─── Routes ─────────────────────────────────────────────────────────────── */
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/invoices',  require('./routes/invoice.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/settings',  require('./routes/settings.routes'));
app.use('/api/reports',   require('./routes/report.routes'));
app.use('/api/qr',        require('./routes/qr.routes'));

/* ─── Health ─────────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: 'Ganpati Billing API is running' })
);

/* ─── 404 ────────────────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

/* ─── Global error handler ───────────────────────────────────────────────── */
app.use(errorHandler);

module.exports = app;
