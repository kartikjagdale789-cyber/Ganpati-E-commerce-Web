const router = require('express').Router();
const ctrl   = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateId } = require('../middleware/validate.middleware');
const { billingLimiter, invoiceLimiter } = require('../middleware/rateLimit.middleware');

router.get ('/',              protect, ctrl.getAll);
router.get ('/dues',          protect, ctrl.getDues);
router.get ('/:id',           protect, validateId, ctrl.getOne);
router.post('/',              protect, billingLimiter, invoiceLimiter, validate('invoice'), ctrl.create);
router.post('/:id/payment',   protect, invoiceLimiter, validateId, validate('payment'), ctrl.receivePayment);

module.exports = router;
