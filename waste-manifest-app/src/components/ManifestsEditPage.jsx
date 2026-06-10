import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { injectSharedStyles } from './sharedStyles';
import { LoadingOverlay, Toast, Pagination, ConfirmModal } from './components.jsx';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
const ROWS = 10;

export default function ManifestsEditPage({ user, onLogout, onHome }) {
  injectSharedStyles();
  const navigate = useNavigate();

  const [page, setPage]                     = useState(0);
  const [manifests, setManifests]           = useState([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchBy, setSearchBy]             = useState('Manifest No');
  const [loading, setLoading]               = useState(false);
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [toDelete, setToDelete]             = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode]             = useState('manifests'); // 'manifests' | 'receipts'
  const [receipts, setReceipts]             = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [confirmReceiptOpen, setConfirmReceiptOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete]       = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('manifestsEditPage');
    if (saved) setPage(Number(saved));
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/manifests`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setManifests(await res.json());
    } catch { localStorage.removeItem('token'); setManifests([]); }
    finally { setLoading(false); }
  };

  const fetchReceipts = async () => {
    setReceiptsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/manifest-receipts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setReceipts(await res.json());
    } catch { setReceipts([]); }
    finally { setReceiptsLoading(false); }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const handleConfirmDeleteReceipt = async () => {
    if (!receiptToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/manifest-receipts/${receiptToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setReceipts(prev => prev.filter(r => r.id !== receiptToDelete.id));
      setSuccessMessage(`Receipt ${receiptToDelete.manifest_no} deleted successfully.`);
    } catch (err) { console.error(err); }
    finally { setConfirmReceiptOpen(false); setReceiptToDelete(null); setLoading(false); }
  };

  const handleChangePage = (p) => { setPage(p); sessionStorage.setItem('manifestsEditPage', p); };

  const filtered = manifests.filter(m => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (searchBy === 'Manifest No') return String(m.id ?? '').toLowerCase().includes(q);
    if (searchBy === 'Transporter') return (m.transporter ?? '').toLowerCase().includes(q);
    if (searchBy === 'Generator')   return (m.generator ?? '').toLowerCase().includes(q);
    return true;
  });

  const paged = filtered.slice(page * ROWS, page * ROWS + ROWS);

  const filteredReceipts = receipts.filter(r => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (searchBy === 'Manifest No') return String(r.manifest_no ?? '').toLowerCase().includes(q);
    if (searchBy === 'Transporter') return (r.transporter ?? '').toLowerCase().includes(q);
    if (searchBy === 'Generator')   return (r.generator ?? '').toLowerCase().includes(q);
    return true;
  });
  const pagedReceipts = filteredReceipts.slice(page * ROWS, page * ROWS + ROWS);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/manifests/${toDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setManifests(prev => prev.filter(m => m.id !== toDelete.id));
      setSuccessMessage(`Manifest ${toDelete.manifest_no} deleted successfully.`);
    } catch (err) { console.error(err); }
    finally { setConfirmOpen(false); setToDelete(null); setLoading(false); }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <ConfirmModal
        open={confirmOpen}
        title={`Delete manifest ${toDelete?.manifest_no}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        confirmLabel="Delete"
      />

      <ConfirmModal
        open={confirmReceiptOpen}
        title={`Delete receipt ${receiptToDelete?.manifest_no}?`}
        onConfirm={handleConfirmDeleteReceipt}
        onCancel={() => { setConfirmReceiptOpen(false); setReceiptToDelete(null); }}
        confirmLabel="Delete"
      />

      <div className="page-hero">
        <div className="page-hero-eyebrow">Management</div>
        <h1 className="page-hero-title">Edit Manifests</h1>
        <p className="page-hero-sub">Update or remove waste manifest records.</p>
      </div>

      <div className="app-container">
        {/* Toolbar */}
        <div className="app-toolbar">
          <div className="app-search-wrap">
            <span className="app-search-icon">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              className="app-input with-icon"
              placeholder={`Search ${searchBy}`}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
            />
          </div>
          <select className="app-select" value={searchBy} onChange={e => { setSearchBy(e.target.value); setPage(0); }}>
            {['Manifest No', 'Transporter', 'Generator'].map(o => <option key={o}>{o}</option>)}
          </select>

          {/* Toggle: Manifests / Receipts */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border)', gap: '2px', marginLeft: 'auto' }}>
            {[
              { id: 'manifests', label: 'Manifests', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> },
              { id: 'receipts',  label: 'Receipts',    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setViewMode(id); setPage(0); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
                  background: viewMode === id ? '#fff' : 'transparent',
                  color: viewMode === id ? 'var(--text)' : 'var(--text3)',
                  boxShadow: viewMode === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>

        <div className="app-card">
          {viewMode === 'manifests' ? (
            <>
              <table className="app-table">
                <thead>
                  <tr>
                    {['Date', 'Time', 'Transporter', 'Generator', 'Reference No.', 'Manifest No.', 'Description', ''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>No manifests found</td></tr>
                  ) : paged.map((m, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--text2)' }}>{new Date(m.date).toISOString().split('T')[0]}</td>
                      <td>{m.time}</td>
                      <td style={{ color: 'var(--text2)' }}>{m.transporter}</td>
                      <td>{m.generator}</td>
                      <td>{m.reference_no}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{m.id}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button className="btn-icon" title="Edit" onClick={() => navigate(`/manifest/${m.id}/edit`)}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon danger" title="Delete" onClick={() => { setToDelete(m); setConfirmOpen(true); }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
              <Pagination count={filtered.length} page={page} rowsPerPage={ROWS} onPageChange={handleChangePage} />
            </>
          ) : (
            <>
              <table className="app-table">
                <thead>
                  <tr>
                    {['Date', 'Time', 'Transporter', 'Generator', 'Reference No.', 'Receipt No.', 'Status', ''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receiptsLoading ? (
                    <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>Loading...</td></tr>
                  ) : pagedReceipts.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>No draft receipts found</td></tr>
                  ) : pagedReceipts.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--text2)' }}>{new Date(r.date).toISOString().split('T')[0]}</td>
                      <td>{r.time}</td>
                      <td style={{ color: 'var(--text2)' }}>{r.transporter}</td>
                      <td>{r.generator}</td>
                      <td>{r.reference_no}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r.manifest_no}</td>
                      <td>
                        {r.manifest_id
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'var(--green-lt)', color: '#166534', fontSize: 11, fontWeight: 600, border: '1px solid #BBF7D0' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                              Converted to Manifest
                            </span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 600, border: '1px solid #FDE68A' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97706', flexShrink: 0 }} />
                              Receipt
                            </span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {/* Edit only available for drafts not yet converted */}
                          {!r.manifest_id && (
                            <button
                              className="btn-icon"
                              title="Complete manifest"
                              onClick={() => navigate(`/manifest-receipt/${r.id}/edit`)}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          )}
                          <button className="btn-icon danger" title="Delete" onClick={() => { setReceiptToDelete(r); setConfirmReceiptOpen(true); }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
              <Pagination count={filteredReceipts.length} page={page} rowsPerPage={ROWS} onPageChange={handleChangePage} />
            </>
          )}
        </div>
      </div>

      <div className="sticky-footer">
        <button className="btn btn-outline" onClick={() => { sessionStorage.removeItem('manifestsEditPage'); navigate(-1); }}>
          ← Back
        </button>
      </div>
    </>
  );
}
