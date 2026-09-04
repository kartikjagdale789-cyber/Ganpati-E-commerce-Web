const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ganpatiId  : { type: String, unique: true },
  name       : { type: String, required: true, trim: true },
  type       : { type: String, required: true, trim: true },
  height     : { type: String, required: true },
  color      : { type: String, required: true },
  price      : { type: Number, required: true, min: 0 },
  qty        : { type: Number, required: true, min: 0, default: 0 },
  emoji      : { type: String, default: '🙏' },
  description: { type: String, default: '' },
  image      : { type: String, default: '' },
  isActive   : { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true } });

/* Auto-generate ganpatiId */
inventorySchema.pre('save', async function (next) {
  if (!this.ganpatiId) {
    const count = await mongoose.model('Inventory').countDocuments();
    this.ganpatiId = `G-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

/* Virtual: stock status */
inventorySchema.virtual('status').get(function () {
  if (this.qty === 0) return 'Out of Stock';
  if (this.qty <= 5)  return 'Low Stock';
  return 'In Stock';
});

module.exports = mongoose.model('Inventory', inventorySchema);
