const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
const number = z.coerce.number().finite();

const schemas = {
  login: z.object({ username: z.string().trim().min(1).max(100), password: z.string().min(1).max(200) }),
  register: z.object({ username: z.string().trim().min(3).max(100), password: z.string().min(12).max(200), name: z.string().trim().min(1).max(100).optional() }),
  inventory: z.object({
    name: z.string().trim().min(1).max(200), type: z.string().trim().min(1).max(100),
    height: z.string().trim().min(1).max(50), color: z.string().trim().min(1).max(100),
    price: number.nonnegative(), qty: number.int().nonnegative(),
    emoji: z.string().max(20).optional(), description: z.string().max(2000).optional(),
  }),
  inventoryUpdate: z.object({
    name: z.string().trim().min(1).max(200).optional(), type: z.string().trim().min(1).max(100).optional(),
    height: z.string().trim().min(1).max(50).optional(), color: z.string().trim().min(1).max(100).optional(),
    price: number.nonnegative().optional(), qty: number.int().nonnegative().optional(),
    emoji: z.string().max(20).optional(), description: z.string().max(2000).optional(),
  }),
  qty: z.object({ qty: number.int().nonnegative() }),
  invoice: z.object({
    customerName: z.string().trim().min(1).max(200), customerMobile: z.string().max(30).optional(),
    customerEmail: z.string().email().max(200).optional().or(z.literal('')), items: z.array(z.object({
      ganpatiId: objectId, inventoryRef: objectId, name: z.string().max(200), type: z.string().max(100),
      height: z.string().max(50).optional(), color: z.string().max(100).optional(), emoji: z.string().max(20).optional(),
      qty: number.int().positive(), unitPrice: number.nonnegative(),
    })).min(1).max(500), paidAmount: number.nonnegative().optional(), discount: number.nonnegative().optional(),
    paymentMethod: z.string().trim().max(50).optional(), notes: z.string().max(2000).optional(),
  }),
  payment: z.object({ amount: number.positive(), method: z.string().trim().max(50).optional(), transactionId: z.string().max(200).optional(), note: z.string().max(1000).optional() }),
  qr: z.object({ amount: number.nonnegative(), invoiceNo: z.string().max(100).optional(), customerName: z.string().max(200).optional() }),
  settingsVerify: z.object({ username: z.string().trim().min(1).max(100), password: z.string().min(1).max(200) }),
  settings: z.object({
    shopName: z.string().trim().min(1).max(200), shopAddress: z.string().max(500).optional(), address: z.string().max(500).optional(),
    mobile: z.string().max(30).optional(), mobileNumber: z.string().max(30).optional(), alternateMobile: z.string().max(30).optional(),
    email: z.string().email().max(200).optional().or(z.literal('')), gstNumber: z.string().max(50).optional(), upiId: z.string().max(200).optional(),
    bankName: z.string().max(200).optional(), invoicePrefix: z.string().max(20).optional(), currency: z.string().max(10).optional(),
    footerMessage: z.string().max(500).optional(), instagram: z.string().max(200).optional(), lowStockThreshold: number.int().nonnegative().optional(),
  }).passthrough(),
};

const validate = (schemaName, source = 'body') => (req, res, next) => {
  const result = schemas[schemaName].safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({ success: false, message: 'Invalid request data', errors: result.error.flatten().fieldErrors });
  }
  req[source] = result.data;
  next();
};

const validateId = (req, res, next) => {
  if (!objectId.safeParse(req.params.id).success) return res.status(400).json({ success: false, message: 'Invalid identifier' });
  next();
};

module.exports = { validate, validateId };