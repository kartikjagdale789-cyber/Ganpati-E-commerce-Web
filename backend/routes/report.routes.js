const router = require('express').Router();
const ctrl   = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/dashboard',    protect, ctrl.dashboard);
router.get('/sales',        protect, ctrl.sales);
router.get('/best-selling', protect, ctrl.bestSelling);
router.get('/stock',        protect, ctrl.stock);

module.exports = router;
