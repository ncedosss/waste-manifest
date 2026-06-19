import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from './Header';
import { injectSharedStyles } from './sharedStyles';
import { LoadingOverlay, Toast, Pagination, ConfirmModal } from './components.jsx';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
const ROWS = 10;

export default function ManifestsPage({ user, onLogout, onHome }) {
  injectSharedStyles();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [page, setPage]                         = useState(0);
  const [manifests, setManifests]               = useState([]);
  const [manifestsExports, setManifestsExports] = useState([]);
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchBy, setSearchBy]                 = useState('Manifest No');
  const [loading, setLoading]                   = useState(false);
  const [successMessage, setSuccessMessage]     = useState('');
  const [exportOpen, setExportOpen]             = useState(false);
  const [viewMode, setViewMode]                 = useState('manifests'); // 'manifests' | 'receipts'
  const [receipts, setReceipts]                 = useState([]);
  const [receiptsLoading, setReceiptsLoading]   = useState(false);
  const [startDate, setStartDate]               = useState('');
  const [endDate, setEndDate]                   = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('manifestsPage');
    if (saved) setPage(Number(saved));
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => { fetchManifests(); }, []);
  useEffect(() => { fetchExports(); }, []);
  useEffect(() => { fetchReceipts(); }, []);

  const fetchManifests = async () => {
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

  const fetchExports = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/manifests-exports`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setManifestsExports(await res.json());
    } catch { setManifestsExports([]); }
  };

  const handleChangePage = (p) => { setPage(p); sessionStorage.setItem('manifestsPage', p); };

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
    if (searchBy === 'Manifest No')  return String(r.manifest_no ?? '').toLowerCase().includes(q);
    if (searchBy === 'Transporter')  return (r.transporter ?? '').toLowerCase().includes(q);
    if (searchBy === 'Generator')    return (r.generator ?? '').toLowerCase().includes(q);
    return true;
  });
  const pagedReceipts = filteredReceipts.slice(page * ROWS, page * ROWS + ROWS);

  const handleExport = () => {
    setExportOpen(false);
    let data = manifestsExports;
    if (startDate && endDate) {
      const s = new Date(startDate), e = new Date(endDate);
      data = data.filter(m => { const d = new Date(m.declaration_date); return d >= s && d <= e; });
    }
    const rows = data.map(m => ({
      Date: new Date(m.declaration_date).toISOString().split('T')[0],
      Time: m.time, Transporter: m.transporter, Generator: m.generator,
      'Reference No.': m.reference_no, 'Manifest No.': m.manifest_id,
      Description: m.description, Packaging: m.packaging, 'Waste Type': m.waste_type,
      'Waste Form': m.waste_form, Volume: m.volume_l, 'Density (kg/L)': '',
      'Weight (kg)': m.weight_kg, Process: m.process, 'Final Disposal': m.final_disposal,
      'Planned Disposal Date': m.planned_disposal_date, 'Disposal Ref. No': '',
      'Quote No,': '', 'PO No': '', Comments: m.Comments
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Manifests');
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' }), 'manifests.xlsx');
    setStartDate(''); setEndDate('');
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <div className="page-hero">
        <div className="page-hero-eyebrow">Records</div>
        <h1 className="page-hero-title">Waste Manifests</h1>
        <p className="page-hero-sub">View all submitted manifests and export reports.</p>
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

          <select
            className="app-select"
            value={searchBy}
            onChange={e => { setSearchBy(e.target.value); setPage(0); }}
          >
            {['Manifest No', 'Transporter', 'Generator'].map(o => <option key={o}>{o}</option>)}
          </select>

          {/* Toggle: Manifests / Receipts */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border)', gap: '2px' }}>
            <button
              onClick={() => { setViewMode('manifests'); setPage(0); }}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
                background: viewMode === 'manifests' ? '#fff' : 'transparent',
                color: viewMode === 'manifests' ? 'var(--text)' : 'var(--text3)',
                boxShadow: viewMode === 'manifests' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 5, verticalAlign: 'middle' }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              Manifests
            </button>
            <button
              onClick={() => { setViewMode('receipts'); setPage(0); }}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
                background: viewMode === 'receipts' ? '#fff' : 'transparent',
                color: viewMode === 'receipts' ? 'var(--text)' : 'var(--text3)',
                boxShadow: viewMode === 'receipts' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 5, verticalAlign: 'middle' }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              Receipts
            </button>
          </div>

          <div style={{ flex: 1 }} />

          <button className="btn btn-success" onClick={() => setExportOpen(true)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>

        {/* Table */}
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
                        <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '12px' }}
                          onClick={() => navigate(`/manifest/${m.id}/view`)}>
                          View PDF
                        </button>
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
                    {['Date', 'Time', 'Transporter', 'Generator', 'Reference No.', 'Receipt No.', ''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receiptsLoading ? (
                    <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>Loading...</td></tr>
                  ) : pagedReceipts.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>No receipts found</td></tr>
                  ) : pagedReceipts.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--text2)' }}>{new Date(r.date).toISOString().split('T')[0]}</td>
                      <td>{r.time}</td>
                      <td style={{ color: 'var(--text2)' }}>{r.transporter}</td>
                      <td>{r.generator}</td>
                      <td>{r.reference_no}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r.manifest_no}</td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '12px' }}
                          onClick={() => navigate(`/manifest_receipt/${r.id}/view`)}>
                          View PDF
                        </button>
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

      {/* Sticky back */}
      <div className="sticky-footer">
        <button className="btn btn-outline" onClick={() => { sessionStorage.removeItem('manifestsPage'); navigate(-1); }}>
          ← Back
        </button>
      </div>

      {/* Export date-range modal */}
      {exportOpen && (
        <div className="modal-overlay" onClick={() => setExportOpen(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Export Date Range</span>
              <button className="modal-close" onClick={() => setExportOpen(false)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="field-wrap">
                <label className="field-label">Start Date</label>
                <input type="date" className="field-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="field-wrap">
                <label className="field-label">End Date</label>
                <input type="date" className="field-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setExportOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleExport}>Export XLSX</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
