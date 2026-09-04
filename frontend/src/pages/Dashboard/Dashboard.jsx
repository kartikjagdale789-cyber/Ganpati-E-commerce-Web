import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Card from '../../components/Card/Card';
import { StatusBadge } from '../../components/Badge/Badge';
import { reportAPI, invoiceAPI } from '../../api';
import { fmt } from '../../utils/format';
import './Dashboard.css';

const StatCard = ({ label, val, icon, bg, textColor, sub }) => (
  <div className="stat-card" style={{ background: bg }}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__label" style={{ color: textColor }}>{label}</div>
    <div className="stat-card__value" style={{ color: textColor }}>{val}</div>
    {sub && <div className="stat-card__sub" style={{ color: textColor }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayInvoices, setTodayInvoices] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    reportAPI.dashboard().then(res => setStats(res.data)).catch(() => {});
    invoiceAPI.getAll({ page: 1, limit: 200 }).then(res => {
      const today = new Date().toISOString().split('T')[0];
      setTodayInvoices((res.data || []).filter(i => i.invoiceDate?.startsWith(today)));
    }).catch(() => {});
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  if (!stats) return (
    <Layout dueCount={dueCount}>
      <div className="dashboard-loading">🙏 Loading dashboard...</div>
    </Layout>
  );

  return (
    <Layout dueCount={dueCount}>
      <h2 className="page-title">📊 Dashboard Overview</h2>

      <div className="stats-grid">
        <StatCard label="Today's Sales"      val={stats.todaySales}          icon="📅" bg="#fff7ed" textColor="#c2410c" sub={fmt(stats.todayRevenue)} />
        <StatCard label="Total Revenue"      val={fmt(stats.totalRevenue)}   icon="💰" bg="#dcfce7" textColor="#15803d" />
        <StatCard label="Pending Amount"     val={fmt(stats.pendingAmount)}  icon="⏳" bg="#fef9c3" textColor="#92400e" sub={`${stats.pendingCustomers} invoices`} />
        <StatCard label="Paid Invoices"      val={stats.paidInvoices}        icon="✅" bg="#dbeafe" textColor="#1e40af" sub="fully settled" />
        <StatCard label="Total Customers"    val={stats.totalCustomers}      icon="👥" bg="#fce7f3" textColor="#9d174d" />
        <StatCard label="Pending Customers"  val={stats.pendingCustomers}    icon="🔴" bg="#fee2e2" textColor="#b91c1c" />
        <StatCard label="Out of Stock"       val={stats.outOfStock}          icon="📭" bg="#f3f4f6" textColor="#374151" />
        <StatCard label="Low Stock"          val={stats.lowStock}            icon="⚠️" bg="#fef9c3" textColor="#854d0e" />
      </div>

      <Card>
        <div className="section-heading">📅 Today's Sales ({todayInvoices.length})</div>
        {todayInvoices.length === 0 ? (
          <p className="empty-text">No sales today yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                {['Invoice','Customer','Items','Total','Paid','Remaining','Status'].map(h => <th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {todayInvoices.map(i => (
                  <tr key={i._id}>
                    <td className="cell-invoice">{i.invoiceNo}</td>
                    <td>{i.customerName}</td>
                    <td className="cell-muted">{(i.items || []).length} item(s)</td>
                    <td className="cell-bold">{fmt(i.totalAmount)}</td>
                    <td className="cell-green">{fmt(i.paidAmount)}</td>
                    <td className={i.remainingAmount > 0 ? 'cell-red' : 'cell-green'}>{fmt(i.remainingAmount)}</td>
                    <td><StatusBadge status={i.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Dashboard;
