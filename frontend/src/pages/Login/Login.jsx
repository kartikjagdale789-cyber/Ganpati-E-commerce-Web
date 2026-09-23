import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bgImage from '../../assets/login-bg.jpg';
import ganpatiImg from '../../assets/ganpati-idol.png';
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
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="login-overlay" />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-title-box">
              <span className="login-title">श्री गणेशाय नमः</span>
            </div>
            <div className="login-ganpati-wrap">
              <img src={ganpatiImg} alt="श्री गणेश" className="login-ganpati-img" />
            </div>
          </div>

          <div className="login-form">
            <div className="login-field">
              <label>User Name</label>
              <input
                type="text"
                placeholder="Enter username"
                value={form.user}
                onChange={e => setForm(f => ({ ...f, user: e.target.value, err: '' }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
                autoFocus
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.pass}
                onChange={e => setForm(f => ({ ...f, pass: e.target.value, err: '' }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
              />
            </div>

            {form.err && <div className="login-error">{form.err}</div>}

            <button className="login-btn" onClick={doLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
