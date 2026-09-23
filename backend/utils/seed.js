require('dotenv').config({ path: '../.env' });
const mongoose    = require('mongoose');
const ShopSettings = require('../models/ShopSettings.model');
const Inventory   = require('../models/Inventory.model');
require('../config/env');

mongoose.connect(process.env.MONGODB_URI);

async function seed() {
  try {
    /* Shop settings */
    const existingSettings = await ShopSettings.findOne();
    if (!existingSettings) {
      await ShopSettings.create({
        shopName   : 'Your Business Name',
        lowStockThreshold: 5,
        invoicePrefix    : 'INV',
        currency         : 'INR',
        shopLogo         : '',
        qrLogo           : '',
      });
      console.log('Shop settings created');
    } else {
      console.log(`Shop settings already exist ("${existingSettings.shopName}") — preserved without changes`);
    }

    if (process.env.SEED_SAMPLE_INVENTORY === 'true' && (await Inventory.countDocuments()) === 0) {
      const items = [
        { name: 'Sample Product A', type: 'Sample', height: 'Standard', color: 'White', price: 100, qty: 10, description: 'Optional sample inventory item' },
        { name: 'Sample Product B', type: 'Sample', height: 'Standard', color: 'Gold', price: 200, qty: 10, description: 'Optional sample inventory item' },
      ];
      await Inventory.insertMany(items);
      console.log('Optional sample inventory created');
    }

    console.log('Seed complete. No owner credentials were created.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}
seed();
