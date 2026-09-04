const Inventory = require('../models/Inventory.model');

/* GET /api/inventory */
exports.getAll = async (req, res) => {
  try {
    const { type, color, minPrice, maxPrice, search } = req.query;
    const query = { isActive: true };
    if (type)     query.type  = new RegExp(type, 'i');
    if (color)    query.color = new RegExp(color, 'i');
    if (search)   query.$or   = [{ name: new RegExp(search,'i') }, { type: new RegExp(search,'i') }];
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = +minPrice;
      if (maxPrice) query.price.$lte = +maxPrice;
    }
    const items = await Inventory.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* GET /api/inventory/:id */
exports.getOne = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* POST /api/inventory */
exports.create = async (req, res) => {
  try {
    const data = { ...req.body, price: +req.body.price, qty: +req.body.qty };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const item = await Inventory.create(data);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

/* PUT /api/inventory/:id */
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.body.price !== undefined) data.price = +req.body.price;
    if (req.body.qty   !== undefined) data.qty   = +req.body.qty;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const item = await Inventory.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

/* DELETE /api/inventory/:id  (soft delete) */
exports.remove = async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/* PATCH /api/inventory/:id/qty */
exports.updateQty = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, { qty: +req.body.qty }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
