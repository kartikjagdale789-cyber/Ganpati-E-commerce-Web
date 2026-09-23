import React, { useState, useEffect, useRef } from 'react';
import { settingsAPI } from '../../api';
import './SettingsAuthModal.css';

const SettingsAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      setLoading(false);
      // Auto-focus username field on open
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Invalid Username or Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await settingsAPI.verifyOwner({
        username: username.trim(),
        password: password.trim(),
      });

      if (res && res.success) {
        setLoading(false);
        setUsername('');
        setPassword('');
        setError('');
        if (onSuccess) onSuccess();
      } else {
        setError('Invalid Username or Password');
        setLoading(false);
      }
    } catch (err) {
      setError(err?.message || 'Invalid Username or Password');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleVerify(e);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="settings-auth-overlay" onClick={handleCancel}>
      <div
        className="settings-auth-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-auth-title"
      >
        <div className="settings-auth-header">
          <h3 id="settings-auth-title" className="settings-auth-title">
            <span>🔐</span> Owner Verification
          </h3>
          <button
            type="button"
            className="settings-auth-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="settings-auth-body">
          <p className="settings-auth-subtitle">
            Enter owner credentials to view and manage shop settings.
          </p>

          {error && (
            <div className="settings-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="settings-auth-field">
              <label htmlFor="settings-auth-username">Username</label>
              <input
                id="settings-auth-username"
                ref={usernameInputRef}
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="settings-auth-field">
              <label htmlFor="settings-auth-password">Password</label>
              <input
                id="settings-auth-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="settings-auth-actions">
              <button
                type="button"
                className="settings-auth-btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="settings-auth-btn-verify"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsAuthModal;
