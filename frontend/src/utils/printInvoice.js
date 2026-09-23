export const printInvoice = (invoice, settings = {}, targetWindow = null) => {
  const s = (invoice.shopDetails && invoice.shopDetails.shopName) ? invoice.shopDetails : (settings || {});
  const statusColors = { Paid: '#15803d', 'Partial Payment': '#b45309', Unpaid: '#b91c1c' };
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const qrUrl = invoice.upiQrImage || (invoice.upiQrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(invoice.upiQrData)}&margin=8`
    : '');

  const shopMobile = [s.mobileNumber || s.mobile, s.alternateMobile].filter(Boolean).join(' / ');
  const shopContact = [shopMobile, s.email].filter(Boolean).join(' &nbsp;|&nbsp; ');

  const rows = (invoice.items || []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fffdfa'};">
      <td style="padding:9px 12px;border-bottom:1px solid #fde68a;text-align:center;font-weight:600;color:#78350f;">${i + 1}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #fde68a;">
        <strong style="color:#1c1917;font-size:13px;">${item.name}</strong><br>
        <small style="color:#78716c;font-size:11px;">${[item.type, item.height, item.color].filter(Boolean).join(' | ')}</small>
      </td>
      <td style="padding:9px 12px;border-bottom:1px solid #fde68a;text-align:center;font-weight:600;">${item.qty}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #fde68a;text-align:right;color:#44403c;">${fmt(item.unitPrice)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #fde68a;text-align:right;font-weight:700;color:#7f1d1d;">${fmt(item.totalPrice)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Invoice — ${invoice.invoiceNo} — ${s.shopName || 'Shop'}</title>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      background: #fafaf9;
      padding: 0;
    }
    .no-print {
      text-align: center;
      padding: 12px;
      background: #fffbeb;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 2px solid #fde68a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .no-print button {
      border: none;
      padding: 9px 24px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      margin: 0 6px;
      transition: opacity 0.2s;
    }
    .no-print button:hover { opacity: 0.9; }
    .btn-print { background: #ea580c; color: #fff; }
    .btn-pdf { background: #15803d; color: #fff; }
    .btn-close { background: #6b7280; color: #fff; }

    .invoice-wrapper {
      max-width: 820px;
      margin: 20px auto 40px;
      background: #ffffff;
      border: 2px solid #b45309;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(180, 83, 9, 0.12);
    }

    /* Auspicious Top Header */
    .auspicious-bar {
      background: #7f1d1d;
      color: #fef3c7;
      text-align: center;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      border-bottom: 1px solid #b45309;
    }

    /* Main Shop Header */
    .shop-header {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fed7aa 100%);
      padding: 20px 28px;
      border-bottom: 2.5px solid #b45309;
      position: relative;
    }
    .shop-banner-img {
      width: 100%;
      max-height: 100px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 12px;
      border: 1px solid #fde68a;
    }
    .header-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .shop-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .shop-logo-img {
      height: 64px;
      width: 64px;
      object-fit: contain;
      border-radius: 10px;
      background: #fff;
      padding: 4px;
      border: 1.5px solid #f59e0b;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .shop-name-title {
      font-size: 26px;
      font-weight: 900;
      color: #7f1d1d;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .shop-tagline {
      font-size: 11px;
      font-weight: 800;
      color: #c2410c;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .shop-details {
      font-size: 12px;
      color: #451a03;
      margin-top: 4px;
      line-height: 1.4;
    }
    .shop-extra {
      font-size: 11px;
      color: #78350f;
      margin-top: 2px;
    }

    /* Invoice Meta & Customer Grid */
    .content-body {
      padding: 20px 28px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .meta-box {
      background: #fffdfa;
      border: 1.5px solid #fde68a;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .box-heading {
      display: inline-block;
      background: #7f1d1d;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 3px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .customer-row {
      font-size: 12px;
      margin-bottom: 4px;
      color: #44403c;
    }
    .customer-row strong {
      color: #1c1917;
    }
    .customer-name {
      font-size: 15px;
      font-weight: 800;
      color: #7f1d1d;
      margin-bottom: 6px;
    }
    .inv-detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 2px 0;
      color: #44403c;
    }
    .inv-detail-row strong {
      color: #1c1917;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 1px solid #fde68a;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table thead tr {
      background: #7f1d1d;
      color: #ffffff;
    }
    .items-table thead th {
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }

    /* Bottom Summary & QR */
    .bottom-section {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 20px;
      align-items: start;
    }
    .qr-section {
      background: #fffdfa;
      border: 1.5px solid #fde68a;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
    }
    .qr-title {
      font-size: 11px;
      font-weight: 800;
      color: #7f1d1d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .qr-img {
      width: 130px;
      height: 130px;
      border: 1px solid #fde68a;
      border-radius: 6px;
      background: #fff;
      padding: 4px;
    }
    .qr-apps {
      font-size: 10px;
      font-weight: 700;
      color: #78350f;
      margin-top: 4px;
    }
    .qr-upi {
      font-size: 11px;
      font-weight: 600;
      color: #44403c;
      margin-top: 2px;
    }
    .qr-pay-amount {
      font-size: 13px;
      font-weight: 800;
      color: #c2410c;
      margin-top: 4px;
    }

    .summary-box {
      background: #fffdfa;
      border: 1.5px solid #fde68a;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13px;
      border-bottom: 1px dashed #fef3c7;
      color: #44403c;
    }
    .summary-row.bold {
      font-weight: 700;
      color: #1c1917;
    }
    .summary-row.green {
      color: #15803d;
      font-weight: 700;
    }
    .summary-row.red {
      color: #b91c1c;
      font-weight: 700;
    }
    .grand-total-row {
      background: linear-gradient(135deg, #7f1d1d, #991b1b);
      color: #fff;
      font-weight: 900;
      font-size: 15px;
      padding: 10px 14px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      letter-spacing: 0.5px;
    }

    /* Devotional blessing quote */
    .blessing-quote {
      text-align: center;
      margin: 18px 0 10px;
      font-size: 14px;
      font-weight: 800;
      color: #7f1d1d;
      letter-spacing: 0.5px;
    }
    .blessing-sub {
      text-align: center;
      font-size: 11px;
      color: #78716c;
      font-style: italic;
    }

    /* Footer */
    .invoice-footer {
      background: #7f1d1d;
      color: #fef3c7;
      text-align: center;
      padding: 12px 20px;
      border-top: 2px solid #b45309;
    }
    .footer-title {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .footer-contact {
      font-size: 11px;
      opacity: 0.95;
      margin-top: 4px;
    }
    .footer-notice {
      font-size: 10px;
      opacity: 0.75;
      margin-top: 3px;
    }

    @media print {
      .no-print { display: none !important; }
      body {
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .invoice-wrapper {
        margin: 0 !important;
        max-width: 100% !important;
        border: 1.5px solid #b45309 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">Print Invoice</button>
    <button class="btn-pdf" onclick="window.print()">📥 Download / Save PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="invoice-wrapper">
    <!-- Top Auspicious Banner -->
    <div class="auspicious-bar">॥ श्री गणेशाय नमः ॥</div>

    <!-- Shop Header -->
    <div class="shop-header">
      ${s.headerBanner ? `<img src="${resolveUrl(s.headerBanner)}" class="shop-banner-img" alt="Header Banner">` : ''}
      <div class="header-main-row">
        <div class="shop-brand">
          ${s.shopLogo ? `<img src="${resolveUrl(s.shopLogo)}" class="shop-logo-img" alt="Shop Logo">` : '<span class="shop-mark">GB</span>'}
          <div>
            <div class="shop-name-title">${s.shopName || 'Shri Ganesh Murti Bhandar'}</div>
            <div class="shop-tagline">Ganpati Idols • Art • Tradition • Devotion</div>
            <div class="shop-details">${s.shopAddress || s.address || ''}</div>
            ${shopContact ? `<div class="shop-extra">${shopContact}</div>` : ''}
            ${s.gstNumber ? `<div class="shop-extra">GSTIN: <strong>${s.gstNumber}</strong></div>` : ''}
            ${s.instagram ? `<div class="shop-extra">Instagram: <strong>${s.instagram}</strong></div>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="content-body">
      <div class="meta-grid">
        <!-- Customer Details Box -->
        <div class="meta-box">
          <div class="box-heading">Customer Details</div>
          <div class="customer-name">${invoice.customerName}</div>
          ${invoice.customerMobile ? `<div class="customer-row"><strong>Contact:</strong> ${invoice.customerMobile}</div>` : ''}
          ${invoice.customerEmail ? `<div class="customer-row"><strong>Email:</strong> ${invoice.customerEmail}</div>` : ''}
          <div class="customer-row"><strong>Payment Method:</strong> ${invoice.paymentMethod}</div>
        </div>

        <!-- Invoice Details Box -->
        <div class="meta-box">
          <div class="box-heading">Invoice Details</div>
          <div class="inv-detail-row"><span>Invoice No:</span> <strong style="color:#7f1d1d;font-size:13px;">${invoice.invoiceNo}</strong></div>
          <div class="inv-detail-row"><span>Transaction ID:</span> <span>${invoice.transactionId || '—'}</span></div>
          <div class="inv-detail-row"><span>Invoice Date:</span> <span>${new Date(invoice.invoiceDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
          <div class="inv-detail-row" style="margin-top:6px;">
            <span>Payment Status:</span>
            <span style="padding:2px 10px;border-radius:12px;font-size:10px;font-weight:800;color:#fff;background:${statusColors[invoice.paymentStatus] || '#888'};">
              ${invoice.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:45px;text-align:center;">Sr.</th>
            <th>Product Description</th>
            <th style="width:65px;text-align:center;">Qty</th>
            <th style="width:110px;text-align:right;">Unit Price</th>
            <th style="width:110px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <!-- Bottom: QR & Totals -->
      <div class="bottom-section">
        <!-- Left: QR Payment & Notes -->
        <div>
          ${qrUrl && s.upiId ? `
            <div class="qr-section">
              <div class="qr-title">Scan to Pay with UPI</div>
              <img src="${qrUrl}" class="qr-img" alt="UPI Payment QR">
              <div class="qr-apps">PhonePe | Google Pay | Paytm | BHIM</div>
              <div class="qr-upi">UPI: <strong>${s.upiId}</strong></div>
              ${s.bankName ? `<div class="qr-upi" style="font-size:10px;color:#78716c;">Bank: ${s.bankName}</div>` : ''}
              <div class="qr-pay-amount">Amount: ${fmt(invoice.paidAmount > 0 ? invoice.paidAmount : (invoice.remainingAmount || invoice.totalAmount))}</div>
            </div>
          ` : `
            <div class="qr-section" style="padding:30px 10px;color:#78716c;">
              <div class="shop-mark">GB</div>
              <div style="font-size:12px;font-weight:600;margin-top:6px;">Thank you for celebrating with us!</div>
            </div>
          `}
          ${invoice.notes ? `
            <div style="margin-top:12px;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:11px;color:#78350f;">
              <strong>Note:</strong> ${invoice.notes}
            </div>
          ` : ''}
        </div>

        <!-- Right: Summary Box -->
        <div class="summary-box">
          <div class="summary-row"><span>Subtotal</span><span>${fmt(invoice.subtotal || invoice.totalAmount)}</span></div>
          ${(invoice.discount || 0) > 0 ? `<div class="summary-row" style="color:#b91c1c;"><span>Discount</span><span>- ${fmt(invoice.discount)}</span></div>` : ''}
          <div class="summary-row bold"><span>Total Amount</span><span>${fmt(invoice.totalAmount)}</span></div>
          <div class="summary-row green"><span>Paid Amount</span><span>${fmt(invoice.paidAmount)}</span></div>
          <div class="summary-row ${invoice.remainingAmount > 0 ? 'red' : 'green'}">
            <span>Remaining Due</span>
            <span>${fmt(invoice.remainingAmount)}</span>
          </div>
          <div class="grand-total-row">
            <span>GRAND TOTAL</span>
            <span>${fmt(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      <!-- Devotional Blessing -->
      <div class="blessing-quote">Thank you for your purchase.</div>
      <div class="blessing-sub">May Lord Ganesha shower blessings, happiness, and prosperity upon your home.</div>
    </div>

    <!-- Footer Banner -->
    <div class="invoice-footer">
      <div class="footer-title">${s.footerMessage || 'Thank you for your purchase.'}</div>
      ${shopMobile ? `<div class="footer-contact">Contact No. : <strong>${shopMobile}</strong>${s.email ? ` &nbsp;|&nbsp; ${s.email}` : ''}</div>` : ''}
      <div class="footer-notice">This is a computer-generated invoice. No physical signature required.</div>
    </div>
  </div>
</body>
</html>`;

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

