const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/* POST /api/auth/login */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required' });

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, username: user.username, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/auth/register  — first-time only */
exports.register = async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0)
      return res.status(403).json({ success: false, message: 'Registration is closed' });
    const user  = await User.create(req.body);
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* GET /api/auth/me */
exports.getMe = (req, res) =>
  res.json({ success: true, user: req.user });
