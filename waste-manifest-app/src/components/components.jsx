import React, { useEffect } from 'react';

/* ── LOADING OVERLAY ── */
export function LoadingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className="app-loading-overlay">
      <div className="app-spinner" />
    </div>
  );
}

/* ── TOAST ── */
export function Toast({ message, type = 'success', onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const icons = {
    success: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    warning: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
    ),
    error: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
      </svg>
    ),
  };

  return (
    <div className={`app-toast ${type}`}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button className="app-toast-close" onClick={onClose}>×</button>
    </div>
  );
}

/* ── PAGINATION ── */
export function Pagination({ count, page, rowsPerPage, onPageChange }) {
  const total = Math.ceil(count / rowsPerPage);
  const start = count === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, count);

  const pages = Array.from({ length: total }, (_, i) => i);
  const visible = pages.filter(p => Math.abs(p - page) <= 2);

  return (
    <div className="app-pagination">
      <span>{count === 0 ? 'No results' : `${start}–${end} of ${count}`}</span>
      <div className="pg-btns">
        <button className="pg-btn" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        {visible.map(p => (
          <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>
            {p + 1}
          </button>
        ))}
        <button className="pg-btn" onClick={() => onPageChange(page + 1)} disabled={page >= total - 1}>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── CONFIRM MODAL ── */
export function ConfirmModal({ open, title, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onCancel}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '20px 28px' }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── AUTOCOMPLETE INPUT ── */
export function AutocompleteInput({ label, value, options = [], onChange, placeholder, required }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value || '');
  const ref = React.useRef(null);

  React.useEffect(() => { setQuery(value || ''); }, [value]);

  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="field-wrap ac-wrap" ref={ref}>
      {label && <label className="field-label">{label}{required && ' *'}</label>}
      <input
        className="field-input"
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || `Search ${label || ''}…`}
      />
      {open && filtered.length > 0 && (
        <div className="ac-dropdown">
          {filtered.map(opt => (
            <div key={opt} className="ac-option" onMouseDown={() => handleSelect(opt)}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── TOGGLE SWITCH ── */
export function Toggle({ checked, onChange, label, labelPlacement = 'end' }) {
  return (
    <div className="toggle-wrap" style={{ flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row' }}>
      <button
        type="button"
        className={`toggle-track ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="toggle-thumb" />
      </button>
      {label && <span>{label}</span>}
    </div>
  );
}

/* ── CHECKBOX CHIP ── */
export function CheckboxChip({ label, checked, onChange, name }) {
  return (
    <label className={`checkbox-chip ${checked ? 'checked' : ''}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <span className="checkbox-chip-dot" />
      {label}
    </label>
  );
}

/* ── SECTION ACCORDION ── */
export function Accordion({ number, title, valid, children, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="acc-item">
      <button type="button" className="acc-header" onClick={() => setOpen(o => !o)}>
        <div className="acc-header-left">
          <span className="acc-num">{number}</span>
          <span className="acc-title">{title}</span>
        </div>
        <div className="acc-status">
          {valid === true && (
            <svg className="acc-valid" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
            </svg>
          )}
          {valid === false && (
            <svg className="acc-invalid" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          )}
          <svg className={`acc-chevron ${open ? 'open' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}
