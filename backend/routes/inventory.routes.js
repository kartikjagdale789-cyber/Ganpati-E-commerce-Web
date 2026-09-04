const router = require('express').Router();
const ctrl   = require('../controllers/inventory.controller');
const { protect }  = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get   ('/',        protect, ctrl.getAll);
router.get   ('/:id',     protect, ctrl.getOne);
router.post  ('/',        protect, upload.single('image'), ctrl.create);
router.put   ('/:id',     protect, upload.single('image'), ctrl.update);
router.delete('/:id',     protect, ctrl.remove);
router.patch ('/:id/qty', protect, ctrl.updateQty);

module.exports = router;
