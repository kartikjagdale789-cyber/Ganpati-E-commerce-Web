import React from 'react';
import './Badge.css';

export const StatusBadge = ({ status }) => {
  const cls = status === 'Paid' ? 'badge--paid' : status === 'Partial Payment' ? 'badge--partial' : 'badge--unpaid';
  return <span className={`badge ${cls}`}>{status}</span>;
};

export const StockBadge = ({ qty }) => {
  const cls = qty === 0 ? 'badge--unpaid' : qty <= 5 ? 'badge--partial' : 'badge--paid';
  const lbl = qty === 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'In Stock';
  return <span className={`badge ${cls}`}>{lbl}</span>;
};
