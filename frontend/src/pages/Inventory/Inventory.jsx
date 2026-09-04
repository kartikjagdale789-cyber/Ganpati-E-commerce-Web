import React, { useEffect, useState } from 'react';
import Layout from '../../components/Sidebar/Sidebar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { StockBadge } from '../../components/Badge/Badge';
import { useToast } from '../../context/ToastContext';
import { inventoryAPI, invoiceAPI } from '../../api';
import { fmt } from '../../utils/format';
import './Inventory.css';

const GanpatiForm = ({ initial, onSave, onClose }) => {
  const [f, setF] = useState(initial || { name: '', type: '', height: '', color: '', price: '', qty: '', emoji: '🙏', description: '' });
  const set = (k) => (e) => setF(x => ({ ...x, [k]: e.target.value }));
  return (
    <div>
      <div className="form-grid-2">
        <div className="field"><label>Ganpati Name</label><input value={f.name} onChange={set('name')} placeholder="Siddhivinayak Ganpati" /></div>
        <div className="field"><label>Type</label><input value={f.type} onChange={set('type')} placeholder="Shadu Clay / Marble..." /></div>
        <div className="field"><label>Height</label><input value={f.height} onChange={set('height')} placeholder='12"' /></div>
        <div className="field"><label>Color</label><input value={f.color} onChange={set('color')} placeholder="Natural White" /></div>
        <div className="field"><label>Price (₹)</label><input type="number" value={f.price} onChange={set('price')} placeholder="1200" /></div>
        <div className="field"><label>Quantity</label><input type="number" value={f.qty} onChange={set('qty')} placeholder="10" /></div>
        <div className="field"><label>Icon / Emoji</label><input value={f.emoji} onChange={set('emoji')} placeholder="🙏" /></div>
      </div>
      <div className="field"><label>Description</label><textarea value={f.description} onChange={set('description')} /></div>
      <div className="form-actions">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => {
          if (!f.name || !f.price || !f.qty) return alert('Fill required fields');
          onSave({ ...f, price: +f.price, qty: +f.qty });
        }}>💾 Save Ganpati</Button>
      </div>
    </div>
  );
};

const Inventory = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [filter, setFilter] = useState({ type: '', color: '', minP: '', maxP: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [delId, setDelId] = useState(null);

  const load = () => inventoryAPI.getAll().then(res => setItems(res.data)).catch(() => toast.toast('Failed to load inventory', 'error'));

  useEffect(() => {
    load();
    invoiceAPI.getDues().then(res => setDueCount((res.data || []).length)).catch(() => {});
  }, []);

  const addItem = async (f) => {
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      await inventoryAPI.create(fd);
      setShowAdd(false); toast.toast('Ganpati idol added!'); load();
    } catch (err) { toast.toast(err.message || 'Failed to add item', 'error'); }
  };

  const saveEdit = async (f) => {
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      await inventoryAPI.update(editItem._id, fd);
      setEditItem(null); toast.toast('Ganpati idol updated!'); load();
    } catch (err) { toast.toast(err.message || 'Failed to update item', 'error'); }
  };

  const deleteItem = async (id) => {
    try {
      await inventoryAPI.remove(id);
      setDelId(null); toast.toast('Deleted.', 'info'); load();
    } catch (err) { toast.toast(err.message || 'Failed to delete item', 'error'); }
  };

  const filtered = items.filter(g => {
    if (filter.type  && !g.type.toLowerCase().includes(filter.type.toLowerCase()))   return false;
    if (filter.color && !g.color.toLowerCase().includes(filter.color.toLowerCase())) return false;
    if (filter.minP  && g.price < +filter.minP) return false;
    if (filter.maxP  && g.price > +filter.maxP) return false;
    return true;
  });

  return (
    <Layout dueCount={dueCount}>
      <div className="page-header">
        <h2 className="page-title">📦 Inventory Management</h2>
        <Button onClick={() => setShowAdd(true)}>➕ Add New Ganpati</Button>
      </div>

      <Card style={{ marginBottom: 16, padding: 14 }}>
        <div className="filter-grid">
          <div><label className="filter-label">TYPE</label><input placeholder="Filter type..." value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} /></div>
          <div><label className="filter-label">COLOR</label><input placeholder="Filter color..." value={filter.color} onChange={e => setFilter(f => ({ ...f, color: e.target.value }))} /></div>
          <div><label className="filter-label">MIN ₹</label><input type="number" placeholder="0" value={filter.minP} onChange={e => setFilter(f => ({ ...f, minP: e.target.value }))} /></div>
          <div><label className="filter-label">MAX ₹</label><input type="number" placeholder="99999" value={filter.maxP} onChange={e => setFilter(f => ({ ...f, maxP: e.target.value }))} /></div>
          <div className="filter-clear-wrap"><Button variant="ghost" small onClick={() => setFilter({ type:'', color:'', minP:'', maxP:'' })}>Clear</Button></div>
        </div>
      </Card>

      <div className="table-container">
        <table className="inv-table">
          <thead><tr>
            {['','ID','Name','Type','Height','Color','Price','Qty','Status','Actions'].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((g, i) => (
              <tr key={g._id} style={{ background: i % 2 === 0 ? '#fff' : '#fffbf0' }}>
                <td className="cell-emoji">{g.emoji}</td>
                <td className="cell-id">{g.ganpatiId}</td>
                <td className="cell-bold">{g.name}</td>
                <td>{g.type}</td>
                <td>{g.height}</td>
                <td>{g.color}</td>
                <td className="cell-green cell-bold">{fmt(g.price)}</td>
                <td className={`cell-bold ${g.qty === 0 ? 'cell-red' : g.qty <= 5 ? 'cell-amber' : ''}`}>{g.qty}</td>
                <td><StockBadge qty={g.qty} /></td>
                <td>
                  <div className="row-actions">
                    <Button variant="info" small onClick={() => setEditItem(g)}>✏️</Button>
                    <Button variant="danger" small onClick={() => setDelId(g._id)}>🗑️</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} className="empty-row">No items found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && <Modal title="➕ Add New Ganpati Idol" onClose={() => setShowAdd(false)} wide><GanpatiForm onSave={addItem} onClose={() => setShowAdd(false)} /></Modal>}
      {editItem && <Modal title="✏️ Edit Ganpati Idol" onClose={() => setEditItem(null)} wide><GanpatiForm initial={editItem} onSave={saveEdit} onClose={() => setEditItem(null)} /></Modal>}
      {delId && (
        <Modal title="🗑️ Confirm Delete" onClose={() => setDelId(null)}>
          <p style={{ color: '#374151', marginBottom: 20 }}>Delete this Ganpati idol? This cannot be undone.</p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => deleteItem(delId)}>🗑️ Delete</Button>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default Inventory;
