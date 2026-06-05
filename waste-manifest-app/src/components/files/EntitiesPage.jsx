import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { injectSharedStyles } from './sharedStyles';
import { LoadingOverlay, Toast, Pagination, ConfirmModal } from './components.jsx';
import FinField from './input_types/FinField';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
const ROWS = 10;

export default function EntitiesPage({ user, onLogout, onHome }) {
  injectSharedStyles();
  const navigate = useNavigate();

  const [page, setPage]                       = useState(0);
  const [entities, setEntities]               = useState([]);
  const [searchQuery, setSearchQuery]         = useState('');
  const [loading, setLoading]                 = useState(false);
  const [editOpen, setEditOpen]               = useState(false);
  const [deleteOpen, setDeleteOpen]           = useState(false);
  const [selected, setSelected]               = useState(null);
  const [successMessage, setSuccessMessage]   = useState('');
  const [form, setForm] = useState({
    name: '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: ''
  });

  useEffect(() => { fetchEntities(); }, []);

  const fetchEntities = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/entities`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setEntities(await res.json());
    } catch { localStorage.removeItem('token'); setEntities([]); }
    finally { setLoading(false); }
  };

  const openEdit = (entity) => {
    setSelected(entity);
    setForm({ name: entity.name, address: entity.address, contact_person: entity.contact_person, contact_no: entity.contact_no, email: entity.email || '', ipwis_no: entity.ipwis_no });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entities/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      await fetchEntities();
      setSuccessMessage(`Entity ${form.name} updated successfully.`);
      setEditOpen(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entities/${selected.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      await fetchEntities();
      setSuccessMessage(`Entity ${selected.name} deleted successfully.`);
    } catch (err) { console.error(err); }
    finally { setDeleteOpen(false); setSelected(null); setLoading(false); }
  };

  const handleFieldChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.value }));

  const filtered = entities.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const paged = filtered.slice(page * ROWS, page * ROWS + ROWS);

  const HEADERS = ['ID', 'Type', 'Name', 'Address', 'Contact Person', 'Contact No', 'Email', 'IPWIS No', 'Created', ''];

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <ConfirmModal
        open={deleteOpen}
        title={`Delete entity "${selected?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteOpen(false); setSelected(null); }}
      />

      <div className="page-hero">
        <div className="page-hero-eyebrow">Admin</div>
        <h1 className="page-hero-title">Entities</h1>
        <p className="page-hero-sub">Manage waste generators, transporters and other entities.</p>
      </div>

      <div className="app-container">
        <div className="app-toolbar">
          <div className="app-search-wrap" style={{ maxWidth: 360 }}>
            <span className="app-search-icon">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              className="app-input with-icon"
              placeholder="Search by entity name…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        <div className="app-card" style={{ overflowX: 'auto' }}>
          <table className="app-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={HEADERS.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>No entities found</td></tr>
              ) : paged.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{m.id}</td>
                  <td><span className="s-pill default"><span className="s-dot" />{m.type}</span></td>
                  <td style={{ color: 'var(--text2)', fontWeight: 500 }}>{m.name}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.address}</td>
                  <td>{m.contact_person}</td>
                  <td>{m.contact_no}</td>
                  <td>{m.email}</td>
                  <td>{m.ipwis_no}</td>
                  <td>{m.created_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="btn-icon" title="Edit" onClick={() => openEdit(m)}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="btn-icon danger" title="Delete" onClick={() => { setSelected(m); setDeleteOpen(true); }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination count={filtered.length} page={page} rowsPerPage={ROWS} onPageChange={setPage} />
        </div>
      </div>

      <div className="sticky-footer">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Entity</span>
              <button className="modal-close" onClick={() => setEditOpen(false)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {[['name','Name','text'],['address','Address','text'],['contact_person','Contact Person','text']].map(([field, label]) => (
                <div key={field} className="field-wrap">
                  <label className="field-label">{label}</label>
                  <input className="field-input" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} />
                </div>
              ))}
              <FinField
                id="ContactNo" fullWidth required placeholder="eg. 0730000000"
                helperText="Please enter a valid contact number" label="Contact No"
                validationMethod="phone" value={form.contact_no} callback={handleFieldChange('contact_no')}
              />
              <FinField
                id="Email" fullWidth required placeholder="eg. test@email.com"
                helperText="Please enter a valid email address" label="Email"
                validationMethod="email" value={form.email} callback={handleFieldChange('email')}
              />
              <div className="field-wrap">
                <label className="field-label">IPWIS No</label>
                <input className="field-input" value={form.ipwis_no} onChange={e => setForm({...form, ipwis_no: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSubmit}>Update Entity</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
