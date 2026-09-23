const router = require('express').Router();
const { login, register, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { loginLimiter } = require('../middleware/rateLimit.middleware');

router.post('/login',    loginLimiter, validate('login'), login);
router.post('/register', validate('register'), register);
router.get ('/me',       protect, getMe);

module.exports = router;
