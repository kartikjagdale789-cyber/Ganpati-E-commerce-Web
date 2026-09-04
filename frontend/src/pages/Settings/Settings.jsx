import React, { useState, useEffect } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import QRCode from '../../components/QRCode/QRCode';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { settingsAPI, invoiceAPI } from '../../api';
import { buildUPIString } from '../../utils/upi';
import './Settings.css';

const Settings = () => {
  const { settings, refresh } = useSettings();
  const toast = useToast();
  const [f, setF] = useState(settings);
  const [dueCount, setDueCount] = useState(0);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => { setF(settings); }, [settings]);
  useEffect(() => { invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {}); }, []);

  const set = (k) => (e) => setF(x => ({ ...x, [k]: e.target.value }));

  const save = async () => {
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => { if (k !== 'shopLogo' && k !== '_id' && k !== '__v') fd.append(k, v ?? ''); });
      if (logoFile) fd.append('shopLogo', logoFile);
      await settingsAPI.update(fd);
      toast.toast('Settings saved successfully!');
      refresh();
    } catch (err) { toast.toast(err.message || 'Failed to save settings', 'error'); }
  };

  const upiPreview = f.upiId ? buildUPIString(f, 100, 'INV-TEST-001', 'Test Customer') : '';

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">⚙️ Shop Settings</h2>

      <div className="settings-grid">
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div className="section-heading">🏪 Shop Information</div>
            <div className="field"><label>Shop Name *</label><input value={f.shopName || ''} onChange={set('shopName')} /></div>
            <div className="field"><label>Shop Address</label><textarea value={f.shopAddress || ''} onChange={set('shopAddress')} /></div>
            <div className="form-grid-2">
              <div className="field"><label>Mobile Number</label><input value={f.mobile || ''} onChange={set('mobile')} /></div>
              <div className="field"><label>Email</label><input type="email" value={f.email || ''} onChange={set('email')} /></div>
            </div>
            <div className="field"><label>GST Number (Optional)</label><input value={f.gstNumber || ''} onChange={set('gstNumber')} placeholder="GST27ABCDE1234F1Z5" /></div>
            <div className="field"><label>Invoice Prefix</label><input value={f.invoicePrefix || ''} onChange={set('invoicePrefix')} placeholder="INV" /></div>
            <div className="field"><label>Low Stock Threshold</label><input type="number" value={f.lowStockThreshold ?? 5} onChange={set('lowStockThreshold')} /></div>
            <div className="field"><label>Shop Logo</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} /></div>
          </Card>

          <Card>
            <div className="section-heading">🏦 Banking &amp; UPI</div>
            <div className="field">
              <label>UPI ID *</label>
              <input className={f.upiId ? 'input-upi-set' : ''} value={f.upiId || ''} onChange={set('upiId')} placeholder="yourshop@paytm or yourname@upi" />
              {f.upiId && <div className="upi-set-hint">✅ UPI ID set — QR codes will be generated automatically</div>}
            </div>
            <div className="field"><label>Bank Name</label><input value={f.bankName || ''} onChange={set('bankName')} /></div>
            <Button onClick={save} full>💾 Save Settings</Button>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 16 }}>
            <div className="section-heading">📱 UPI QR Preview</div>
            {upiPreview ? (
              <div className="qr-preview">
                <div className="qr-preview__text">Live preview — scan with any UPI app</div>
                <QRCode data={upiPreview} size={200} />
                <div className="qr-preview__id">UPI: <strong>{f.upiId}</strong></div>
                <div className="qr-preview__shop">Shop: {f.shopName}</div>
                <div className="qr-preview__apps">
                  {['📱 PhonePe', '🟢 Google Pay', '💙 Paytm', '🇮🇳 BHIM'].map(a => <span key={a} className="qr-preview__app-tag">{a}</span>)}
                </div>
              </div>
            ) : (
              <div className="qr-preview__empty"><div className="qr-preview__empty-icon">📱</div><div>Enter your UPI ID to see the QR preview</div></div>
            )}
          </Card>

          <Card>
            <div className="section-heading">📄 Invoice Preview</div>
            <div className="invoice-preview-banner">
              <div className="invoice-preview-banner__name">🙏 {f.shopName || 'Shop Name'}</div>
              <div className="invoice-preview-banner__addr">{f.shopAddress || 'Shop Address'}</div>
              <div className="invoice-preview-banner__contact">{[f.mobile, f.email].filter(Boolean).join(' | ')}</div>
              {f.gstNumber && <div className="invoice-preview-banner__gst">GSTIN: {f.gstNumber}</div>}
            </div>
            <div className="invoice-preview-caption">This is how your shop header will appear on invoices</div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
