import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Authentication from './components/authentication/Authentication';
import ResetPassword from './components/authentication/ResetPassword';
import ManifestsPage from './components/ManifestsPage';
import HomePage from './components/HomePage';
import CreatePage from './components/CreatePage';
import EntitiesPage from './components/EntitiesPage';
import ManifestPDFViewer from './components/ManifestPDFViewer';
import ManifestsEditPage from './components/ManifestsEditPage';
import VerifyEmail from './components/authentication/VerifyEmail';
import ServiceRequestsPage from './components/ServiceRequestsPage';
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import InvoicesPage from './components/InvoicesPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, username: decoded.username });
      } catch {
        logout();
      }
    }
  }, [logout]);

  const home = () => navigate('/');

  return (
    <>
      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={user ? (
            <HomePage user={user} onLogout={logout} onHome={home} />
          ) : (
            <Authentication setUser={setUser} />
          )}
        />
        <Route path="/manifests" element={<ManifestsPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/billing" element={<InvoicesPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/entities" element={<EntitiesPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/service-requests" element={<ServiceRequestsPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifestsedit" element={<ManifestsEditPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/edit" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest_receipt/:receiptId/edit" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/view" element={<ManifestPDFViewer />} />
        <Route path="/manifest_receipt/:id/view" element={<ManifestPDFViewer />} />
        <Route path="/create" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}

export default App;