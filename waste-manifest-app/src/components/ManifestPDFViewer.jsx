import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { injectSharedStyles } from './sharedStyles';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function ManifestPDFViewer() {
  injectSharedStyles();
  const { id }   = useParams();
  const location = useLocation();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError]   = useState(null);

  // Detect whether this is a receipt or a manifest from the URL path
  // /manifest-receipt/:id/view  → receipt
  // /manifest/:id/view          → manifest
  const isReceipt = location.pathname.includes('manifest_receipt');
  const pdfEndpoint = isReceipt
    ? `${API_URL}/manifest-receipts/${id}/pdf`
    : `${API_URL}/manifests/${id}/pdf`;

  useEffect(() => {
    const fetchPDF = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(pdfEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const blob = await res.blob();
        setPdfUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
        setError('Failed to load PDF. Please try again.');
      }
    };
    fetchPDF();
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pdfEndpoint]);

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)',
        flexDirection: 'column', gap: '16px', color: 'var(--text3)'
      }}>
        <svg width="40" height="40" fill="none" stroke="var(--red)" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{error}</span>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)',
        flexDirection: 'column', gap: '16px'
      }}>
        <div className="app-spinner" />
        <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Loading PDF…</span>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
        <p style={{ padding: '24px', fontFamily: 'var(--font-body)' }}>
          PDF cannot be displayed.{' '}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>
            Click here to download it.
          </a>
        </p>
      </object>
    </div>
  );
}
