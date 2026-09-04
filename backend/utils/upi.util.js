/**
 * Build a UPI payment deep-link string.
 * Compatible with PhonePe, Google Pay, Paytm, BHIM.
 */
exports.buildUPIString = (upiId, shopName, amount, invoiceNo, customerName) => {
  const note = [invoiceNo, customerName].filter(Boolean).join(' ');
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
};
