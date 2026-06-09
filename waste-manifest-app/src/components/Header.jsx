import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { injectSharedStyles } from './sharedStyles';

const API_URL_PORTAL = process.env.REACT_APP_PORTAL_URL || "http://localhost:5000";

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

  /* Red dot on the avatar when there are pending requests */
  .header-avatar-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 10px;
    height: 10px;
    background: #DC2626;
    border-radius: 50%;
    border: 2px solid #fff;
    animation: badge-pulse 2s ease infinite;
  }

  @keyframes badge-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
    50%       { box-shadow: 0 0 0 5px rgba(220,38,38,0); }
  }

  .header-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 270px;
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
    position: relative;
  }

  .header-menu-item:hover { background: var(--surface2); color: var(--text); }

  .header-menu-item.danger { color: var(--red); }
  .header-menu-item.danger:hover { background: #FEE2E2; }

  .header-menu-divider {
    height: 1px;
    background: var(--border2);
    margin: 4px 0;
  }

  /* Count badge next to menu item label */
  .menu-badge {
    margin-left: auto;
    background: #DC2626;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    font-family: var(--font-body);
    padding: 2px 7px;
    border-radius: 20px;
    min-width: 20px;
    text-align: center;
    line-height: 16px;
    flex-shrink: 0;
  }

  /* Alert banner at top of dropdown */
  .menu-pending-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: #FEF2F2;
    border-bottom: 1px solid #FECACA;
    font-size: 12px;
    color: #991B1B;
    font-weight: 500;
  }

  .menu-pending-dot {
    width: 7px; height: 7px;
    background: #DC2626;
    border-radius: 50%;
    flex-shrink: 0;
    animation: badge-pulse 2s ease infinite;
  }
`;

export default function Header({ user, onLogout }) {
  const [open, setOpen]                 = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const menuRef  = useRef(null);

  injectSharedStyles();

  // Fetch pending count on mount and poll every 60 seconds
  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching pending count with token:', token);
      if (!token) return;
      const res = await fetch(
        `${API_URL_PORTAL}/api/service-requests/admin?search=&status=Pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Fetch pending count response', res);
      if (!res.ok) {
        const errBody = await res.json();
        console.log('Error body:', errBody);  
        return;
      }
      const data = await res.json();
      setPendingCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const hasPending = pendingCount > 0;

  return (
    <>
      <style>{css}</style>
      <header className="app-header">
        <div className="header-brand">
          <span className="header-brand-dot" />
          Manifest Manager
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          {/* Avatar button — red pulsing dot appears when pending requests exist */}
          <button className="header-avatar-btn" onClick={() => setOpen(o => !o)}>
            {user.username.charAt(0).toUpperCase()}
            {hasPending && <span className="header-avatar-badge" />}
          </button>

          {open && (
            <div className="header-menu">

              {/* Alert banner */}
              {hasPending && (
                <div className="menu-pending-banner">
                  <span className="menu-pending-dot" />
                  {pendingCount} pending service request{pendingCount !== 1 ? 's' : ''} awaiting review
                </div>
              )}

              {/* User info */}
              <div className="header-menu-user">
                <div className="header-menu-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                    {user.username}
                  </div>
                  <div className="header-menu-email">{user.email}</div>
                </div>
              </div>

              {/* Service Requests — badge shows count */}
              <button
                className="header-menu-item"
                onClick={() => { navigate('/service-requests'); setOpen(false); }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
                Service Requests
                {hasPending && (
                  <span className="menu-badge">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </button>

              <div className="header-menu-divider" />

              <button
                className="header-menu-item danger"
                onClick={() => { setOpen(false); onLogout(); }}
              >
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