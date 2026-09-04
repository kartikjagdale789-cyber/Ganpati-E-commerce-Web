const ShopSettings = require('../models/ShopSettings.model');

/* GET /api/settings */
exports.get = async (_req, res) => {
  try {
    let settings = await ShopSettings.findOne();
    if (!settings) settings = await ShopSettings.create({});
    res.json({ success: true, data: settings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* PUT /api/settings */
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.body.lowStockThreshold) data.lowStockThreshold = +req.body.lowStockThreshold;
    if (req.file) data.shopLogo = `/uploads/${req.file.filename}`;
    const settings = await ShopSettings.findOneAndUpdate({}, data, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: settings, message: 'Settings saved successfully' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
