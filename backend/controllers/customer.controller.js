const Customer = require('../models/Customer.model');
const Invoice  = require('../models/Invoice.model');

/* GET /api/customers */
exports.getAll = async (_req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/customers/dues */
exports.getDues = async (_req, res) => {
  try {
    const dues = await Invoice.find({ remainingAmount: { $gt: 0 } }).sort({ createdAt: -1 });
    res.json({ success: true, data: dues });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/customers/:id/invoices */
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ customer: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
