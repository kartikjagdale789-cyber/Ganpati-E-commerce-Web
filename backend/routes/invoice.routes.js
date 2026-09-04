const router = require('express').Router();
const ctrl   = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');

router.get ('/',              protect, ctrl.getAll);
router.get ('/dues',          protect, ctrl.getDues);
router.get ('/:id',           protect, ctrl.getOne);
router.post('/',              protect, ctrl.create);
router.post('/:id/payment',   protect, ctrl.receivePayment);

module.exports = router;
