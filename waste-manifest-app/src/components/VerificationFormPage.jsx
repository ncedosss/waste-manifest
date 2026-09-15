/* =====================================================================
   VerificationFormPage.jsx
   Route: /service-requests/:id/form

   The completed Waste Verification Form as a document — Section A as the
   customer declared it, Section B as the receiving point found it, on one
   page that prints identically to SOP0012/14-1.

   This is what gets printed for the file, or saved as PDF and emailed to
   the customer to show any differences between what they declared and
   what was actually received.
   ===================================================================== */

import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WasteVerificationForm from "./WasteVerificationForm";
import { toFormData } from "../helpers/serviceRequestForm";
import Header from "./Header";

const PORTAL_URL = process.env.REACT_APP_PORTAL_URL || "http://localhost:5000";

function msdsUrl(doc) {
  if (!doc) return null;
  if (doc.startsWith("http")) return doc;
  return doc.includes("/")
    ? `${PORTAL_URL}/${doc}`
    : `${PORTAL_URL}/uploads/msds/${doc}`;
}

const bar = `
.vfp-bar {
  display: flex; align-items: center; gap: 10px;
  max-width: 960px; margin: 18px auto 0; padding: 0 18px;
  font-family: Arial, Helvetica, sans-serif; font-size: 12px;
}
.vfp-bar .spacer { flex: 1; }
.vfp-bar button {
  border: 1px solid #1d7a3d; background: #fff; color: #1d7a3d;
  padding: 6px 16px; font: inherit; cursor: pointer;
}
.vfp-bar button.primary { background: #1d7a3d; color: #fff; }
.vfp-bar button:hover { opacity: .9; }
.vfp-state {
  max-width: 960px; margin: 40px auto; padding: 0 18px;
  font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #444;
}
@media print { .vfp-bar, .app-header, header { display: none !important; } }
`;

export default function VerificationFormPage({ user, onLogout, onHome }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${PORTAL_URL}/api/service-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setError("Your session has expired. Sign in again to view this form.");
        return;
      }
      if (res.status === 404) {
        setError("That service request no longer exists.");
        return;
      }
      if (!res.ok) {
        setError("The form could not be loaded. Try again in a moment.");
        return;
      }

      setRequest(await res.json());
    } catch {
      setError("The form could not be loaded. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <style>{bar}</style>
      {Header && <Header user={user} onLogout={onLogout} onHome={onHome} />}

      <div className="vfp-bar">
        <button onClick={() => navigate("/service-requests")}>
          Back to service requests
        </button>
        <span className="spacer" />
        {request && (
          <button className="primary" onClick={() => window.print()}>
            Print or save as PDF
          </button>
        )}
      </div>

      {loading && <div className="vfp-state">Loading the form\u2026</div>}

      {!loading && error && (
        <div className="vfp-state">
          {error}{" "}
          <button
            onClick={load}
            style={{
              border: 0, background: "none", color: "#1d7a3d",
              textDecoration: "underline", cursor: "pointer", font: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && request && (
        <WasteVerificationForm
          mode="print"
          data={toFormData(request)}
          onChange={() => {}}
          msdsUrl={msdsUrl(request.msds_document)}
        />
      )}
    </>
  );
}
