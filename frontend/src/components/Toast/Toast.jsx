import React, { useEffect } from 'react';
import './Toast.css';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

const Toast = ({ msg, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <span>{ICONS[type] || 'ℹ️'}</span>
      <span className="toast__msg">{msg}</span>
      <button className="toast__close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
