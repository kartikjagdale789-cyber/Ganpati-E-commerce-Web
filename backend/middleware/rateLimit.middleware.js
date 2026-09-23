const { rateLimit } = require('express-rate-limit');

const createLimiter = (limit, windowMs) => rateLimit({
  limit,
  windowMs,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
    res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  },
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

module.exports = {
  loginLimiter: createLimiter(5, 15 * 60 * 1000),
  billingLimiter: createLimiter(60, 60 * 1000),
  invoiceLimiter: createLimiter(20, 60 * 1000),
  uploadLimiter: createLimiter(5, 60 * 1000),
};