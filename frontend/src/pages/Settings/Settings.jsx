import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { settings, refresh, isSettingsVerified, openSettingsModal } = useSettings();
  const toast = useToast();
  const [f, setF] = useState(settings);
  const [dueCount, setDueCount] = useState(0);
  const [logoFile, setLogoFile] = useState(null);
  const [qrLogoFile, setQrLogoFile] = useState(null);
  const [headerBannerFile, setHeaderBannerFile] = useState(null);

  // Enforce authentication on direct access or browser reload
  useEffect(() => {
    if (!isSettingsVerified) {
      openSettingsModal(
        () => {
          // Owner verified successfully
        },
        () => {
          // Cancelled -> redirect to dashboard
          navigate('/');
        }
      );
    }
  }, [isSettingsVerified, openSettingsModal, navigate]);

  // Load latest settings from MongoDB
  useEffect(() => {
    settingsAPI.get().then(res => {
      if (res?.data) {
        setF(res.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setF(settings);
    }
  }, [settings]);

  useEffect(() => {
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  const set = (k) => (e) => setF(x => {
    const next = { ...x, [k]: e.target.value };
    if (k === 'mobile') next.mobileNumber = e.target.value;
    if (k === 'mobileNumber') next.mobile = e.target.value;
    if (k === 'shopAddress') next.address = e.target.value;
    if (k === 'address') next.shopAddress = e.target.value;
    return next;
  });

  const save = async () => {
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => {
        if (
          k !== 'shopLogo' &&
          k !== 'qrLogo' &&
          k !== 'headerBanner' &&
          k !== '_id' &&
          k !== '__v' &&
          k !== 'createdAt' &&
          k !== 'updatedAt'
        ) {
          fd.append(k, v ?? '');
        }
      });
      if (logoFile) fd.append('shopLogo', logoFile);
      if (qrLogoFile) fd.append('qrLogo', qrLogoFile);
      if (headerBannerFile) fd.append('headerBanner', headerBannerFile);
      const res = await settingsAPI.update(fd);
      toast.toast('Settings saved successfully!');
      if (res?.data) {
        setF(res.data);
      }
      refresh();
    } catch (err) {
      toast.toast(err.message || 'Failed to save settings', 'error');
    }
  };

  // If unverified, keep layout intact while the modal is presented
  if (!isSettingsVerified) {
    return (
      <Layout dueCount={dueCount}>
        <div style={{ padding: 40, textAlign: 'center', color: '#92400e', fontWeight: 600 }}>
          Owner verification required to view and modify settings.
        </div>
      </Layout>
    );
  }

  const upiPreview = f.upiId ? buildUPIString(f, 100, 'INV-TEST-001', 'Test Customer') : '';

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">Shop Settings</h2>

      <div className="settings-grid">
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div className="section-heading">Shop Information</div>
            <div className="field"><label>Shop Name *</label><input value={f.shopName || ''} onChange={set('shopName')} /></div>
            <div className="field"><label>Shop Address</label><textarea value={f.shopAddress || f.address || ''} onChange={set('shopAddress')} /></div>
            <div className="form-grid-2">
              <div className="field"><label>Mobile Number</label><input value={f.mobileNumber || f.mobile || ''} onChange={set('mobileNumber')} placeholder="e.g. 9823456789" /></div>
              <div className="field"><label>Alternate Mobile (Optional)</label><input value={f.alternateMobile || ''} onChange={set('alternateMobile')} placeholder="e.g. 8767572512" /></div>
            </div>
            <div className="form-grid-2">
              <div className="field"><label>Email</label><input type="email" value={f.email || ''} onChange={set('email')} /></div>
              <div className="field"><label>Instagram (Optional)</label><input value={f.instagram || ''} onChange={set('instagram')} placeholder="@yourshop" /></div>
            </div>
            <div className="form-grid-2">
              <div className="field"><label>GST Number (Optional)</label><input value={f.gstNumber || ''} onChange={set('gstNumber')} placeholder="GST27ABCDE1234F1Z5" /></div>
              <div className="field"><label>Invoice Prefix</label><input value={f.invoicePrefix || ''} onChange={set('invoicePrefix')} placeholder="INV" /></div>
            </div>
            <div className="field"><label>Low Stock Threshold</label><input type="number" value={f.lowStockThreshold ?? 5} onChange={set('lowStockThreshold')} /></div>
            <div className="field"><label>Footer Message</label><input value={f.footerMessage || ''} onChange={set('footerMessage')} placeholder="Ganpati Bappa Morya! Thank you for your purchase." /></div>
            <div className="field">
              <label>Shop Logo</label>
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
              {f.shopLogo && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                  Current Logo:{' '}
                  <img
                    src={f.shopLogo}
                    alt="Shop Logo"
                    style={{ height: 28, verticalAlign: 'middle', marginLeft: 6, borderRadius: 4 }}
                  />
                </div>
              )}
            </div>
            <div className="field">
              <label>Header Banner</label>
              <input type="file" accept="image/*" onChange={e => setHeaderBannerFile(e.target.files[0])} />
              {f.headerBanner && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                  Current Banner:{' '}
                  <img
                    src={f.headerBanner}
                    alt="Header Banner"
                    style={{ height: 36, verticalAlign: 'middle', marginLeft: 6, borderRadius: 4 }}
                  />
                </div>
              )}
            </div>
            <div className="field">
              <label>QR Logo (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setQrLogoFile(e.target.files[0])} />
              {f.qrLogo && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                  Current QR Logo:{' '}
                  <img
                    src={f.qrLogo}
                    alt="QR Logo"
                    style={{ height: 28, verticalAlign: 'middle', marginLeft: 6, borderRadius: 4 }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="section-heading">Banking &amp; UPI</div>
            <div className="field">
              <label>UPI ID *</label>
              <input className={f.upiId ? 'input-upi-set' : ''} value={f.upiId || ''} onChange={set('upiId')} placeholder="yourshop@paytm or yourname@upi" />
              {f.upiId && <div className="upi-set-hint">UPI ID set — QR codes will be generated automatically</div>}
            </div>
            <div className="field"><label>Bank Name</label><input value={f.bankName || ''} onChange={set('bankName')} /></div>
            <Button onClick={save} full>Save Settings</Button>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 16 }}>
            <div className="section-heading">UPI QR Preview</div>
            {upiPreview ? (
              <div className="qr-preview">
                <div className="qr-preview__text">Live preview — scan with any UPI app</div>
                <QRCode data={upiPreview} size={200} />
                <div className="qr-preview__id">UPI: <strong>{f.upiId}</strong></div>
                <div className="qr-preview__shop">Shop: {f.shopName}</div>
                <div className="qr-preview__apps">
                  {['PhonePe', 'Google Pay', 'Paytm', 'BHIM'].map(a => <span key={a} className="qr-preview__app-tag">{a}</span>)}
                </div>
              </div>
            ) : (
              <div className="qr-preview__empty"><div className="qr-preview__empty-icon">UPI</div><div>Enter your UPI ID to see the QR preview</div></div>
            )}
          </Card>

          <Card>
            <div className="section-heading">Invoice Preview</div>
            <div className="invoice-preview-banner">
              {f.headerBanner && (
                <img
                  src={f.headerBanner}
                  alt="Header Banner"
                  style={{ width: '100%', maxHeight: 70, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {f.shopLogo && (
                  <img
                    src={f.shopLogo}
                    alt="Logo"
                    style={{ height: 32, borderRadius: 4, background: '#fff', padding: 2 }}
                  />
                )}
                <div className="invoice-preview-banner__name">{f.shopName || 'Shop Name'}</div>
              </div>
              <div className="invoice-preview-banner__addr">{f.shopAddress || f.address || 'Shop Address'}</div>
              <div className="invoice-preview-banner__contact">
                {[f.mobileNumber || f.mobile, f.alternateMobile, f.email].filter(Boolean).join(' | ')}
              </div>
              {f.instagram && <div className="invoice-preview-banner__gst">Instagram: {f.instagram}</div>}
              {f.gstNumber && <div className="invoice-preview-banner__gst">GSTIN: {f.gstNumber}</div>}
              <div style={{ marginTop: 8, fontSize: 11, opacity: 0.9, borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 6 }}>
                {f.footerMessage || 'Thank you for your purchase.'}
              </div>
            </div>
            <div className="invoice-preview-caption">This is how your shop header &amp; footer will appear on invoices</div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
