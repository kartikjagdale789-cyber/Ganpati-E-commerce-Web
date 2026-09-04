import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { StockBadge } from '../../components/Badge/Badge';
import { reportAPI, invoiceAPI } from '../../api';
import { fmt } from '../../utils/format';
import './Reports.css';

const StatCard = ({ label, val, icon, bg, textColor }) => (
  <div className="rpt-stat" style={{ background: bg }}>
    <div className="rpt-stat__icon">{icon}</div>
    <div className="rpt-stat__label" style={{ color: textColor }}>{label}</div>
    <div className="rpt-stat__value" style={{ color: textColor }}>{val}</div>
  </div>
);

const Reports = () => {
  const [rType, setRType] = useState('daily');
  const [salesData, setSalesData] = useState({ data: [], stats: {} });
  const [bestSelling, setBestSelling] = useState([]);
  const [stock, setStock] = useState([]);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    reportAPI.sales(rType).then(res => setSalesData(res)).catch(() => {});
  }, [rType]);

  useEffect(() => {
    reportAPI.bestSelling().then(res => setBestSelling(res.data)).catch(() => {});
    reportAPI.stock().then(res => setStock(res.data)).catch(() => {});
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  const { data = [], stats = {} } = salesData;

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">📈 Reports &amp; Analytics</h2>

      <div className="rpt-tabs">
        {[['daily','📅','Daily'],['weekly','📆','Weekly'],['monthly','🗓️','Monthly'],['all','📋','All Time']].map(([id, ic, lbl]) => (
          <Button key={id} variant={rType === id ? 'primary' : 'ghost'} onClick={() => setRType(id)}>{ic} {lbl}</Button>
        ))}
      </div>

      <div className="rpt-stats-grid">
        <StatCard label="Orders"    val={stats.count || 0}            icon="🛒" bg="#dbeafe" textColor="#1e40af" />
        <StatCard label="Revenue"   val={fmt(stats.totalRevenue)}     icon="💰" bg="#dcfce7" textColor="#15803d" />
        <StatCard label="Collected" val={fmt(stats.totalPaid)}        icon="✅" bg="#d1fae5" textColor="#065f46" />
        <StatCard label="Pending"   val={fmt(stats.totalDue)}         icon="⏳" bg="#fef9c3" textColor="#92400e" />
      </div>

      <div className="rpt-grid">
        <Card>
          <div className="section-heading">🏆 Best Selling Ganpati</div>
          {bestSelling.map((d, i) => (
            <div key={d.type} className="best-row">
              <div className="best-medal">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
              <div className="best-emoji">{d.emoji || '🙏'}</div>
              <div className="best-info">
                <div className="best-name">{d.type}</div>
                <div className="best-sub">{d.qty} units • {fmt(d.revenue)}</div>
              </div>
              <div className="best-qty">{d.qty}</div>
            </div>
          ))}
          {bestSelling.length === 0 && <p className="empty-text">No sales data.</p>}
        </Card>

        <Card>
          <div className="section-heading">📦 Stock Availability</div>
          {stock.map(g => (
            <div key={g._id} className="stock-row">
              <span className="stock-emoji">{g.emoji}</span>
              <div className="stock-info">
                <div className="stock-name">{g.name}</div>
                <div className="stock-sub">{g.type} • {fmt(g.price)}</div>
              </div>
              <div className="stock-qty-wrap">
                <div className={`stock-qty ${g.qty === 0 ? 'stock-qty--red' : g.qty <= 5 ? 'stock-qty--amber' : 'stock-qty--green'}`}>{g.qty}</div>
                <StockBadge qty={g.qty} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
