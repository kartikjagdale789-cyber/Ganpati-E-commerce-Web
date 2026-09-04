import React from 'react';
import { StatusBadge } from '../Badge/Badge';
import QRCode from '../QRCode/QRCode';
import Button from '../Button/Button';
import { fmt } from '../../utils/format';
import { printInvoice } from '../../utils/printInvoice';
import './Invoice.css';

const Invoice = ({ invoice, settings, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="invoice">
      <div className="invoice__actions">
        <Button onClick={() => printInvoice(invoice, settings)}>🖨️ Print / PDF</Button>
        {onClose && <Button variant="info" onClick={onClose}>Close</Button>}
      </div>

      <div className="invoice__header">
        <div className="invoice__shop-name">🙏 {settings.shopName}</div>
        <div className="invoice__shop-sub">{settings.shopAddress}</div>
        <div className="invoice__shop-sub">{[settings.mobile, settings.email].filter(Boolean).join(' | ')}</div>
        {settings.gstNumber && <div className="invoice__shop-sub">GSTIN: {settings.gstNumber}</div>}
      </div>

      <div className="invoice__meta">
        <div className="invoice__meta-card">
          <div className="invoice__meta-label">Invoice Details</div>
          <div className="invoice__inv-no">{invoice.invoiceNo}</div>
          <div className="invoice__meta-sub">TXN: {invoice.transactionId}</div>
          <div className="invoice__meta-sub">{new Date(invoice.invoiceDate).toLocaleString('en-IN')}</div>
          <div style={{marginTop:8}}><StatusBadge status={invoice.paymentStatus} /></div>
        </div>
        <div className="invoice__meta-card">
          <div className="invoice__meta-label">Bill To</div>
          <div className="invoice__customer-name">{invoice.customerName}</div>
          {invoice.customerMobile && <div className="invoice__meta-sub">📞 {invoice.customerMobile}</div>}
          {invoice.customerEmail  && <div className="invoice__meta-sub">✉ {invoice.customerEmail}</div>}
          <div className="invoice__meta-sub" style={{marginTop:6}}>Payment: <strong>{invoice.paymentMethod}</strong></div>
        </div>
      </div>

      <div className="invoice__table-wrap">
        <table className="invoice__table">
          <thead><tr>
            {['#','Product','Qty','Unit Price','Total'].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(invoice.items||[]).map((item, i) => (
              <tr key={i} style={{background: i%2===0?'#fff':'#fffbf0'}}>
                <td>{i+1}</td>
                <td><div className="invoice__item-name">{item.emoji||'🙏'} {item.name}</div>
                    <div className="invoice__item-sub">{item.type} | {item.height} | {item.color}</div></td>
                <td className="center">{item.qty}</td>
                <td className="right">{fmt(item.unitPrice)}</td>
                <td className="right bold green">{fmt(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice__totals">
        {invoice.upiQrData && (
          <div className="invoice__qr-box">
            <div className="invoice__qr-title">📱 Scan to Pay with UPI</div>
            <QRCode data={invoice.upiQrData} image={invoice.upiQrImage} size={160} />
            <div className="invoice__qr-apps">PhonePe | GPay | Paytm | BHIM</div>
            {settings.upiId && <div className="invoice__qr-upi">{settings.upiId}</div>}
            <div className="invoice__qr-amount">{fmt(invoice.paidAmount)}</div>
          </div>
        )}
        <div className="invoice__totals-box">
          {[
            ['Subtotal', invoice.subtotal || invoice.totalAmount, '#374151', false],
            invoice.discount > 0 ? ['Discount', -invoice.discount, '#b91c1c', false] : null,
            ['Total Amount', invoice.totalAmount, '#374151', true],
            ['✅ Paid Amount', invoice.paidAmount, '#15803d', false],
            [invoice.remainingAmount > 0 ? '⚠️ Remaining' : '✅ Remaining',
              invoice.remainingAmount, invoice.remainingAmount > 0 ? '#b91c1c' : '#15803d', false],
          ].filter(Boolean).map(([l, v, c, bold]) => (
            <div key={l} className={`invoice__tot-row${bold?' invoice__tot-row--bold':''}`} style={{color:c}}>
              <span>{l}</span><span>{fmt(Math.abs(v))}</span>
            </div>
          ))}
          <div className="invoice__grand-total">
            <span>GRAND TOTAL</span><span>{fmt(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="invoice__footer">🙏 Ganpati Bappa Morya! Thank you for your purchase. 🙏</div>
    </div>
  );
};

export default Invoice;
