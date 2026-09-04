const Invoice   = require('../models/Invoice.model');
const Inventory = require('../models/Inventory.model');
const Customer  = require('../models/Customer.model');

const getDateRange = (type) => {
  const now   = new Date();
  const start = new Date();
  if (type === 'daily')   { start.setHours(0, 0, 0, 0); }
  else if (type === 'weekly')  { start.setDate(now.getDate() - 7); }
  else if (type === 'monthly') { start.setDate(1); start.setHours(0, 0, 0, 0); }
  return { $gte: start, $lte: now };
};

/* GET /api/reports/dashboard */
exports.dashboard = async (_req, res) => {
  try {
    const todayRange = getDateRange('daily');
    const [allInvoices, todayInvoices, inventory, customers] = await Promise.all([
      Invoice.find(),
      Invoice.find({ invoiceDate: todayRange }),
      Inventory.find({ isActive: true }),
      Customer.find(),
    ]);

    res.json({
      success: true,
      data: {
        todaySales      : todayInvoices.length,
        todayRevenue    : todayInvoices.reduce((s, i) => s + i.paidAmount, 0),
        totalRevenue    : allInvoices.reduce((s, i) => s + i.paidAmount, 0),
        pendingAmount   : allInvoices.reduce((s, i) => s + i.remainingAmount, 0),
        totalCustomers  : customers.length,
        pendingCustomers: allInvoices.filter(i => i.remainingAmount > 0).length,
        outOfStock      : inventory.filter(i => i.qty === 0).length,
        lowStock        : inventory.filter(i => i.qty > 0 && i.qty <= 5).length,
        totalInvoices   : allInvoices.length,
        paidInvoices    : allInvoices.filter(i => i.paymentStatus === 'Paid').length,
        totalStock      : inventory.reduce((s, i) => s + i.qty, 0),
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/reports/sales?type=daily|weekly|monthly|all */
exports.sales = async (req, res) => {
  try {
    const { type = 'daily' } = req.query;
    const query = type === 'all' ? {} : { invoiceDate: getDateRange(type) };
    const invoices = await Invoice.find(query).sort({ invoiceDate: -1 });
    res.json({
      success: true,
      data: invoices,
      stats: {
        count       : invoices.length,
        totalRevenue: invoices.reduce((s, i) => s + i.totalAmount, 0),
        totalPaid   : invoices.reduce((s, i) => s + i.paidAmount, 0),
        totalDue    : invoices.reduce((s, i) => s + i.remainingAmount, 0),
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/reports/best-selling */
exports.bestSelling = async (_req, res) => {
  try {
    const invoices = await Invoice.find();
    const map = {};
    invoices.forEach(inv =>
      inv.items.forEach(item => {
        if (!map[item.type]) map[item.type] = { type: item.type, name: item.name, emoji: item.emoji, qty: 0, revenue: 0 };
        map[item.type].qty     += item.qty;
        map[item.type].revenue += item.totalPrice;
      })
    );
    const sorted = Object.values(map).sort((a, b) => b.qty - a.qty);
    res.json({ success: true, data: sorted });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/reports/stock */
exports.stock = async (_req, res) => {
  try {
    const inventory = await Inventory.find({ isActive: true });
    res.json({ success: true, data: inventory });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
