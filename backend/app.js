const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

/* ─── Middleware ─────────────────────────────────────────────────────────── */
app.use(cors({
  origin : [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));
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
  res.json({ status: 'OK', message: '🙏 Ganpati Billing API is running' })
);

/* ─── 404 ────────────────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

/* ─── Global error handler ───────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

module.exports = app;
