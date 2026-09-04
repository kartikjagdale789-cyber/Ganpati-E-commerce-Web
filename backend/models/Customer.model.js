const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name           : { type: String, required: true, trim: true },
  mobile         : { type: String, default: '' },
  email          : { type: String, default: '' },
  address        : { type: String, default: '' },
  totalPurchases : { type: Number, default: 0 },
  totalAmount    : { type: Number, default: 0 },
  totalDue       : { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
