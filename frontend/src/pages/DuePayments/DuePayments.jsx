import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Invoice from '../../components/Invoice/Invoice';
import QRCode from '../../components/QRCode/QRCode';
import { StatusBadge } from '../../components/Badge/Badge';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { invoiceAPI } from '../../api';
import { fmt } from '../../utils/format';
import { buildUPIString } from '../../utils/upi';
import './DuePayments.css';

const DuePayments = () => {
  const { settings } = useSettings();
  const toast = useToast();
  const [dues, setDues] = useState([]);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [receivePayInv, setReceivePayInv] = useState(null);

  const load = () => invoiceAPI.getDues().then(res => setDues(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const totalDue = dues.reduce((s, i) => s + i.remainingAmount, 0);

  const receivePayment = async (amount, method) => {
    try {
      const res = await invoiceAPI.receivePayment(receivePayInv._id, { amount, method });
      toast.toast(res.message);
      setReceivePayInv(null);
      load();
    } catch (err) { toast.toast(err.message || 'Payment failed', 'error'); }
  };

  return (
    <Layout dueCount={dues.length}>
      <h2 className="page-title">💰 Customer Due List</h2>
      <div className="due-stats">
        <div className="due-stat due-stat--red">
          <div className="due-stat__label">TOTAL PENDING</div>
          <div className="due-stat__value">{fmt(totalDue)}</div>
        </div>
        <div className="due-stat due-stat--amber">
          <div className="due-stat__label">DUE CUSTOMERS</div>
          <div className="due-stat__value">{dues.length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="due-table">
          <thead><tr>{['Customer','Invoice','Mobile','Date','Total','Paid','⚠️ Due','Status','QR','Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {dues.map((i, idx) => (
              <tr key={i._id} style={{ background: idx % 2 === 0 ? '#fff' : '#fff5f5' }}>
                <td className="cell-bold">{i.customerName}</td>
                <td className="cell-invoice">{i.invoiceNo}</td>
                <td className="cell-muted">{i.customerMobile || '—'}</td>
                <td className="cell-sub">{new Date(i.invoiceDate).toLocaleDateString('en-IN')}</td>
                <td className="cell-bold">{fmt(i.totalAmount)}</td>
                <td className="cell-green">{fmt(i.paidAmount)}</td>
                <td className="cell-due">{fmt(i.remainingAmount)}</td>
                <td><StatusBadge status={i.paymentStatus} /></td>
                <td>
                  {settings.upiId && i.remainingAmount > 0 && (
                    <QRCode data={buildUPIString(settings, i.remainingAmount, i.invoiceNo, i.customerName)} size={60} />
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <Button variant="info" small onClick={() => setViewInvoice(i)}>👁️</Button>
                    <Button variant="success" small onClick={() => setReceivePayInv(i)}>💰 Receive</Button>
                  </div>
                </td>
              </tr>
            ))}
            {dues.length === 0 && <tr><td colSpan={10} className="empty-row-success">🎉 No pending dues! All payments received.</td></tr>}
          </tbody>
        </table>
      </div>

      {viewInvoice && (
        <Modal title={`🧾 Invoice — ${viewInvoice.invoiceNo}`} onClose={() => setViewInvoice(null)} xlarge>
          <Invoice invoice={viewInvoice} settings={settings} onClose={() => setViewInvoice(null)} />
        </Modal>
      )}

      {receivePayInv && (
        <Modal title={`💰 Receive Payment — ${receivePayInv.invoiceNo}`} onClose={() => setReceivePayInv(null)}>
          <DueReceiveForm invoice={receivePayInv} settings={settings} onSave={receivePayment} onClose={() => setReceivePayInv(null)} />
        </Modal>
      )}
    </Layout>
  );
};

const DueReceiveForm = ({ invoice, settings, onSave, onClose }) => {
  const [amount, setAmount] = useState(invoice.remainingAmount);
  const [method, setMethod] = useState('Cash');
  const upiStr = buildUPIString(settings, amount, invoice.invoiceNo, invoice.customerName);
  return (
    <div className="due-receive-grid">
      <div>
        <div className="pay-summary">
          <div className="pay-row"><span>Total Amount</span><strong>{fmt(invoice.totalAmount)}</strong></div>
          <div className="pay-row" style={{ color: '#15803d' }}><span>Already Paid</span><strong>{fmt(invoice.paidAmount)}</strong></div>
          <div className="pay-row pay-row--due"><span>Remaining Due</span><strong>{fmt(invoice.remainingAmount)}</strong></div>
        </div>
        <div className="field"><label>Amount to Receive (₹)</label>
          <input type="number" value={amount} max={invoice.remainingAmount} min={1} onChange={e => setAmount(Math.min(+e.target.value, invoice.remainingAmount))} />
        </div>
        <div className="field"><label>Payment Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            {['Cash','UPI','Card','Bank Transfer','Cheque'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} full>Cancel</Button>
          <Button onClick={() => onSave(+amount, method)} full>✅ Receive {fmt(amount)}</Button>
        </div>
      </div>
      <div className="due-receive-qr">
        <div className="due-receive-qr__title">📱 Scan UPI QR to Receive</div>
        {upiStr ? <QRCode data={upiStr} size={160} /> : <div className="due-receive-qr__empty">Set UPI ID in Settings</div>}
        {settings.upiId && <div className="due-receive-qr__id">{settings.upiId}<br />{settings.shopName}</div>}
        <div className="due-receive-qr__amount">Amount: {fmt(amount)}</div>
      </div>
    </div>
  );
};

export default DuePayments;
