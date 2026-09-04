const QRCode      = require('qrcode');
const Invoice     = require('../models/Invoice.model');
const Inventory   = require('../models/Inventory.model');
const Customer    = require('../models/Customer.model');
const ShopSettings = require('../models/ShopSettings.model');
const { buildUPIString } = require('../utils/upi.util');

/* GET /api/invoices */
exports.getAll = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.paymentStatus = status;
    if (search) query.$or = [
      { invoiceNo   : new RegExp(search, 'i') },
      { customerName: new RegExp(search, 'i') },
    ];
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate)   query.invoiceDate.$lte = new Date(`${endDate}T23:59:59`);
    }
    const [invoices, total] = await Promise.all([
      Invoice.find(query).sort({ createdAt: -1 }).limit(+limit).skip((+page - 1) * +limit),
      Invoice.countDocuments(query),
    ]);
    res.json({ success: true, data: invoices, total, page: +page });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/invoices/dues */
exports.getDues = async (req, res) => {
  try {
    const dues = await Invoice.find({ remainingAmount: { $gt: 0 } }).sort({ createdAt: -1 });
    res.json({ success: true, data: dues });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/invoices/:id */
exports.getOne = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* POST /api/invoices */
exports.create = async (req, res) => {
  try {
    const { customerName, customerMobile, customerEmail, items, paidAmount, paymentMethod, notes, discount = 0 } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    /* Validate stock */
    for (const item of items) {
      const inv = await Inventory.findById(item.inventoryRef);
      if (!inv)         return res.status(404).json({ success: false, message: `Item "${item.name}" not found` });
      if (inv.qty < item.qty) return res.status(400).json({ success: false, message: `Insufficient stock for "${item.name}". Available: ${inv.qty}` });
    }

    const subtotal    = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const totalAmount = Math.max(0, subtotal - (+discount || 0));
    const paid        = Math.min(+paidAmount || 0, totalAmount);

    /* UPI QR */
    const settings  = await ShopSettings.findOne();
    const upiString = settings?.upiId && paid > 0
      ? buildUPIString(settings.upiId, settings.shopName, paid, 'PENDING', customerName.trim())
      : '';
    const upiQrImage = upiString
      ? await QRCode.toDataURL(upiString, { width: 256, margin: 2 })
      : '';

    /* Find / create customer */
    let customer = null;
    const cleanMobile = customerMobile ? String(customerMobile).trim() : '';
    if (cleanMobile) {
      customer = await Customer.findOne({ mobile: cleanMobile });
    }
    if (!customer) {
      customer = await Customer.create({
        name: customerName.trim(),
        mobile: cleanMobile,
        email: customerEmail ? String(customerEmail).trim() : '',
      });
    }

    const invoice = await Invoice.create({
      customer: customer._id,
      customerName: customerName.trim(),
      customerMobile: cleanMobile,
      customerEmail: customerEmail ? String(customerEmail).trim() : '',
      items: items.map(i => ({ ...i, totalPrice: i.unitPrice * i.qty })),
      subtotal,
      discount: +discount,
      totalAmount,
      paidAmount: paid,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || '',
      upiId: settings?.upiId || '',
      upiQrData: upiString,
      upiQrImage,
      paymentHistory: paid > 0 ? [{ amount: paid, method: paymentMethod || 'Cash' }] : [],
    });

    /* Ensure dynamic UPI QR is fully generated with final invoiceNo */
    const qrAmount = paid > 0 ? paid : totalAmount;
    if (settings?.upiId && qrAmount > 0) {
      const finalUpi = buildUPIString(settings.upiId, settings.shopName, qrAmount, invoice.invoiceNo, customerName.trim());
      const finalQr  = await QRCode.toDataURL(finalUpi, { width: 300, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
      invoice.upiQrData  = finalUpi;
      invoice.upiQrImage = finalQr;
      await invoice.save();
    }

    /* Deduct inventory */
    for (const item of items)
      await Inventory.findByIdAndUpdate(item.inventoryRef, { $inc: { qty: -item.qty } });

    /* Update customer stats */
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalPurchases: 1, totalAmount: totalAmount, totalDue: totalAmount - paid },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

/* POST /api/invoices/:id/payment  — receive remaining */
exports.receivePayment = async (req, res) => {
  try {
    const { amount, method, transactionId = '', note = '' } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payAmt = Math.min(+amount, invoice.remainingAmount);
    invoice.paidAmount      += payAmt;
    invoice.remainingAmount -= payAmt;
    invoice.paymentHistory.push({ amount: payAmt, method: method || 'Cash', transactionId, note });

    /* Regenerate QR for remaining */
    const settings = await ShopSettings.findOne();
    if (settings?.upiId && invoice.remainingAmount > 0) {
      const upiStr = buildUPIString(settings.upiId, settings.shopName, invoice.remainingAmount, invoice.invoiceNo, invoice.customerName);
      invoice.upiQrData  = upiStr;
      invoice.upiQrImage = await QRCode.toDataURL(upiStr, { width: 256, margin: 2 });
    } else {
      invoice.upiQrData  = '';
      invoice.upiQrImage = '';
    }

    await invoice.save();
    await Customer.findByIdAndUpdate(invoice.customer, { $inc: { totalDue: -payAmt } });

    const msg = invoice.paymentStatus === 'Paid'
      ? 'Payment complete! ✅'
      : `₹${payAmt} received. Remaining: ₹${invoice.remainingAmount}`;
    res.json({ success: true, data: invoice, message: msg });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
