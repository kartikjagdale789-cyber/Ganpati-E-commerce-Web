const router = require('express').Router();
const ctrl   = require('../controllers/qr.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { invoiceLimiter } = require('../middleware/rateLimit.middleware');

router.post('/generate', protect, invoiceLimiter, validate('qr'), ctrl.generate);

module.exports = router;
