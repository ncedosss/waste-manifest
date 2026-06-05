import React, { useEffect, useState } from 'react';
import Header from './Header';
import { injectSharedStyles } from './sharedStyles';
import { LoadingOverlay, Pagination } from './components.jsx';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
const ROWS = 10;

function parseXeroDate(d) {
  if (!d) return '';
  const m = d.match(/\d+/);
  return m ? new Date(Number(m[0])).toISOString().split('T')[0] : '';
}

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'accepted';
  if (s === 'voided') return 'rejected';
  if (s === 'draft') return 'default';
  return 'default';
}

export default function InvoicesPage({ user, onLogout, onHome }) {
  injectSharedStyles();

  const [loading, setLoading]       = useState(false);
  const [invoices, setInvoices]     = useState([]);
  const [page, setPage]             = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const res = await fetch(`${API_URL}/invoices`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.needsAuth) {
        const authWindow = window.open(data.authUrl, 'XeroLogin', `width=600,height=700,top=${window.screen.height/2-350},left=${window.screen.width/2-300}`);
        const handler = (e) => {
          if (e.origin !== window.location.origin) return;
          if (e.data === 'xero-auth-success') { fetchInvoices(); window.removeEventListener('message', handler); }
        };
        window.addEventListener('message', handler);
        return;
      }
      setInvoices(data.Invoices || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filtered = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      inv.InvoiceNumber?.toLowerCase().includes(q) ||
      inv.Reference?.toLowerCase().includes(q) ||
      inv.Contact?.Name?.toLowerCase().includes(q) ||
      inv.Status?.toLowerCase().includes(q)
    );
  });

  const paged = filtered.slice(page * ROWS, page * ROWS + ROWS);

  const HEADERS = ['Type', 'Invoice No', 'Contact', 'Reference', 'Date', 'Due Date', 'Status', 'Total', 'Amount Due'];

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <div className="page-hero">
        <div className="page-hero-eyebrow">Billing</div>
        <h1 className="page-hero-title">Xero Invoices</h1>
        <p className="page-hero-sub">Invoices synced directly from Xero.</p>
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
              placeholder="Search invoice, contact, reference…"
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
              {!loading && filtered.length === 0 ? (
                <tr><td colSpan={HEADERS.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--text4)' }}>No invoices found</td></tr>
              ) : paged.map(inv => (
                <tr key={inv.InvoiceID}>
                  <td><span className="s-pill default"><span className="s-dot" />{inv.Type}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{inv.InvoiceNumber}</td>
                  <td style={{ color: 'var(--text2)', fontWeight: 500 }}>{inv.Contact?.Name}</td>
                  <td>{inv.Reference || '—'}</td>
                  <td>{parseXeroDate(inv.Date)}</td>
                  <td>{parseXeroDate(inv.DueDate)}</td>
                  <td>
                    <span className={`s-pill ${statusClass(inv.Status)}`}>
                      <span className="s-dot" />
                      {inv.Status}
                    </span>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {inv.Total?.toFixed(2)}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: inv.AmountDue > 0 ? 'var(--red)' : 'var(--green)' }}>
                    {inv.AmountDue?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination count={filtered.length} page={page} rowsPerPage={ROWS} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}
