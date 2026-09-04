import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ user: '', pass: '', err: '' });
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!form.user || !form.pass) {
      setForm(f => ({ ...f, err: 'Please enter username and password' }));
      return;
    }
    setLoading(true);
    try {
      await login(form.user, form.pass);
      navigate('/');
    } catch (err) {
      setForm(f => ({ ...f, err: err?.message || 'Invalid username or password' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-emoji">🙏</div>
          <h1 className="login-title">Shri Ganesh Murti Bhandar</h1>
          <p className="login-subtitle">Inventory &amp; Billing Management System</p>
          <div className="login-tags">
            {['📦 Inventory', '🧾 Billing', '📱 UPI QR', '💰 Dues'].map(t => (
              <span key={t} className="login-tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="login-field">
          <label>Username</label>
          <input
            placeholder="admin"
            value={form.user}
            onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
          />
        </div>
        <div className="login-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.pass}
            onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
          />
        </div>

        {form.err && <div className="login-error">⚠️ {form.err}</div>}

        <button className="login-btn" onClick={doLogin} disabled={loading}>
          {loading ? '🙏 Logging in...' : '🙏 Login to Dashboard'}
        </button>

        <div className="login-demo">Demo: <strong>admin</strong> / <strong>ganpati123</strong></div>
      </div>
    </div>
  );
};

export default Login;
