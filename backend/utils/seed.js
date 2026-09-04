require('dotenv').config({ path: '../.env' });
const mongoose    = require('mongoose');
const User        = require('../models/User.model');
const ShopSettings = require('../models/ShopSettings.model');
const Inventory   = require('../models/Inventory.model');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ganpati_billing');

async function seed() {
  try {
    /* Admin user */
    if (!(await User.findOne({ username: 'admin' }))) {
      await User.create({ username: 'admin', password: 'ganpati123', name: 'Shop Admin', role: 'admin' });
      console.log('✅ Admin user: admin / ganpati123');
    }

    /* Shop settings */
    if (!(await ShopSettings.findOne())) {
      await ShopSettings.create({
        shopName   : 'Shri Ganesh Murti Bhandar',
        shopAddress: 'Ganesh Nagar, Near Main Temple, Nagpur, Maharashtra - 440001',
        mobile     : '+91-9876543210',
        email      : 'ganeshmurti@example.com',
        gstNumber  : 'GST27ABCDE1234F1Z5',
        upiId      : 'ganeshmurti@paytm',
        bankName   : 'State Bank of India',
        lowStockThreshold: 5,
      });
      console.log('✅ Shop settings created');
    }

    /* Inventory */
    if ((await Inventory.countDocuments()) === 0) {
      const items = [
        { name: 'Siddhivinayak Ganpati', type: 'Shadu Clay',   height: '12"', color: 'Natural White', price: 1200, qty: 15, emoji: '🙏', description: 'Traditional Shadu clay idol' },
        { name: 'Eco Ganpati',           type: 'Eco-Friendly', height: '8"',  color: 'Mud Brown',     price: 850,  qty: 4,  emoji: '🌿', description: 'Made from natural clay' },
        { name: 'Marble Ganpati',        type: 'Marble',       height: '18"', color: 'White Marble',  price: 5500, qty: 8,  emoji: '⚪', description: 'Premium white marble idol' },
        { name: 'Brass Gold Ganpati',    type: 'Metal',        height: '6"',  color: 'Gold',          price: 2200, qty: 20, emoji: '🥇', description: 'Brass finish golden idol' },
        { name: 'Panchadhatu Ganpati',   type: 'Panchadhatu',  height: '9"',  color: 'Antique Gold',  price: 3800, qty: 2,  emoji: '✨', description: 'Five-metal alloy idol' },
        { name: 'Paper Mache Ganpati',   type: 'Paper Mache',  height: '14"', color: 'Multicolor',    price: 650,  qty: 0,  emoji: '🎨', description: 'Lightweight colorful idol' },
      ];
      for (const item of items) await Inventory.create(item);
      console.log('✅ Sample inventory created');
    }

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}
seed();
