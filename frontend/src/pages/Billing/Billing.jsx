import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import QRCode from '../../components/QRCode/QRCode';
import { StatusBadge } from '../../components/Badge/Badge';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { inventoryAPI, invoiceAPI, qrAPI } from '../../api';
import { fmt } from '../../utils/format';
import { buildUPIString } from '../../utils/upi';
import Modal from '../../components/Modal/Modal';
import Invoice from '../../components/Invoice/Invoice';
import { printInvoice } from '../../utils/printInvoice';
import './Billing.css';

/* ─── UPI Payment Panel ─────────────────────────────────────────────────── */
const UPIPaymentPanel = ({ settings, paid, invoiceNo, customerName, onConfirm, canConfirm }) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isUpiSet = !!settings.upiId;
  const previewInvNo = invoiceNo || 'INV-PREVIEW';
  const upiString = isUpiSet && paid > 0 ? buildUPIString(settings, paid, previewInvNo, customerName || 'Customer') : '';

  const copyUpiId = () => {
    if (!settings.upiId) return;
    navigator.clipboard.writeText(settings.upiId).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      const el = document.createElement('input');
      el.value = settings.upiId; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  const openUpiApp = () => {
    if (!upiString) return;
    window.location.href = upiString;
    setTimeout(() => { try { window.open(upiString, '_blank'); } catch {} }, 1200);
  };

  if (!isUpiSet) {
    return (
      <div className="upi-panel upi-panel--warning">
        <div className="upi-panel__warn-icon">⚠️</div>
        <div className="upi-panel__warn-title">UPI ID Not Configured</div>
        <div className="upi-panel__warn-text">Go to Settings → Banking &amp; UPI and add your UPI ID to enable QR payments.</div>
        <div className="upi-panel__warn-hint">e.g. yourshop@paytm • yourname@upi • number@ybl</div>
      </div>
    );
  }

  return (
    <div className="upi-panel">
      <div className="upi-panel__header">
        <span className="upi-panel__header-icon">📱</span>
        <div>
          <div className="upi-panel__header-title">UPI Payment</div>
          <div className="upi-panel__header-sub">Scan QR or tap Open in UPI App</div>
        </div>
        <div className="upi-panel__header-amount">{fmt(paid)}</div>
      </div>

      <div className="upi-panel__body">
        {paid <= 0 ? (
          <div className="upi-panel__empty">
            <div className="upi-panel__empty-icon">💰</div>
            <div>Enter a Paid Amount above to generate the QR</div>
          </div>
        ) : (
          <>
            <div className="upi-panel__qr-wrap">
              <div className="upi-panel__qr-card">
                <QRCode data={upiString} size={180} />
                <div className="upi-panel__qr-caption">SCAN TO PAY</div>
                <div className="upi-panel__qr-amount">{fmt(paid)}</div>
              </div>
            </div>

            <div className="upi-panel__apps">
              {[['📱','PhonePe','#5f259f'],['🟢','GPay','#1a73e8'],['💙','Paytm','#002970'],['🇮🇳','BHIM','#138808']].map(([ic, lbl, clr]) => (
                <div key={lbl} className="upi-panel__app">
                  <div className="upi-panel__app-icon" style={{ background: clr }}>{ic}</div>
                  <div className="upi-panel__app-label">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="upi-panel__id-row">
              <div>
                <div className="upi-panel__id-label">UPI ID</div>
                <div className="upi-panel__id-value">{settings.upiId}</div>
              </div>
              <button className={`upi-panel__copy-btn${copied ? ' upi-panel__copy-btn--copied' : ''}`} onClick={copyUpiId}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>

            <div className="upi-panel__detail-grid">
              <div className="upi-panel__detail-box">
                <div className="upi-panel__detail-label">Amount</div>
                <div className="upi-panel__detail-value upi-panel__detail-value--cyan">{fmt(paid)}</div>
              </div>
              <div className="upi-panel__detail-box">
                <div className="upi-panel__detail-label">Note</div>
                <div className="upi-panel__detail-value">{previewInvNo}</div>
              </div>
            </div>

            <button className="upi-panel__open-btn" onClick={openUpiApp}>
              📲 Open in UPI App <span>→ PhonePe / GPay / Paytm</span>
            </button>
          </>
        )}

        <div className="upi-panel__confirm-wrap">
          {!confirmed ? (
            <button
              className="upi-panel__confirm-btn"
              disabled={!canConfirm || paid <= 0}
              onClick={async () => {
                if (!canConfirm || paid <= 0) return;
                setConfirmed(true);
                const ok = await onConfirm();
                if (!ok) setConfirmed(false);
              }}
            >
              ✅ I Have Received Payment — Generate Invoice
            </button>
          ) : (
            <div className="upi-panel__confirmed">
              <div className="upi-panel__confirmed-icon">🎉</div>
              <div className="upi-panel__confirmed-title">Payment Confirmed!</div>
              <div className="upi-panel__confirmed-sub">Invoice is being generated...</div>
            </div>
          )}
          {!canConfirm && paid > 0 && <div className="upi-panel__confirm-hint">⬆ Fill customer name &amp; add items first</div>}
        </div>
      </div>
    </div>
  );
};

/* ─── Billing Page ──────────────────────────────────────────────────────── */
const Billing = () => {
  const toast = useToast();
  const { settings } = useSettings();
  const [inventory, setInventory] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [form, setForm] = useState({ customerName: '', customerMobile: '', customerEmail: '', paymentMethod: 'Cash', paidAmount: 0, discount: 0, notes: '' });
  const [cartItems, setCartItems] = useState([]);
  const [selectedG, setSelectedG] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  useEffect(() => {
    inventoryAPI.getAll().then(res => setInventory(res.data)).catch(() => {});
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  const subtotal = cartItems.reduce((s, i) => s + i.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - (form.discount || 0));
  const paid = Math.min(form.paidAmount || 0, totalAmount);
  const remaining = totalAmount - paid;
  const payStatus = paid >= totalAmount ? 'Paid' : paid > 0 ? 'Partial Payment' : 'Unpaid';
  const isUPI = form.paymentMethod === 'UPI';
  const canGenerate = cartItems.length > 0 && form.customerName.trim().length > 0;

  const setPayMethod = (method) => {
    setForm(f => ({ ...f, paymentMethod: method, paidAmount: method === 'UPI' ? totalAmount : f.paidAmount }));
  };

  useEffect(() => {
    if (isUPI) setForm(f => ({ ...f, paidAmount: totalAmount }));
  }, [totalAmount, isUPI]);

  const addToCart = () => {
    const g = inventory.find(x => x._id === selectedG);
    if (!g) return toast.toast('Select a Ganpati first', 'error');
    if (selectedQty > g.qty) return toast.toast(`Only ${g.qty} in stock!`, 'error');
    const existing = cartItems.findIndex(i => i.ganpatiId === g._id);
    if (existing >= 0) {
      setCartItems(c => c.map((x, i) => i === existing ? { ...x, qty: x.qty + +selectedQty, totalPrice: (x.qty + +selectedQty) * x.unitPrice } : x));
    } else {
      setCartItems(c => [...c, { ganpatiId: g._id, inventoryRef: g._id, name: g.name, type: g.type, height: g.height, color: g.color, emoji: g.emoji, qty: +selectedQty, unitPrice: g.price, totalPrice: g.price * +selectedQty }]);
    }
    setSelectedG(''); setSelectedQty(1);
  };

  const doGenerate = async () => {
    if (!form.customerName.trim()) {
      return toast.toast('Please enter customer name', 'error');
    }
    if (cartItems.length === 0) {
      return toast.toast('Please add at least one item to cart', 'error');
    }
    if ((form.discount || 0) < 0) {
      return toast.toast('Discount cannot be negative', 'error');
    }
    if ((form.discount || 0) > subtotal) {
      return toast.toast('Discount cannot exceed subtotal', 'error');
    }
    if ((form.paidAmount || 0) < 0) {
      return toast.toast('Paid amount cannot be negative', 'error');
    }

    try {
      const res = await invoiceAPI.create({
        customerName: form.customerName.trim(),
        customerMobile: form.customerMobile?.trim() || '',
        customerEmail: form.customerEmail?.trim() || '',
        items: cartItems,
        paidAmount: paid,
        discount: form.discount || 0,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });

      const invoiceData = res.data;

      /* 1. Ensure dynamic UPI QR code is generated before rendering */
      const qrAmount = invoiceData.paidAmount > 0 ? invoiceData.paidAmount : invoiceData.totalAmount;
      if (settings?.upiId && qrAmount > 0 && !invoiceData.upiQrImage) {
        try {
          const qrRes = await qrAPI.generate({
            amount: qrAmount,
            invoiceNo: invoiceData.invoiceNo,
            customerName: invoiceData.customerName,
          });
          if (qrRes?.qrImage) {
            invoiceData.upiQrImage = qrRes.qrImage;
            if (qrRes.upiString) invoiceData.upiQrData = qrRes.upiString;
          } else {
            throw new Error('Failed to generate UPI QR code');
          }
        } catch (qrErr) {
          throw new Error(qrErr.message || 'Failed to generate UPI QR code');
        }
      }

      /* 2. Wait until QR code image is fully loaded and ready in browser memory */
      const qrImageUrl = invoiceData.upiQrImage || (invoiceData.upiQrData ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(invoiceData.upiQrData)}&margin=8` : null);
      if (qrImageUrl) {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to generate or load QR code image'));
          img.src = qrImageUrl;
        });
      }

      /* 3. Only after QR Code is ready: Show Invoice Preview, Generate PDF, and Open in new tab */
      setGeneratedInvoice(invoiceData);
      setCartItems([]);
      setForm({ customerName: '', customerMobile: '', customerEmail: '', paymentMethod: 'Cash', paidAmount: 0, discount: 0, notes: '' });
      toast.toast('Invoice generated & inventory updated!');
      inventoryAPI.getAll().then(r => setInventory(r.data));
      invoiceAPI.getDues().then(r => setDueCount((r.data || []).length)).catch(() => {});

      printInvoice(invoiceData, settings);
      return true;
    } catch (err) {
      toast.toast(err.message || 'Failed to generate invoice', 'error');
      return false;
    }
  };

  const resetBill = () => {
    setGeneratedInvoice(null);
    setViewModal(false);
  };

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">🧾 New Billing &amp; Invoice</h2>

      {generatedInvoice ? (
        <div className="billing-grid">
          <div>
            <Card>
              <div className="success-header">
                <div className="success-icon">✅</div>
                <div>
                  <div className="success-title">Invoice Generated!</div>
                  <div className="success-sub">{generatedInvoice.invoiceNo} • {new Date(generatedInvoice.invoiceDate).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="shop-banner">
                <div className="shop-banner__name">🙏 {settings.shopName}</div>
                <div className="shop-banner__addr">{settings.shopAddress}</div>
              </div>

              <div className="detail-grid">
                {[['Invoice No', generatedInvoice.invoiceNo, '#b45309'],
                  ['Customer', generatedInvoice.customerName, '#374151'],
                  ['Payment', generatedInvoice.paymentMethod, '#6b7280'],
                  ['Date', new Date(generatedInvoice.invoiceDate).toLocaleDateString('en-IN'), '#6b7280']].map(([l, v, c]) => (
                  <div key={l} className="detail-box">
                    <div className="detail-box__label">{l}</div>
                    <div className="detail-box__value" style={{ color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="amount-summary">
                {[['Total Amount', generatedInvoice.totalAmount, '#374151', true],
                  ['✅ Paid Amount', generatedInvoice.paidAmount, '#15803d', false],
                  [generatedInvoice.remainingAmount > 0 ? '⚠️ Remaining' : '✅ Remaining', generatedInvoice.remainingAmount, generatedInvoice.remainingAmount > 0 ? '#b91c1c' : '#15803d', false]]
                  .map(([l, v, c, bold]) => (
                    <div key={l} className={`amount-row${bold ? ' amount-row--bold' : ''}`} style={{ color: c }}>
                      <span>{l}</span><span>{fmt(v)}</span>
                    </div>
                  ))}
                <div className="amount-summary__status"><StatusBadge status={generatedInvoice.paymentStatus} /></div>
              </div>

              <div className="action-row">
                <Button onClick={() => printInvoice(generatedInvoice, settings)} full>🖨️ Print / PDF</Button>
                <Button variant="info" full onClick={() => setViewModal(true)}>👁️ View Invoice</Button>
              </div>
              <Button variant="ghost" onClick={resetBill} full style={{ marginTop: 8 }}>➕ New Bill</Button>
            </Card>
          </div>

          <div>
            {generatedInvoice.upiQrData ? (
              <div className="upi-panel upi-panel--success">
                <div className="upi-panel__header upi-panel__header--success">
                  <span className="upi-panel__header-icon">✅</span>
                  <div>
                    <div className="upi-panel__header-title">Payment QR — {generatedInvoice.invoiceNo}</div>
                    <div className="upi-panel__header-sub">Share this QR with the customer</div>
                  </div>
                  <div className="upi-panel__header-amount">{fmt(generatedInvoice.paidAmount)}</div>
                </div>
                <div className="upi-panel__body">
                  <div className="upi-panel__qr-wrap">
                    <div className="upi-panel__qr-card">
                      <QRCode data={generatedInvoice.upiQrData} image={generatedInvoice.upiQrImage} size={180} />
                      <div className="upi-panel__qr-caption">SCAN TO PAY</div>
                      <div className="upi-panel__qr-amount upi-panel__qr-amount--success">{fmt(generatedInvoice.paidAmount)}</div>
                    </div>
                  </div>
                  <div className="upi-panel__apps">
                    {[['📱','PhonePe','#5f259f'],['🟢','GPay','#1a73e8'],['💙','Paytm','#002970'],['🇮🇳','BHIM','#138808']].map(([ic, lbl, clr]) => (
                      <div key={lbl} className="upi-panel__app">
                        <div className="upi-panel__app-icon" style={{ background: clr }}>{ic}</div>
                        <div className="upi-panel__app-label">{lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div className="upi-panel__id-row">
                    <div>
                      <div className="upi-panel__id-label">UPI ID</div>
                      <div className="upi-panel__id-value">{settings.upiId}</div>
                    </div>
                  </div>
                  <button className="upi-panel__open-btn" onClick={() => { window.location.href = generatedInvoice.upiQrData; }}>📲 Open in UPI App</button>
                </div>
              </div>
            ) : (
              <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💵</div>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Cash / Card Payment</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>No UPI QR generated for this payment method.</div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="billing-grid">
          <div>
            <Card style={{ marginBottom: 14 }}>
              <div className="section-heading">👤 Customer Details</div>
              <div className="form-grid-2">
                <div className="field"><label>Customer Name *</label><input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Full name" /></div>
                <div className="field"><label>Mobile Number</label><input value={form.customerMobile} onChange={e => setForm(f => ({ ...f, customerMobile: e.target.value }))} placeholder="+91-XXXXXXXXXX" /></div>
              </div>
              <div className="field"><label>Email (optional)</label><input value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="customer@email.com" /></div>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div className="section-heading">🛒 Add Items to Cart</div>
              <div className="cart-add-row">
                <select value={selectedG} onChange={e => setSelectedG(e.target.value)}>
                  <option value="">-- Select Ganpati --</option>
                  {inventory.filter(g => g.qty > 0).map(g => (
                    <option key={g._id} value={g._id}>{g.emoji} {g.name} ({g.type}) — {fmt(g.price)} | Stock: {g.qty}</option>
                  ))}
                </select>
                <input type="number" min={1} value={selectedQty} onChange={e => setSelectedQty(+e.target.value)} />
              </div>
              <Button onClick={addToCart} full>➕ Add to Cart</Button>

              {cartItems.length > 0 && (
                <table className="cart-table">
                  <thead><tr>{['Item','Qty','Price','Total',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {cartItems.map((item, i) => (
                      <tr key={i}>
                        <td><div className="cart-item-name">{item.emoji} {item.name}</div><div className="cart-item-type">{item.type}</div></td>
                        <td>{item.qty}</td>
                        <td>{fmt(item.unitPrice)}</td>
                        <td className="cell-green cell-bold">{fmt(item.totalPrice)}</td>
                        <td><button className="cart-remove-btn" onClick={() => setCartItems(c => c.filter((_, j) => j !== i))}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card>
              <div className="section-heading">💳 Payment Details</div>
              <div className="field">
                <label>Payment Method</label>
                <div className="method-tabs">
                  {['Cash','UPI','Card','Bank Transfer','Cheque'].map(m => (
                    <button key={m} className={`method-tab${form.paymentMethod === m ? ` method-tab--active${m === 'UPI' ? ' method-tab--upi' : ''}` : ''}`} onClick={() => setPayMethod(m)}>
                      {m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : m === 'Card' ? '💳' : m === 'Bank Transfer' ? '🏦' : '📄'}<br />{m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field"><label>Discount (₹)</label><input type="number" min={0} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: +e.target.value }))} /></div>

              <div className="field">
                <label>Paid Amount (₹) — Total: {fmt(totalAmount)}</label>
                <input
                  className={isUPI ? 'input-upi-locked' : ''}
                  type="number" min={0} max={totalAmount} value={form.paidAmount}
                  onChange={e => setForm(f => ({ ...f, paidAmount: Math.min(+e.target.value, totalAmount) }))}
                  readOnly={isUPI}
                />
                {isUPI && <div className="upi-hint">📱 Amount auto-filled for UPI QR. Edit above if partial.</div>}
              </div>

              <div className="amount-boxes">
                {[['TOTAL', totalAmount, '#92400e', '#fff7ed'], ['PAID', paid, '#15803d', '#f0fdf4'], ['REMAINING', remaining, remaining > 0 ? '#b91c1c' : '#15803d', remaining > 0 ? '#fff5f5' : '#f0fdf4']].map(([l, v, c, bg]) => (
                  <div key={l} className="amount-box" style={{ background: bg }}>
                    <div className="amount-box__label" style={{ color: c }}>{l}</div>
                    <div className="amount-box__value" style={{ color: c }}>{fmt(v)}</div>
                  </div>
                ))}
              </div>
              <div className="amount-summary__status">{<StatusBadge status={payStatus} />}</div>

              <div className="field"><label>Notes (optional)</label><textarea style={{ height: 56, resize: 'none' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special notes..." /></div>

              {!isUPI && (
                <>
                  <Button onClick={doGenerate} full>🧾 Generate Invoice</Button>
                  {!canGenerate && <div className="disabled-hint">Add items + enter customer name to continue</div>}
                </>
              )}
            </Card>
          </div>

          <div>
            {isUPI ? (
              <>
                <UPIPaymentPanel settings={settings} paid={paid} invoiceNo={null} customerName={form.customerName} canConfirm={canGenerate} onConfirm={doGenerate} />
                {cartItems.length > 0 && (
                  <Card style={{ marginTop: 14 }}>
                    <div className="section-heading" style={{ fontSize: 13 }}>💰 Adjust UPI Payment Amount</div>
                    <div className="field"><label>Paid Amount (₹) — Max: {fmt(totalAmount)}</label>
                      <input className="input-upi-border" type="number" min={0} max={totalAmount} value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: Math.min(+e.target.value, totalAmount) }))} />
                    </div>
                    <div className="quick-amount-grid">
                      <button className="quick-amount-btn quick-amount-btn--full" onClick={() => setForm(f => ({ ...f, paidAmount: totalAmount }))}>Full Amount</button>
                      <button className="quick-amount-btn quick-amount-btn--half" onClick={() => setForm(f => ({ ...f, paidAmount: Math.round(totalAmount / 2) }))}>Half Amount</button>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <div className="section-heading">📋 Invoice Preview</div>
                <div className="shop-banner">
                  <div className="shop-banner__name">🙏 {settings.shopName}</div>
                  <div className="shop-banner__addr">{settings.shopAddress}</div>
                </div>
                {form.customerName && <div className="preview-customer"><strong>Customer:</strong> {form.customerName}{form.customerMobile && <span> | 📞 {form.customerMobile}</span>}</div>}
                {cartItems.length > 0 ? (
                  <>
                    <table className="cart-table">
                      <thead><tr>{['Item','Qty','Total'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>{cartItems.map((item, i) => (
                        <tr key={i}><td>{item.emoji} {item.name}</td><td>{item.qty}</td><td className="cell-green cell-bold">{fmt(item.totalPrice)}</td></tr>
                      ))}</tbody>
                    </table>
                    <div className="amount-summary">
                      <div className="amount-row"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
                      {form.discount > 0 && <div className="amount-row" style={{ color: '#b91c1c' }}><span>Discount</span><strong>- {fmt(form.discount)}</strong></div>}
                      <div className="amount-row amount-row--bold"><span>Total</span><span>{fmt(totalAmount)}</span></div>
                      <div className="amount-row" style={{ color: '#15803d' }}><span>Paid</span><strong>{fmt(paid)}</strong></div>
                      <div className="amount-row" style={{ color: remaining > 0 ? '#b91c1c' : '#15803d' }}><span>Remaining</span><strong>{fmt(remaining)}</strong></div>
                      <div className="amount-summary__status"><StatusBadge status={payStatus} /></div>
                    </div>
                  </>
                ) : (
                  <div className="empty-cart"><div className="empty-cart__icon">🛒</div><div>Add items to see invoice preview</div></div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
      {viewModal && generatedInvoice && (
        <Modal title={`🧾 Invoice — ${generatedInvoice.invoiceNo}`} onClose={() => setViewModal(false)} xlarge>
          <Invoice invoice={generatedInvoice} settings={settings} onClose={() => setViewModal(false)} />
        </Modal>
      )}
    </Layout>
  );
};

export default Billing;
