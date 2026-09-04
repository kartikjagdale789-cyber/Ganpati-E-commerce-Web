const QRCode      = require('qrcode');
const ShopSettings = require('../models/ShopSettings.model');
const { buildUPIString } = require('../utils/upi.util');

/* POST /api/qr/generate */
exports.generate = async (req, res) => {
  try {
    const { amount, invoiceNo = '', customerName = '' } = req.body;
    const settings = await ShopSettings.findOne();
    if (!settings?.upiId)
      return res.status(400).json({ success: false, message: 'UPI ID not configured in Shop Settings' });

    const upiString  = buildUPIString(settings.upiId, settings.shopName, amount, invoiceNo, customerName);
    const qrImage    = await QRCode.toDataURL(upiString, { width: 300, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
    res.json({ success: true, qrImage, upiString, upiId: settings.upiId, shopName: settings.shopName });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
