export const printInvoice = (invoice, settings = {}, targetWindow = null) => {
  const statusColors = { Paid:'#15803d', 'Partial Payment':'#b45309', Unpaid:'#b91c1c' };
  const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;
  const qrUrl = invoice.upiQrImage || (invoice.upiQrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(invoice.upiQrData)}&margin=8`
    : '');

  const rows = (invoice.items||[]).map((item, i) => `
    <tr style="background:${i%2===0?'#fff':'#fffbf0'}">
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6">${i+1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6"><strong>${item.emoji||'🙏'} ${item.name}</strong><br>
        <small style="color:#6b7280">${item.type} | ${item.height} | ${item.color}</small></td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:center">${item.qty}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:right">${fmt(item.unitPrice)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700">${fmt(item.totalPrice)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><title>${invoice.invoiceNo}</title><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#111}
  .header{background:linear-gradient(135deg,#ff6b00,#f59e0b);padding:24px 30px;color:#fff}
  .shop-name{font-size:26px;font-weight:800}
  .body{padding:24px 30px}
  .inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .info-card{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px}
  .lbl{font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
  .val{font-size:13px;font-weight:600}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  thead tr{background:#ff6b00}thead th{padding:10px;color:#fff;font-size:12px;text-align:left}
  .totals{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
  .totals-box{background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:16px}
  .tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid #fef9c3}
  .tot-grand{background:#ff6b00;color:#fff;font-weight:800;font-size:16px;padding:10px 14px;border-radius:8px;display:flex;justify-content:space-between;margin-top:8px}
  .qr-box{text-align:center;background:#fff;border:1.5px solid #fde68a;border-radius:10px;padding:16px}
  .footer{background:#ff6b00;color:#fff;text-align:center;padding:14px;margin-top:24px}
  @media print{.no-print{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="no-print" style="text-align:center;padding:12px;background:#fffbeb;position:sticky;top:0;border-bottom:2px solid #fde68a">
  <button onclick="window.print()" style="background:#ff6b00;color:#fff;border:none;padding:9px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin:0 6px">🖨️ Print</button>
  <button onclick="window.print()" style="background:#15803d;color:#fff;border:none;padding:9px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin:0 6px">📥 Download / Save PDF</button>
  <button onclick="window.close()" style="background:#6b7280;color:#fff;border:none;padding:9px 20px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin:0 6px">✕ Close</button>
</div>
<div class="header">
  <div class="shop-name">🙏 ${settings.shopName||'Shri Ganesh Murti Bhandar'}</div>
  <div style="font-size:12px;opacity:.85;margin-top:4px">${settings.shopAddress||''}</div>
  <div style="font-size:12px;opacity:.85">${[settings.mobile,settings.email].filter(Boolean).join(' | ')}</div>
  ${settings.gstNumber?`<div style="font-size:11px;opacity:.75">GSTIN: ${settings.gstNumber}</div>`:''}
</div>
<div class="body">
  <div class="inv-grid">
    <div class="info-card">
      <div class="lbl">Invoice Details</div>
      <div class="val" style="color:#b45309;font-size:15px">${invoice.invoiceNo}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px">TXN: ${invoice.transactionId||''}</div>
      <div style="font-size:11px;color:#6b7280">${new Date(invoice.invoiceDate||Date.now()).toLocaleString('en-IN')}</div>
      <div style="margin-top:8px"><span style="padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;background:${statusColors[invoice.paymentStatus]||'#888'}">${invoice.paymentStatus}</span></div>
    </div>
    <div class="info-card">
      <div class="lbl">Bill To</div>
      <div class="val" style="font-size:15px">${invoice.customerName}</div>
      ${invoice.customerMobile?`<div style="font-size:12px;color:#6b7280;margin-top:2px">📞 ${invoice.customerMobile}</div>`:''}
      <div style="font-size:12px;margin-top:6px;font-weight:600">Payment: ${invoice.paymentMethod}</div>
    </div>
  </div>
  <table>
    <thead><tr><th style="width:30px">#</th><th>Product</th><th style="width:50px;text-align:center">Qty</th><th style="width:90px;text-align:right">Unit Price</th><th style="width:90px;text-align:right">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    ${qrUrl?`<div class="qr-box"><img src="${qrUrl}" style="width:140px;height:140px" alt="UPI QR">
      <div style="font-size:11px;font-weight:700;color:#92400e;margin-top:8px">Scan to Pay with UPI</div>
      <div style="font-size:10px;color:#6b7280">PhonePe | GPay | Paytm | BHIM</div>
      <div style="font-size:10px;color:#6b7280;margin-top:4px">UPI: ${settings.upiId||''}</div>
      <div style="font-size:11px;font-weight:700;color:#b45309;margin-top:6px">Amount: ${fmt(invoice.paidAmount > 0 ? invoice.paidAmount : (invoice.remainingAmount || invoice.totalAmount))}</div></div>`:'<div></div>'}
    <div class="totals-box">
      <div class="tot-row"><span>Subtotal</span><span>${fmt(invoice.subtotal||invoice.totalAmount)}</span></div>
      ${(invoice.discount||0)>0?`<div class="tot-row"><span>Discount</span><span>- ${fmt(invoice.discount)}</span></div>`:''}
      <div class="tot-row" style="font-weight:700"><span>Total Amount</span><span>${fmt(invoice.totalAmount)}</span></div>
      <div class="tot-row" style="color:#15803d;font-weight:600"><span>✅ Paid</span><span>${fmt(invoice.paidAmount)}</span></div>
      <div class="tot-row" style="color:${invoice.remainingAmount>0?'#b91c1c':'#15803d'};font-weight:600"><span>${invoice.remainingAmount>0?'⚠️ Remaining':'✅ Remaining'}</span><span>${fmt(invoice.remainingAmount)}</span></div>
      <div class="tot-grand"><span>GRAND TOTAL</span><span>${fmt(invoice.totalAmount)}</span></div>
    </div>
  </div>
  ${invoice.notes?`<div style="margin-top:16px;padding:10px 14px;background:#f9fafb;border-radius:8px;font-size:12px;color:#6b7280"><strong>Note:</strong> ${invoice.notes}</div>`:''}
</div>
<div class="footer">
  <div style="font-size:16px;font-weight:800">🙏 Ganpati Bappa Morya! Thank you for your purchase. 🙏</div>
  <div style="font-size:11px;opacity:.8;margin-top:4px">This is a computer-generated invoice.</div>
</div></body></html>`;

  let w = targetWindow;
  if (!w || w.closed) {
    w = window.open('', '_blank');
  }
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
};
