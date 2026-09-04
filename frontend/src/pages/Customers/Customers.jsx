import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Modal from '../../components/Modal/Modal';
import Invoice from '../../components/Invoice/Invoice';
import Button from '../../components/Button/Button';
import { useSettings } from '../../context/SettingsContext';
import { customerAPI, invoiceAPI } from '../../api';
import { fmt } from '../../utils/format';
import './Customers.css';

const Customers = () => {
  const { settings } = useSettings();
  const [customers, setCustomers] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [viewInvoice, setViewInvoice] = useState(null);

  useEffect(() => {
    customerAPI.getAll().then(res => setCustomers(res.data)).catch(() => {});
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  const openCustomer = (c) => {
    setSelected(c);
    customerAPI.getInvoices(c._id).then(res => setCustomerInvoices(res.data)).catch(() => setCustomerInvoices([]));
  };

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.mobile || '').includes(search)
  );

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">👥 Customers</h2>

      <div className="cust-search">
        <input placeholder="🔍 Search customer by name or mobile..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="cust-table">
          <thead><tr>{['Name','Mobile','Email','Purchases','Total Spent','Due Amount'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c._id} style={{ background: i % 2 === 0 ? '#fff' : '#fffbf0', cursor: 'pointer' }} onClick={() => openCustomer(c)}>
                <td className="cell-bold">{c.name}</td>
                <td className="cell-muted">{c.mobile || '—'}</td>
                <td className="cell-muted">{c.email || '—'}</td>
                <td className="cell-center">{c.totalPurchases}</td>
                <td className="cell-green">{fmt(c.totalAmount)}</td>
                <td className={c.totalDue > 0 ? 'cell-red' : 'cell-green'}>{fmt(c.totalDue)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="empty-row">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={`👤 ${selected.name} — Purchase History`} onClose={() => setSelected(null)} wide>
          <div className="cust-detail-grid">
            <div className="cust-detail-box"><div className="cust-detail-label">Mobile</div><div className="cust-detail-value">{selected.mobile || '—'}</div></div>
            <div className="cust-detail-box"><div className="cust-detail-label">Total Purchases</div><div className="cust-detail-value">{selected.totalPurchases}</div></div>
            <div className="cust-detail-box"><div className="cust-detail-label">Total Spent</div><div className="cust-detail-value cell-green">{fmt(selected.totalAmount)}</div></div>
            <div className="cust-detail-box"><div className="cust-detail-label">Due Amount</div><div className="cust-detail-value cell-red">{fmt(selected.totalDue)}</div></div>
          </div>
          <table className="cust-inv-table">
            <thead><tr>{['Invoice','Total','Paid','Remaining','Status','Date',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {customerInvoices.map(inv => (
                <tr key={inv._id}>
                  <td className="cell-invoice">{inv.invoiceNo}</td>
                  <td className="cell-bold">{fmt(inv.totalAmount)}</td>
                  <td className="cell-green">{fmt(inv.paidAmount)}</td>
                  <td className={inv.remainingAmount > 0 ? 'cell-red' : 'cell-green'}>{fmt(inv.remainingAmount)}</td>
                  <td>{inv.paymentStatus}</td>
                  <td className="cell-muted">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                  <td><Button variant="info" small onClick={() => setViewInvoice(inv)}>👁️</Button></td>
                </tr>
              ))}
              {customerInvoices.length === 0 && <tr><td colSpan={7} className="empty-row">No purchases yet.</td></tr>}
            </tbody>
          </table>
        </Modal>
      )}

      {viewInvoice && (
        <Modal title={`🧾 Invoice — ${viewInvoice.invoiceNo}`} onClose={() => setViewInvoice(null)} xlarge>
          <Invoice invoice={viewInvoice} settings={settings} onClose={() => setViewInvoice(null)} />
        </Modal>
      )}
    </Layout>
  );
};

export default Customers;
