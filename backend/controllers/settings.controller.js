const ShopSettings = require('../models/ShopSettings.model');
const User = require('../models/User.model');

// Helper to ensure a single permanent settings document
const getOrCreateSettings = async () => {
  let settings = await ShopSettings.findOne();
  if (!settings) {
    settings = await ShopSettings.create({
      shopName         : 'Your Business Name',
      shopAddress      : '',
      address          : '',
      mobile           : '',
      mobileNumber     : '',
      alternateMobile  : '',
      email            : '',
      gstNumber        : '',
      upiId            : '',
      bankName         : '',
      lowStockThreshold: 5,
      invoicePrefix    : 'INV',
      currency         : 'INR',
      shopLogo         : '',
      headerBanner     : '',
      qrLogo           : '',
      footerMessage    : 'Thank you for your purchase.',
      instagram        : '',
    });
  }
  return settings;
};

/* GET /api/settings - Always read the single permanent document */
exports.get = async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Settings could not be loaded' });
  }
};

/* PUT /api/settings - Permanently update the same MongoDB document */
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    // Validation
    if (data.shopName !== undefined && !data.shopName.trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }

    if (data.lowStockThreshold !== undefined && data.lowStockThreshold !== '') {
      const num = Number(data.lowStockThreshold);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Low stock threshold must be a valid non-negative number' });
      }
      data.lowStockThreshold = num;
    }

    // Keep mobile / mobileNumber and address / shopAddress synchronized
    if (data.mobileNumber !== undefined) {
      data.mobile = data.mobileNumber;
    } else if (data.mobile !== undefined) {
      data.mobileNumber = data.mobile;
    }

    if (data.shopAddress !== undefined) {
      data.address = data.shopAddress;
    } else if (data.address !== undefined) {
      data.shopAddress = data.address;
    }

    // Handle logo & banner uploads
    if (req.files?.shopLogo?.[0]) {
      data.shopLogo = `/uploads/${req.files.shopLogo[0].filename}`;
    } else if (req.file && req.file.fieldname === 'shopLogo') {
      data.shopLogo = `/uploads/${req.file.filename}`;
    }

    if (req.files?.qrLogo?.[0]) {
      data.qrLogo = `/uploads/${req.files.qrLogo[0].filename}`;
    } else if (req.file && req.file.fieldname === 'qrLogo') {
      data.qrLogo = `/uploads/${req.file.filename}`;
    }

    if (req.files?.headerBanner?.[0]) {
      data.headerBanner = `/uploads/${req.files.headerBanner[0].filename}`;
    } else if (req.file && req.file.fieldname === 'headerBanner') {
      data.headerBanner = `/uploads/${req.file.filename}`;
    }

    // Find the single existing document or create one if none exists
    let settings = await ShopSettings.findOne();
    if (!settings) {
      settings = new ShopSettings(data);
    } else {
      // Update all provided fields into the existing document
      Object.keys(data).forEach((key) => {
        if (key !== '_id' && key !== '__v') {
          settings.set(key, data[key]);
        }
      });
    }

    await settings.save();
    res.json({ success: true, data: settings, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Settings could not be saved' });
  }
};

/* POST /api/settings/verify - Verify owner credentials for settings access */
exports.verifyOwner = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const owner = username ? await User.findOne({ username: username.trim(), role: 'admin', isActive: true }) : null;
    if (owner && password && await owner.comparePassword(password)) {
      return res.status(200).json({
        success: true,
        message: 'Owner verification successful',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid Username or Password',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Owner verification could not be completed' });
  }
};
