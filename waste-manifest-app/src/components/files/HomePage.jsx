import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { injectSharedStyles } from './sharedStyles';

const CARDS = [
  {
    title: 'Start New Manifest',
    description: 'Begin a new waste manifest and complete required form fields.',
    action: 'Create',
    link: '/create',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    title: 'View Manifests',
    description: 'Access previously submitted manifests and track their status.',
    action: 'View',
    link: '/manifests',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
  },
  {
    title: 'Manage Manifests',
    description: 'Update details of previously submitted manifests.',
    action: 'Manage',
    link: '/manifestsedit',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    title: 'Manage Entities',
    description: 'Update information for waste generators and transporters.',
    action: 'Manage',
    link: '/entities',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

export default function HomePage({ user, onLogout, onHome }) {
  injectSharedStyles();
  const navigate = useNavigate();

  return (
    <>
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <div className="page-hero">
        <div className="page-hero-eyebrow">Waste Management</div>
        <h1 className="page-hero-title">Digital Waste Manifest</h1>
        <p className="page-hero-sub">Create, manage, and track waste manifests seamlessly.</p>
      </div>

      <div className="app-container">
        <div className="home-grid">
          {CARDS.map((card) => (
            <button
              key={card.link}
              className="home-card"
              onClick={() => navigate(card.link)}
              style={{ textAlign: 'left', font: 'inherit' }}
            >
              <div className="home-card-icon">{card.icon}</div>
              <div className="home-card-title">{card.title}</div>
              <div className="home-card-desc">{card.description}</div>
              <div className="home-card-action">
                {card.action}
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
