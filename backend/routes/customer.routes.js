const router = require('express').Router();
const ctrl   = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/',              protect, ctrl.getAll);
router.get('/dues',          protect, ctrl.getDues);
router.get('/:id/invoices',  protect, ctrl.getInvoices);

module.exports = router;
