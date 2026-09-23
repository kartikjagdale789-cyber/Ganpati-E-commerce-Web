require('./config/env');
const app        = require('./app');
const connectDB  = require('./config/db');

const ShopSettings = require('./models/ShopSettings.model');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  try {
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
      console.log('Initial shop settings document created in MongoDB (First Run)');
    } else {
      console.log(`Shop settings loaded permanently from MongoDB: "${settings.shopName}"`);
    }
  } catch (err) {
    console.error('Error verifying shop settings on startup:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log('MongoDB: Connected');
  });
});
