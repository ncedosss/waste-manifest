import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { injectSharedStyles } from './sharedStyles';

const css = `
  .app-header {
    background: #fff;
    border-bottom: 1px solid var(--border);
    height: 58px;
    display: flex;
    align-items: center;
    padding: 0 28px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-brand {
    font-family: var(--font-disp);
    font-size: 16px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-brand-dot {
    width: 8px; height: 8px;
    background: var(--green);
    border-radius: 50%;
  }

  .header-avatar-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: var(--green);
    color: #fff;
    font-family: var(--font-disp);
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.16s;
    position: relative;
  }

  .header-avatar-btn:hover { opacity: 0.85; }

  .header-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 260px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.1);
    overflow: hidden;
    z-index: 200;
  }

  .header-menu-user {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border2);
  }

  .header-menu-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--green);
    color: #fff;
    font-family: var(--font-disp);
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .header-menu-email {
    font-size: 12px;
    color: var(--text3);
    word-break: break-all;
  }

  .header-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 18px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text2);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-body);
    transition: background 0.12s;
  }

  .header-menu-item:hover { background: var(--surface2); color: var(--text); }

  .header-menu-item.danger { color: var(--red); }
  .header-menu-item.danger:hover { background: #FEE2E2; }

  .header-menu-divider {
    height: 1px;
    background: var(--border2);
    margin: 4px 0;
  }
`;

export default function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  injectSharedStyles();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <>
      <style>{css}</style>
      <header className="app-header">
        <div className="header-brand">
          <span className="header-brand-dot" />
          Manifest Manager
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="header-avatar-btn" onClick={() => setOpen(o => !o)}>
            {user.username.charAt(0).toUpperCase()}
          </button>

          {open && (
            <div className="header-menu">
              <div className="header-menu-user">
                <div className="header-menu-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{user.username}</div>
                  <div className="header-menu-email">{user.email}</div>
                </div>
              </div>

              {/* <button className="header-menu-item" onClick={() => { navigate('/billing'); setOpen(false); }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                </svg>
                Billing
              </button> */}

              {/* <button className="header-menu-item" onClick={() => { navigate('/service-requests'); setOpen(false); }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
                Service Requests
              </button> */}
              <button
                className="header-menu-item"
                // disabled
                style={{ opacity: 0.4, cursor: 'not-allowed' }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
                Service Requests
              </button>

              <div className="header-menu-divider" />

              <button className="header-menu-item danger" onClick={() => { setOpen(false); onLogout(); }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
