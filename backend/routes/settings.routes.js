const router = require('express').Router();
const ctrl   = require('../controllers/settings.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/',  protect, ctrl.get);
router.put('/',  protect, adminOnly, upload.single('shopLogo'), ctrl.update);

module.exports = router;
