const router = require('express').Router();
const ctrl   = require('../controllers/settings.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');

router.get('/', ctrl.get);
router.post('/verify', protect, validate('settingsVerify'), ctrl.verifyOwner);
router.put(
  '/',
  protect,
  adminOnly,
  uploadLimiter,
  upload.fields([
    { name: 'shopLogo', maxCount: 1 },
    { name: 'qrLogo', maxCount: 1 },
    { name: 'headerBanner', maxCount: 1 },
  ]),
  validate('settings'),
  ctrl.update
);

module.exports = router;
