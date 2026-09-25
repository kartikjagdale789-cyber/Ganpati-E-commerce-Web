const mongoose = require('mongoose');

const shopSettingsSchema = new mongoose.Schema({
  shopName         : { type: String, default: 'Your Business Name', required: true, trim: true },
  shopLogo         : { type: String, default: '' },
  headerBanner     : { type: String, default: '' },
  shopAddress      : { type: String, default: '', trim: true },
  address          : { type: String, default: '', trim: true },
  mobileNumber     : { type: String, default: '', trim: true },
  mobile           : { type: String, default: '', trim: true },
  alternateMobile  : { type: String, default: '', trim: true },
  email            : { type: String, default: '', trim: true },
  gstNumber        : { type: String, default: '', trim: true },
  upiId            : { type: String, default: '', trim: true },
  bankName         : { type: String, default: '', trim: true },
  invoicePrefix    : { type: String, default: 'INV', trim: true },
  footerMessage    : { type: String, default: 'Thank you for your purchase.', trim: true },
  instagram        : { type: String, default: '', trim: true },
  qrLogo           : { type: String, default: '' },
  lowStockThreshold: { type: Number, default: 5 },
  currency         : { type: String, default: 'INR' },
}, { timestamps: true, strict: false });

shopSettingsSchema.pre('save', function () {
  if (this.isModified('mobileNumber')) {
    this.mobile = this.mobileNumber;
  } else if (this.isModified('mobile')) {
    this.mobileNumber = this.mobile;
  } else {
    if (this.mobileNumber && !this.mobile) this.mobile = this.mobileNumber;
    if (this.mobile && !this.mobileNumber) this.mobileNumber = this.mobile;
  }

  if (this.isModified('shopAddress')) {
    this.address = this.shopAddress;
  } else if (this.isModified('address')) {
    this.shopAddress = this.address;
  } else {
    if (this.shopAddress && !this.address) this.address = this.shopAddress;
    if (this.address && !this.shopAddress) this.shopAddress = this.address;
  }
});

module.exports = mongoose.model('ShopSettings', shopSettingsSchema);
