const mongoose = require('mongoose');

/* ── Sub-schemas ──────────────────────────────────────────────────────────── */
const itemSchema = new mongoose.Schema({
  ganpatiId   : { type: String, required: true },
  inventoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  name        : { type: String, required: true },
  type        : { type: String, required: true },
  height      : { type: String, default: '' },
  color       : { type: String, default: '' },
  emoji       : { type: String, default: '🙏' },
  qty         : { type: Number, required: true, min: 1 },
  unitPrice   : { type: Number, required: true },
  totalPrice  : { type: Number, required: true },
}, { _id: false });

const paymentHistorySchema = new mongoose.Schema({
  amount       : { type: Number, required: true },
  method       : { type: String, default: 'Cash' },
  transactionId: { type: String, default: '' },
  note         : { type: String, default: '' },
  paidAt       : { type: Date,   default: Date.now },
}, { _id: false });

/* ── Main Invoice schema ───────────────────────────────────────────────────── */
const invoiceSchema = new mongoose.Schema({
  invoiceNo     : { type: String, unique: true },
  transactionId : { type: String, unique: true },

  /* Customer */
  customer       : { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName   : { type: String, required: true },
  customerMobile : { type: String, default: '' },
  customerEmail  : { type: String, default: '' },

  /* Items */
  items : [itemSchema],

  /* Amounts */
  subtotal        : { type: Number, required: true },
  discount        : { type: Number, default: 0 },
  totalAmount     : { type: Number, required: true },
  paidAmount      : { type: Number, default: 0 },
  remainingAmount : { type: Number, default: 0 },

  /* Payment */
  paymentMethod : { type: String, enum: ['Cash','UPI','Card','Bank Transfer','Cheque','Mixed'], default: 'Cash' },
  paymentStatus : { type: String, enum: ['Paid','Partial Payment','Unpaid'], default: 'Unpaid' },
  paymentHistory: [paymentHistorySchema],

  /* UPI */
  upiId     : { type: String, default: '' },
  upiQrData : { type: String, default: '' },
  upiQrImage: { type: String, default: '' },

  notes      : { type: String, default: '' },
  invoiceDate: { type: Date,   default: Date.now },
}, { timestamps: true });

/* ── Pre-save: auto IDs + payment status ─────────────────────────────────── */
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const year  = new Date().getFullYear();
    let count = await mongoose.model('Invoice').countDocuments();
    let candidate = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    while (await mongoose.model('Invoice').exists({ invoiceNo: candidate })) {
      count++;
      candidate = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    this.invoiceNo = candidate;
  }
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  /* Recalculate payment status */
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus  = 'Paid';
    this.remainingAmount = 0;
  } else if (this.paidAmount > 0) {
    this.paymentStatus  = 'Partial Payment';
    this.remainingAmount = this.totalAmount - this.paidAmount;
  } else {
    this.paymentStatus  = 'Unpaid';
    this.remainingAmount = this.totalAmount;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
