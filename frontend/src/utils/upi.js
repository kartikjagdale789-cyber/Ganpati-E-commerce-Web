export const buildUPIString = (settings, amount, invoiceNo, customerName) => {
  if (!settings?.upiId) return '';
  const note = [invoiceNo, customerName].filter(Boolean).join(' ');
  return `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.shopName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
};
