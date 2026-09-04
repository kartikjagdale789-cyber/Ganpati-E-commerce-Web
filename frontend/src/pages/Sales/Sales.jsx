import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Invoice from '../../components/Invoice/Invoice';
import { StatusBadge } from '../../components/Badge/Badge';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { invoiceAPI } from '../../api';
import { fmt } from '../../utils/format';
import { printInvoice } from '../../utils/printInvoice';
import './Sales.css';

const Sales = () => {
  const { settings } = useSettings();
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [search, setSearch] = useState('');
  const [dateF, setDateF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [viewInvoice, setViewInvoice] = useState(null);
  const [receivePayInv, setReceivePayInv] = useState(null);

  const load = () => invoiceAPI.getAll({ page: 1, limit: 200 }).then(res => setInvoices(res.data)).catch(() => {});

  useEffect(() => {
    load();
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  const filtered = invoices.filter(i => {
    const q = search.toLowerCase();
    if (q && !i.invoiceNo.toLowerCase().includes(q) && !i.customerName.toLowerCase().includes(q)) return false;
    if (dateF && !i.invoiceDate?.startsWith(dateF)) return false;
    if (statusF && i.paymentStatus !== statusF) return false;
    return true;
  });
  const totalShown = filtered.reduce((s, i) => s + i.totalAmount, 0);

  const receivePayment = async (amount, method) => {
    try {
      const res = await invoiceAPI.receivePayment(receivePayInv._id, { amount, method });
      toast.toast(res.message);
      setReceivePayInv(null);
      load();
      invoiceAPI.getDues().then(r => setDueCount((r.data || []).length));
    } catch (err) { toast.toast(err.message || 'Payment failed', 'error'); }
  };

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">📋 Sales History ({invoices.length} records)</h2>

      <Card style={{ marginBottom: 14, padding: 14 }}>
        <div className="sales-filter-grid">
          <input placeholder="🔍 Search invoice, customer..." value={search} onChange={e => setSearch(e.target.value)} />
          <input type="date" value={dateF} onChange={e => setDateF(e.target.value)} />
          <select value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Paid</option><option>Partial Payment</option><option>Unpaid</option>
          </select>
          <Button variant="ghost" onClick={() => { setSearch(''); setDateF(''); setStatusF(''); }}>Clear</Button>
        </div>
      </Card>

      <div className="table-container">
        <table className="sales-table">
          <thead><tr>{['Invoice','Customer','Items','Total','Paid','Remaining','Status','Date','Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((i, idx) => (
              <tr key={i._id} style={{ background: idx % 2 === 0 ? '#fff' : '#fffbf0' }}>
                <td className="cell-invoice">{i.invoiceNo}</td>
                <td><div className="cell-bold">{i.customerName}</div>{i.customerMobile && <div className="cell-sub">{i.customerMobile}</div>}</td>
                <td className="cell-muted">{(i.items || []).length}</td>
                <td className="cell-bold">{fmt(i.totalAmount)}</td>
                <td className="cell-green">{fmt(i.paidAmount)}</td>
                <td className={i.remainingAmount > 0 ? 'cell-red' : 'cell-green'}>{fmt(i.remainingAmount)}</td>
                <td><StatusBadge status={i.paymentStatus} /></td>
                <td className="cell-sub">{new Date(i.invoiceDate).toLocaleDateString('en-IN')}</td>
                <td>
                  <div className="row-actions">
                    <Button variant="info" small onClick={() => setViewInvoice(i)}>👁️</Button>
                    <Button small onClick={() => printInvoice(i, settings)}>🖨️</Button>
                    {i.remainingAmount > 0 && <Button variant="success" small onClick={() => setReceivePayInv(i)}>💰</Button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="empty-row">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && <div className="total-shown">Total Shown: {fmt(totalShown)}</div>}

      {viewInvoice && (
        <Modal title={`🧾 Invoice — ${viewInvoice.invoiceNo}`} onClose={() => setViewInvoice(null)} xlarge>
          <Invoice invoice={viewInvoice} settings={settings} onClose={() => setViewInvoice(null)} />
        </Modal>
      )}

      {receivePayInv && (
        <ReceivePaymentModal invoice={receivePayInv} onClose={() => setReceivePayInv(null)} onSave={receivePayment} />
      )}
    </Layout>
  );
};

const ReceivePaymentModal = ({ invoice, onClose, onSave }) => {
  const [amount, setAmount] = useState(invoice.remainingAmount);
  const [method, setMethod] = useState('Cash');
  return (
    <Modal title={`💰 Receive Payment — ${invoice.invoiceNo}`} onClose={onClose}>
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
    </Modal>
  );
};

export default Sales;
