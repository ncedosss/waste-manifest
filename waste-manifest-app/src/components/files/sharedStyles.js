// Inject this once at your app root: import { injectSharedStyles } from './sharedStyles';
// Then call injectSharedStyles() inside your top-level component.

export const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #F5F4F0;
    color: #1C1C1E;
  }

  /* ── TOKENS ── */
  :root {
    --bg:        #F5F4F0;
    --surface:   #FFFFFF;
    --surface2:  #FAFAF8;
    --border:    #E8E6E1;
    --border2:   #EDEAE4;
    --text:      #1C1C1E;
    --text2:     #374151;
    --text3:     #6B7280;
    --text4:     #9CA3AF;
    --green:     #3D8B5A;
    --green-lt:  #DCFCE7;
    --green-dk:  #2F6E47;
    --amber:     #D97706;
    --red:       #DC2626;
    --purple:    #7C3AED;
    --font-disp: 'Syne', sans-serif;
    --font-body: 'Inter', sans-serif;
    --radius:    14px;
    --radius-sm: 10px;
    --shadow:    0 2px 12px rgba(0,0,0,0.06);
    --shadow-md: 0 8px 28px rgba(0,0,0,0.09);
  }

  /* ── LOADING OVERLAY ── */
  .app-loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(245,244,240,0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1300;
  }

  .app-spinner {
    width: 44px;
    height: 44px;
    border: 3px solid var(--border);
    border-top-color: var(--green);
    border-radius: 50%;
    animation: app-spin 0.7s linear infinite;
  }

  @keyframes app-spin { to { transform: rotate(360deg); } }

  /* ── TOAST / SNACKBAR ── */
  .app-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1400;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    box-shadow: var(--shadow-md);
    animation: toast-in 0.22s ease;
    max-width: 480px;
  }

  .app-toast.success { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
  .app-toast.warning { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .app-toast.error   { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }

  .app-toast-close {
    background: none; border: none; cursor: pointer;
    color: inherit; opacity: 0.6; margin-left: 8px;
    font-size: 16px; line-height: 1; padding: 0;
  }

  .app-toast-close:hover { opacity: 1; }

  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── PAGE HERO ── */
  .page-hero {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 40px 48px 32px;
    margin-bottom: 32px;
  }

  .page-hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--green);
    margin-bottom: 8px;
  }

  .page-hero-title {
    font-family: var(--font-disp);
    font-size: 36px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 6px;
  }

  .page-hero-sub {
    font-size: 14px;
    color: var(--text3);
  }

  /* ── CONTAINER ── */
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px 80px;
  }

  /* ── CARD ── */
  .app-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
  }

  /* ── TOOLBAR ── */
  .app-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  /* ── SEARCH INPUT ── */
  .app-search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
    max-width: 280px;
  }

  .app-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text4);
    pointer-events: none;
  }

  .app-input {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 11px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 13px;
    padding: 10px 13px;
    outline: none;
    transition: border-color 0.16s, box-shadow 0.16s;
  }

  .app-input.with-icon { padding-left: 38px; }
  .app-input::placeholder { color: #C4C2BC; }

  .app-input:focus, .app-select:focus {
    border-color: var(--green);
    box-shadow: 0 0 0 3px rgba(61,139,90,0.1);
  }

  .app-select {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 11px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 13px;
    padding: 10px 34px 10px 13px;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%239CA3AF' strokeWidth='2' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
    transition: border-color 0.16s, box-shadow 0.16s;
  }

  /* ── TABLE ── */
  .app-table-wrap { overflow: hidden; }

  .app-table {
    width: 100%;
    border-collapse: collapse;
  }

  .app-table thead tr { background: var(--surface2); }

  .app-table th {
    padding: 12px 16px;
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text4);
    border-bottom: 1px solid var(--border2);
    white-space: nowrap;
  }

  .app-table th:first-child { padding-left: 22px; }
  .app-table th:last-child  { padding-right: 22px; }

  .app-table tbody tr {
    border-bottom: 1px solid #F5F4F0;
    transition: background 0.12s;
  }

  .app-table tbody tr:last-child { border-bottom: none; }
  .app-table tbody tr:hover { background: var(--surface2); }

  .app-table td {
    padding: 14px 16px;
    font-size: 13px;
    color: var(--text3);
    text-align: center;
    vertical-align: middle;
  }

  .app-table td:first-child { padding-left: 22px; }
  .app-table td:last-child  { padding-right: 22px; }

  /* ── PAGINATION ── */
  .app-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 22px;
    border-top: 1px solid var(--border2);
    font-size: 12px;
    color: var(--text4);
  }

  .pg-btns { display: flex; gap: 5px; }

  .pg-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text3);
    font-size: 11px;
    font-family: var(--font-body);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.14s;
  }

  .pg-btn:hover:not(:disabled) { border-color: var(--green); color: var(--green); }
  .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .pg-btn.active { background: var(--green); border-color: var(--green); color: #fff; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.16s;
    border: none;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--green);
    color: #fff;
    border: none;
  }

  .btn-primary:hover {
    background: var(--green-dk);
    box-shadow: 0 4px 14px rgba(61,139,90,0.3);
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-outline {
    background: transparent;
    color: var(--text2);
    border: 1.5px solid var(--border);
  }

  .btn-outline:hover { border-color: var(--text4); background: var(--surface2); }

  .btn-danger {
    background: transparent;
    color: var(--red);
    border: 1.5px solid #FECACA;
  }

  .btn-danger:hover { background: #FEE2E2; border-color: var(--red); }

  .btn-success {
    background: var(--green-lt);
    color: #166534;
    border: 1px solid #BBF7D0;
  }

  .btn-success:hover { background: #BBF7D0; }

  .btn-icon {
    padding: 7px;
    border-radius: 8px;
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--text3);
    cursor: pointer;
    transition: all 0.14s;
  }

  .btn-icon:hover { border-color: var(--green); color: var(--green); background: rgba(61,139,90,0.05); }
  .btn-icon.danger:hover { border-color: var(--red); color: var(--red); background: #FEE2E2; }

  /* ── STICKY FOOTER BAR ── */
  .sticky-footer {
    position: sticky;
    bottom: 0;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 14px 32px;
    display: flex;
    justify-content: center;
    z-index: 10;
  }

  /* ── MODAL / DIALOG ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28,28,30,0.4);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .modal-panel {
    background: var(--surface);
    border-radius: 20px;
    border: 1px solid var(--border);
    box-shadow: 0 16px 48px rgba(0,0,0,0.14);
    width: 100%;
    max-width: 520px;
    overflow: hidden;
  }

  .modal-header {
    padding: 22px 28px 16px;
    border-bottom: 1px solid var(--border2);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    font-family: var(--font-disp);
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .modal-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.14s;
  }

  .modal-close:hover { background: var(--border); color: var(--text); }

  .modal-body {
    padding: 22px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .modal-footer {
    padding: 16px 28px;
    border-top: 1px solid var(--border2);
    background: var(--surface2);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  /* ── FORM FIELDS ── */
  .field-wrap { display: flex; flex-direction: column; gap: 5px; }

  .field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text4);
  }

  .field-input, .field-select, .field-textarea {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 13px;
    padding: 11px 13px;
    outline: none;
    width: 100%;
    transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
  }

  .field-input::placeholder, .field-textarea::placeholder { color: #C4C2BC; }

  .field-input:focus, .field-select:focus, .field-textarea:focus {
    border-color: var(--green);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(61,139,90,0.1);
  }

  .field-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

  .field-select {
    appearance: none;
    padding-right: 34px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%239CA3AF' strokeWidth='2' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 13px center;
    background-color: var(--surface2);
    cursor: pointer;
  }

  .field-helper { font-size: 11px; color: var(--text4); margin-top: 3px; }
  .field-error  { font-size: 11px; color: var(--red);   margin-top: 3px; }

  /* ── AUTOCOMPLETE DROPDOWN ── */
  .ac-wrap { position: relative; }

  .ac-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    z-index: 50;
    max-height: 220px;
    overflow-y: auto;
  }

  .ac-option {
    padding: 10px 13px;
    font-size: 13px;
    color: var(--text2);
    cursor: pointer;
    transition: background 0.12s;
  }

  .ac-option:hover { background: var(--surface2); color: var(--green); }

  /* ── STATUS PILLS ── */
  .s-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
  }

  .s-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  .s-pill.pending  { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .s-pill.pending  .s-dot { background: var(--amber); }
  .s-pill.accepted { background: var(--green-lt); color: #166534; border: 1px solid #BBF7D0; }
  .s-pill.accepted .s-dot { background: var(--green); }
  .s-pill.rejected { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
  .s-pill.rejected .s-dot { background: var(--red); }
  .s-pill.default  { background: #F3F4F6; color: var(--text3); border: 1px solid #E5E7EB; }
  .s-pill.default  .s-dot { background: var(--text4); }

  /* ── TOGGLE / SWITCH ── */
  .toggle-wrap {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: var(--text2); font-weight: 500;
  }

  .toggle-track {
    position: relative;
    width: 40px; height: 22px;
    background: var(--border);
    border-radius: 11px;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    border: none;
    padding: 0;
  }

  .toggle-track.on { background: var(--green); }

  .toggle-thumb {
    position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }

  .toggle-track.on .toggle-thumb { transform: translateX(18px); }

  /* ── CHECKBOX GROUP ── */
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
  }

  .checkbox-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--surface2);
    font-size: 13px;
    font-weight: 500;
    color: var(--text2);
    cursor: pointer;
    transition: all 0.14s;
    user-select: none;
  }

  .checkbox-chip:hover { border-color: var(--green); color: var(--green); }

  .checkbox-chip.checked {
    background: rgba(61,139,90,0.08);
    border-color: var(--green);
    color: var(--green);
    font-weight: 600;
  }

  .checkbox-chip-dot {
    width: 14px; height: 14px;
    border-radius: 4px;
    border: 1.5px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .checkbox-chip.checked .checkbox-chip-dot::after {
    content: '';
    width: 7px; height: 5px;
    border-left: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg) translateY(-1px);
  }

  /* ── ACCORDION ── */
  .acc-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    margin-bottom: 10px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }

  .acc-item:focus-within { box-shadow: 0 0 0 2px rgba(61,139,90,0.12); }

  .acc-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.14s;
  }

  .acc-header:hover { background: var(--surface2); }

  .acc-header-left {
    display: flex; align-items: center; gap: 14px;
  }

  .acc-num {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: var(--text);
    color: #F4F3EF;
    font-size: 12px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-family: var(--font-disp);
  }

  .acc-title {
    font-family: var(--font-disp);
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .acc-status {
    display: flex; align-items: center; gap: 8px;
  }

  .acc-chevron {
    transition: transform 0.22s ease;
    color: var(--text4);
    flex-shrink: 0;
  }

  .acc-chevron.open { transform: rotate(180deg); }

  .acc-valid   { color: var(--green); }
  .acc-invalid { color: #E5534B; }

  .acc-body {
    border-top: 1px solid var(--border2);
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── WASTE ITEMS TABLE ── */
  .wi-table-wrap {
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  .wi-table { width: 100%; border-collapse: collapse; }

  .wi-table th {
    background: var(--surface2);
    padding: 10px 14px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text4);
    border-bottom: 1px solid var(--border2);
    text-align: center;
  }

  .wi-table td {
    padding: 12px 14px;
    font-size: 13px;
    color: var(--text2);
    border-bottom: 1px solid #F5F4F0;
    text-align: center;
    vertical-align: middle;
  }

  .wi-table tr:last-child td { border-bottom: none; }
  .wi-table tbody tr:hover { background: var(--surface2); }
  .wi-table td:first-child { text-align: left; }

  /* ── SIGNATURE BOX ── */
  .sig-box {
    border: 2px dashed var(--border);
    border-radius: 12px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: var(--surface2);
    transition: border-color 0.16s, background 0.16s;
    position: relative;
    overflow: hidden;
  }

  .sig-box:hover { border-color: var(--green); background: rgba(61,139,90,0.03); }
  .sig-box.signed { border-style: solid; border-color: #BBF7D0; background: rgba(61,139,90,0.03); }

  .sig-box-placeholder { font-size: 13px; color: var(--text4); font-style: italic; }

  /* ── HOME GRID ── */
  .home-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 700px) { .home-grid { grid-template-columns: 1fr; } }

  .home-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px 26px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: box-shadow 0.2s, transform 0.2s;
    cursor: pointer;
    text-decoration: none;
  }

  .home-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .home-card-icon {
    width: 46px; height: 46px;
    border-radius: 13px;
    background: rgba(61,139,90,0.1);
    color: var(--green);
    display: flex; align-items: center; justify-content: center;
  }

  .home-card-title {
    font-family: var(--font-disp);
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .home-card-desc { font-size: 13px; color: var(--text3); line-height: 1.55; flex: 1; }

  .home-card-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--green);
    margin-top: 4px;
  }
`;

export function injectSharedStyles() {
  if (document.getElementById('app-shared-styles')) return;
  const style = document.createElement('style');
  style.id = 'app-shared-styles';
  style.textContent = SHARED_CSS;
  document.head.appendChild(style);
}
