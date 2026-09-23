const router = require('express').Router();
const ctrl   = require('../controllers/inventory.controller');
const { protect }  = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { validate, validateId } = require('../middleware/validate.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');

router.get   ('/',        protect, ctrl.getAll);
router.get   ('/:id',     protect, validateId, ctrl.getOne);
router.post  ('/',        protect, uploadLimiter, upload.single('image'), validate('inventory'), ctrl.create);
router.put   ('/:id',     protect, validateId, uploadLimiter, upload.single('image'), validate('inventoryUpdate'), ctrl.update);
router.delete('/:id',     protect, validateId, ctrl.remove);
router.patch ('/:id/qty', protect, validateId, validate('qty'), ctrl.updateQty);

module.exports = router;
