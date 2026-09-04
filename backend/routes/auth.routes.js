const router = require('express').Router();
const { login, register, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login',    login);
router.post('/register', register);
router.get ('/me',       protect, getMe);

module.exports = router;
