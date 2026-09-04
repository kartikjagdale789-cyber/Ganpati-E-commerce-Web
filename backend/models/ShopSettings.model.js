const mongoose = require('mongoose');

const shopSettingsSchema = new mongoose.Schema({
  shopName   : { type: String, default: 'Shri Ganesh Murti Bhandar' },
  shopAddress: { type: String, default: '' },
  mobile     : { type: String, default: '' },
  email      : { type: String, default: '' },
  gstNumber  : { type: String, default: '' },
  upiId      : { type: String, default: '' },
  bankName   : { type: String, default: '' },
  shopLogo   : { type: String, default: '' },
  lowStockThreshold: { type: Number, default: 5 },
  invoicePrefix    : { type: String, default: 'INV' },
  currency         : { type: String, default: 'INR' },
}, { timestamps: true });

module.exports = mongoose.model('ShopSettings', shopSettingsSchema);
