import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WasteVerificationForm, { EMPTY_FORM } from "./WasteVerificationForm";
import {
  toFormData,
  toVerifyPayload,
  officeMissing,
} from "../helpers/serviceRequestForm";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const css = `
  .drawer-body-form { padding: 0 !important; }
  .drawer-body-form .wvf { padding: 12px; max-width: none; }
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sr-root {
    font-family: 'Inter', sans-serif;
    background: #F5F4F0;
    min-height: 100vh;
    color: #1C1C1E;
    padding: 40px 48px;
  }

  /* ── PAGE HEADER ── */
  .sr-page-header { margin-bottom: 36px; }

  .sr-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3D8B5A;
    margin-bottom: 8px;
  }

  .sr-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 40px;
    font-weight: 800;
    color: #1C1C1E;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 8px;
  }

  .sr-page-sub {
    font-size: 14px;
    color: #6B7280;
    font-weight: 400;
  }

  /* ── STAT CARDS ── */
  .sr-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  @media (max-width: 900px) { .sr-stats { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 500px) { .sr-stats { grid-template-columns: 1fr; } }

  .sr-stat {
    background: #fff;
    border: 1px solid #E8E6E1;
    border-radius: 18px;
    padding: 24px 22px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .sr-stat:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,0.07);
    transform: translateY(-2px);
  }

  .sr-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 18px 18px 0 0;
  }

  .sr-stat.pending::before  { background: linear-gradient(90deg,#D97706,#F59E0B); }
  .sr-stat.accepted::before { background: linear-gradient(90deg,#3D8B5A,#5BAF7A); }
  .sr-stat.rejected::before { background: linear-gradient(90deg,#DC2626,#EF4444); }
  .sr-stat.hold::before     { background: linear-gradient(90deg,#7C3AED,#A78BFA); }

  .sr-stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9CA3AF;
    margin-bottom: 10px;
  }

  .sr-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 46px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .sr-stat.pending  .sr-stat-value { color: #D97706; }
  .sr-stat.accepted .sr-stat-value { color: #3D8B5A; }
  .sr-stat.rejected .sr-stat-value { color: #DC2626; }
  .sr-stat.hold     .sr-stat-value { color: #7C3AED; }

  /* ── TOOLBAR ── */
  .sr-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .sr-search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 280px;
  }

  .sr-search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #9CA3AF;
    pointer-events: none;
  }

  .sr-input, .sr-select {
    background: #fff;
    border: 1.5px solid #E8E6E1;
    border-radius: 11px;
    color: #1C1C1E;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 10px 13px;
    outline: none;
    transition: border-color 0.16s, box-shadow 0.16s;
  }

  .sr-input { width: 100%; padding-left: 38px; }
  .sr-input::placeholder { color: #C4C2BC; }

  .sr-input:focus, .sr-select:focus {
    border-color: #3D8B5A;
    box-shadow: 0 0 0 3px rgba(61,139,90,0.1);
  }

  .sr-select {
    appearance: none;
    padding-right: 34px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%239CA3AF' strokeWidth='2' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-color: #fff;
    cursor: pointer;
    min-width: 180px;
  }

  /* ── TABLE ── */
  .sr-table-wrap {
    background: #fff;
    border: 1px solid #E8E6E1;
    border-radius: 18px;
    overflow: hidden;
  }

  .sr-table {
    width: 100%;
    border-collapse: collapse;
  }

  .sr-table thead tr { background: #FAFAF8; }

  .sr-table th {
    padding: 13px 18px;
    text-align: left;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9CA3AF;
    border-bottom: 1px solid #F0EEE9;
  }

  .sr-table th:first-child { padding-left: 24px; }
  .sr-table th:last-child  { padding-right: 24px; }

  .sr-table tbody tr {
    border-bottom: 1px solid #F5F4F0;
    transition: background 0.12s;
  }

  .sr-table tbody tr:last-child { border-bottom: none; }
  .sr-table tbody tr:hover { background: #FAFAF8; }

  .sr-table td {
    padding: 16px 18px;
    font-size: 13px;
    color: #6B7280;
    vertical-align: middle;
  }

  .sr-table td:first-child { padding-left: 24px; }
  .sr-table td:last-child  { padding-right: 24px; }

  .req-num {
    font-weight: 600;
    color: #1C1C1E;
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .cust-name { color: #374151; font-weight: 500; }

  .waste-tag {
    display: inline-block;
    background: #F5F4F0;
    border: 1px solid #E8E6E1;
    border-radius: 6px;
    padding: 3px 9px;
    font-size: 11px;
    color: #6B7280;
    font-weight: 500;
  }

  /* Status pills */
  .s-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }

  .s-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  .s-pill.pending  { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .s-pill.pending  .s-dot { background: #D97706; }
  .s-pill.accepted { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
  .s-pill.accepted .s-dot { background: #3D8B5A; }
  .s-pill.rejected { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
  .s-pill.rejected .s-dot { background: #DC2626; }
  .s-pill.hold     { background: #EDE9FE; color: #5B21B6; border: 1px solid #DDD6FE; }
  .s-pill.hold     .s-dot { background: #7C3AED; }
  .s-pill.default  { background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB; }
  .s-pill.default  .s-dot { background: #9CA3AF; }

  .review-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1.5px solid #E8E6E1;
    color: #6B7280;
    border-radius: 8px;
    padding: 6px 13px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .review-btn:hover {
    border-color: #3D8B5A;
    color: #3D8B5A;
    background: rgba(61,139,90,0.05);
  }

  /* ── PAGINATION ── */
  .sr-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    border-top: 1px solid #F0EEE9;
    font-size: 12px;
    color: #9CA3AF;
  }

  .pg-btns { display: flex; gap: 6px; }

  .pg-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #E8E6E1;
    background: transparent;
    color: #6B7280;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.14s;
  }

  .pg-btn:hover:not(:disabled) { border-color: #3D8B5A; color: #3D8B5A; }
  .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .pg-btn.active { background: #3D8B5A; border-color: #3D8B5A; color: #fff; }

  /* ── DRAWER OVERLAY ── */
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28,28,30,0.4);
    backdrop-filter: blur(4px);
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .drawer-overlay.open { opacity: 1; pointer-events: all; }

  /* ── DRAWER PANEL ── */
  .drawer-panel {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 880px;
    max-width: 95vw;
    background: #fff;
    border-left: 1px solid #E8E6E1;
    box-shadow: -8px 0 40px rgba(0,0,0,0.08);
    z-index: 101;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.28s cubic-bezier(0.32,0,0.16,1);
    overflow: hidden;
  }

  .drawer-panel.open { transform: translateX(0); }

  /* Drawer header */
  .drawer-header {
    background: linear-gradient(135deg, #F0F7F3 0%, #EBF5EE 100%);
    border-bottom: 1px solid #D6EDE0;
    padding: 28px 32px;
    flex-shrink: 0;
    position: relative;
  }

  .drawer-header-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #3D8B5A;
    margin-bottom: 8px;
  }

  .drawer-header-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #1C1C1E;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .drawer-header-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
  }

  .drawer-meta-item {
    font-size: 12px;
    color: #6B7280;
  }

  .drawer-meta-item strong { color: #374151; font-weight: 500; }

  .drawer-close {
    position: absolute;
    top: 24px; right: 24px;
    width: 34px; height: 34px;
    border-radius: 10px;
    background: rgba(0,0,0,0.05);
    border: 1px solid #D6EDE0;
    color: #6B7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.16s;
  }

  .drawer-close:hover { background: rgba(0,0,0,0.1); color: #1C1C1E; }

  /* Drawer body */
  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 0 32px 32px;
    scrollbar-width: thin;
    scrollbar-color: #E8E6E1 transparent;
  }

  .drawer-body::-webkit-scrollbar { width: 4px; }
  .drawer-body::-webkit-scrollbar-track { background: transparent; }
  .drawer-body::-webkit-scrollbar-thumb { background: #E8E6E1; border-radius: 4px; }

  /* Drawer sections */
  .dsec {
    padding: 24px 0;
    border-bottom: 1px solid #F0EEE9;
  }

  .dsec:last-child { border-bottom: none; }

  .dsec-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dsec-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #F0EEE9;
  }

  /* Info grid */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }

  .info-field {
    background: #FAFAF8;
    border: 1px solid #EDEAE4;
    border-radius: 12px;
    padding: 12px 16px;
  }

  .info-field.full { grid-column: 1 / -1; }

  .info-field-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9CA3AF;
    margin-bottom: 4px;
  }

  .info-field-value {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    line-height: 1.5;
  }

  /* MSDS link */
  .msds-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #F0F7F3;
    border: 1.5px solid #BBF7D0;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #3D8B5A;
    text-decoration: none;
    transition: all 0.16s;
  }

  .msds-btn:hover {
    background: #DCFCE7;
    border-color: #3D8B5A;
  }

  /* Office use banner */
  .office-banner {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: #92400E;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 18px;
  }

  /* Checklist */
  .checklist { display: flex; flex-direction: column; gap: 8px; }

  .checklist-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FAFAF8;
    border: 1px solid #EDEAE4;
    border-radius: 11px;
    padding: 13px 16px;
    gap: 16px;
    transition: border-color 0.16s;
  }

  .checklist-row:focus-within { border-color: #3D8B5A; box-shadow: 0 0 0 2px rgba(61,139,90,0.08); }

  .checklist-label {
    font-size: 13px;
    color: #4B5563;
    flex: 1;
    font-weight: 400;
  }

  .check-select {
    background: #fff;
    border: 1.5px solid #E8E6E1;
    border-radius: 8px;
    color: #1C1C1E;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 28px 6px 10px;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' fill='none' stroke='%239CA3AF' strokeWidth='2' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 9px center;
    cursor: pointer;
    min-width: 90px;
  }

  .check-select:focus { border-color: #3D8B5A; }

  /* Form fields */
  .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .form-row:last-child { margin-bottom: 0; }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
  }

  .form-input, .form-select, .form-textarea {
    background: #FAFAF8;
    border: 1.5px solid #E8E6E1;
    border-radius: 11px;
    color: #1C1C1E;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 12px 14px;
    outline: none;
    width: 100%;
    transition: border-color 0.16s, box-shadow 0.16s;
  }

  .form-input::placeholder, .form-textarea::placeholder { color: #C4C2BC; }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: #3D8B5A;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(61,139,90,0.1);
  }

  .form-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

  .form-select {
    appearance: none;
    padding-right: 34px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%239CA3AF' strokeWidth='2' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 13px center;
    background-color: #FAFAF8;
    cursor: pointer;
  }

  .sig-input {
    font-style: italic;
    font-size: 15px;
    letter-spacing: 0.03em;
    color: #374151;
  }

  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  @media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr; } }

  /* Drawer footer */
  .drawer-footer {
    flex-shrink: 0;
    padding: 18px 32px;
    border-top: 1px solid #EDEAE4;
    background: #FAFAF8;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .drawer-cancel {
    background: transparent;
    border: 1.5px solid #E8E6E1;
    border-radius: 10px;
    color: #6B7280;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 11px 22px;
    cursor: pointer;
    transition: all 0.16s;
  }

  .drawer-cancel:hover { border-color: #9CA3AF; color: #374151; }

  .drawer-save {
    background: #3D8B5A;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 11px 28px;
    cursor: pointer;
    transition: all 0.18s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.01em;
  }

  .drawer-save:hover {
    background: #2F6E47;
    box-shadow: 0 4px 16px rgba(61,139,90,0.3);
    transform: translateY(-1px);
  }

  .drawer-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Validation progress bar shown in the drawer footer */
  .form-progress-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-right: 16px;
  }

  .form-progress-label {
    font-size: 11px;
    color: #9CA3AF;
    font-weight: 500;
  }

  .form-progress-label span {
    font-weight: 700;
    color: #3D8B5A;
  }

  .form-progress-track {
    height: 4px;
    background: #E8E6E1;
    border-radius: 4px;
    overflow: hidden;
  }

  .form-progress-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #3D8B5A, #5BAF7A);
    transition: width 0.3s ease;
  }

  .form-progress-fill.complete { background: linear-gradient(90deg, #3D8B5A, #5BAF7A); }
  .form-progress-fill.partial  { background: linear-gradient(90deg, #D97706, #F59E0B); }

  /* Checklist "No" comment */
  .checklist-item-wrap {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .checklist-row.is-no {
    border-color: #FECACA;
    background: #FFF8F8;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
  }

  .checklist-comment {
    background: #FFF5F5;
    border: 1px solid #FECACA;
    border-top: 1px dashed #FECACA;
    border-radius: 0 0 11px 11px;
    padding: 10px 14px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #374151;
    width: 100%;
    resize: none;
    outline: none;
    line-height: 1.5;
    transition: border-color 0.16s, box-shadow 0.16s;
  }

  .checklist-comment::placeholder { color: #F87171; font-style: italic; }
  .checklist-comment:focus { border-color: #DC2626; box-shadow: 0 0 0 2px rgba(220,38,38,0.08); }

  .no-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #FEE2E2;
    color: #991B1B;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  /* Empty state */
  .empty-state {
    padding: 64px 24px;
    text-align: center;
    color: #9CA3AF;
  }

  .empty-icon {
    width: 52px; height: 52px;
    background: #F5F4F0;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "pending";
  if (s === "accepted") return "accepted";
  if (s === "rejected") return "rejected";
  if (s.includes("hold") || s.includes("review") || s.includes("investigation")) return "hold";
  return "default";
}

const STAFF_MAP = {
  Mfiki:   "Operations Supervisor",
  Unathi:  "Office Manager",
  Hoyi:    "Process Chemistry",
  Ntobeko: "Chief Executive Officer",
};

const ROWS_PER_PAGE = 5;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
function getMsdsUrl(doc) {
  if (!doc) return null;
  if (doc.startsWith('http')) return doc; // Cloudinary URLs hit this branch
  // Multer wrote the file on the portal server, so resolve against that host.
  // Note: REACT_APP_, not VITE_ — this is a Create React App build.
  const base = process.env.REACT_APP_PORTAL_URL || 'http://localhost:5000';
  if (doc.includes('/')) return `${base}/${doc}`;
  return `${base}/uploads/msds/${doc}`;
}

export default function ServiceRequestPage() {
  const API_URL = `${process.env.REACT_APP_API_URL}/api`;
  const API_URL_PORTAL = process.env.REACT_APP_PORTAL_URL || "http://localhost:5000";
  const [page, setPage]                     = useState(0);
  const [requests, setRequests]             = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch]                 = useState("");
  const [status, setStatus]                 = useState("");
  const [saving, setSaving]                 = useState(false);
  const navigate = useNavigate();

  // Single source of truth for the whole form — Section A (read-only here)
  // and Section B (editable) live in one object, shaped by the mapper.
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const patchForm = (patch) => setForm(prev => ({ ...prev, ...patch }));

  useEffect(() => { loadRequests(); }, [search, status]);

  const loadRequests = async () => {
    console.log("URL_Portal: ", API_URL_PORTAL);
    console.log("URL: ", API_URL);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL_PORTAL}/api/service-requests/admin?search=${search}&status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setRequests(data);
    } catch (error) { console.error(error); }
  };


  const saveVerification = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/service-requests/${selectedRequest.id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(toVerifyPayload(form)),
        }
      );

      if (!response.ok) {
        toast.error(
          response.status === 401
            ? "Your session has expired. Sign in again to save."
            : "The verification could not be saved. Try again."
        );
        return;
      }

      toast.success(
        form.decision === "Accepted"
          ? "Verification saved. A draft manifest is ready."
          : "Verification saved."
      );
      loadRequests();
      setSelectedRequest(null);
    } catch {
      toast.error("The verification could not be saved. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  // Section B validation lives in the mapper, shared with the print page
  const missing = officeMissing(form);
  const isFormValid = missing.length === 0;

  const paged = requests.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const totalPages = Math.ceil(requests.length / ROWS_PER_PAGE);

  const counts = {
    pending:  requests.filter(r => r.status === "Pending").length,
    accepted: requests.filter(r => r.status === "Accepted").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
    hold:     requests.filter(r => r.status === "Hold For Review").length,
  };

  const drawerOpen = Boolean(selectedRequest);

  const openReview = (request) => {
    setSelectedRequest(request);
    // One mapper builds Section A and Section B, so the drawer and the
    // printable copy can never show different values for the same request.
    setForm(toFormData(request));
  };
  return (
    <>
      <style>{css}</style>
      <div className="sr-root">

        {/* ── Header ── */}
        <div className="sr-page-header">
          <div className="sr-eyebrow">Admin Panel</div>
          <h1 className="sr-page-title">Service Requests</h1>
          <p className="sr-page-sub">Waste verification and approval workflow</p>
        </div>

        {/* ── Stats ── */}
        <div className="sr-stats">
          {[
            { cls: "pending",  label: "Pending",         val: counts.pending },
            { cls: "accepted", label: "Accepted",        val: counts.accepted },
            { cls: "rejected", label: "Rejected",        val: counts.rejected },
            { cls: "hold",     label: "Hold For Review", val: counts.hold },
          ].map(({ cls, label, val }) => (
            <div key={cls} className={`sr-stat ${cls}`}>
              <div className="sr-stat-label">{label}</div>
              <div className="sr-stat-value">{val}</div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="sr-toolbar">
          <div className="sr-search-wrap">
            <span className="sr-search-icon">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              className="sr-input"
              placeholder="Search Request #"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <select
            className="sr-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Further Investigation">Further Investigation</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Customer</th>
                <th>Waste Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="22" height="22" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1"/>
                        </svg>
                      </div>
                      No requests found
                    </div>
                  </td>
                </tr>
              ) : paged.map((request) => {
                const sc = statusClass(request.status);
                return (
                  <tr key={request.id}>
                    <td><span className="req-num">{request.request_number}</span></td>
                    <td><span className="cust-name">{request.customer_name}</span></td>
                    <td><span className="waste-tag">{request.waste_type}</span></td>
                    <td>
                      <span className={`s-pill ${sc}`}>
                        <span className="s-dot" />
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <button className="review-btn" onClick={() => openReview(request)}>
                        Review
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="sr-pagination">
            <span>
              {requests.length === 0 ? "No results" : `Showing ${page * ROWS_PER_PAGE + 1}–${Math.min((page + 1) * ROWS_PER_PAGE, requests.length)} of ${requests.length}`}
            </span>
            <div className="pg-btns">
              <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`pg-btn ${i === page ? "active" : ""}`} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── DRAWER OVERLAY ── */}
      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setSelectedRequest(null)} />

      {/* ── DRAWER PANEL ── */}
      <div className={`drawer-panel ${drawerOpen ? "open" : ""}`}>
        {selectedRequest && (
          <>
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-header-tag">Waste Verification Form</div>
              <div className="drawer-header-title">
                {selectedRequest.request_number}
              </div>
              <div className="drawer-header-meta">
                <span className="drawer-meta-item">
                  <strong>Status </strong>
                  <span className={`s-pill ${statusClass(selectedRequest.status)}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                    <span className="s-dot" /> {selectedRequest.status}
                  </span>
                </span>
                <span className="drawer-meta-item"><strong>Customer: </strong>{selectedRequest.customer_name}</span>
              </div>
              <button className="drawer-close" onClick={() => setSelectedRequest(null)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body — the form itself, exactly as the paper document */}
            <div className="drawer-body drawer-body-form">
              <WasteVerificationForm
                mode="office"
                data={form}
                onChange={patchForm}
                staffMap={STAFF_MAP}
                msdsUrl={getMsdsUrl(selectedRequest.msds_document)}
              />
            </div>

            {/* Footer */}
            <div className="drawer-footer">

              {/* What is still outstanding, named plainly */}
              <div className="form-progress-wrap">
                <div className={`form-progress-label ${isFormValid ? "ready" : ""}`}>
                  {isFormValid
                    ? "Ready to save"
                    : `Still needed: ${missing.join(", ")}`}
                </div>
              </div>

              <button
                className="drawer-cancel"
                onClick={() => navigate(`/service-requests/${selectedRequest.id}/form`)}
              >
                Open printable form
              </button>

              <button className="drawer-cancel" onClick={() => setSelectedRequest(null)}>Cancel</button>

              <button
                className="drawer-save"
                onClick={saveVerification}
                disabled={saving || !isFormValid}
                title={!isFormValid ? "Complete all required fields to save" : ""}
              >
                {saving ? (
                  <>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M12 2a10 10 0 0110 10"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    Save Verification
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <path d="M17 21v-8H7v8M7 3v5h8"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}