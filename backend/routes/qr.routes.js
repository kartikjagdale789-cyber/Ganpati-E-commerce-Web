const router = require('express').Router();
const ctrl   = require('../controllers/qr.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, ctrl.generate);

module.exports = router;
