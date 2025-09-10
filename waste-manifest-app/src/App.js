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
import { useState, useEffect, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  // timers
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
    setShowExpiryModal(false);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    navigate('/');
  }, [navigate]);

  const scheduleTimers = useCallback((expiry) => {
    const now = Date.now();
    const msUntilExpiry = expiry - now;

    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    // warning 1 minute before expiry
    const warningTime = msUntilExpiry - 60 * 1000;

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    if (warningTime > 0) {
      warningTimerRef.current = setTimeout(() => setShowExpiryModal(true), warningTime);
    } else {
      setShowExpiryModal(true); // show immediately if less than 1min left
    }

    logoutTimerRef.current = setTimeout(() => logout(), msUntilExpiry);
  }, [logout]);

  const refreshSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return logout();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to refresh');

      const { token: newToken } = await res.json();
      const decoded = jwtDecode(newToken);
      const expiry = decoded.exp * 1000;

      localStorage.setItem('token', newToken);
      localStorage.setItem('tokenExpiry', expiry);
      setUser({ id: decoded.id, username: decoded.username });
      setShowExpiryModal(false);

      scheduleTimers(expiry);
    } catch (err) {
      console.error(err);
      logout();
    }
  }, [logout, scheduleTimers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');

    if (token && expiry) {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, username: decoded.username });
      scheduleTimers(Number(expiry));
    }
  }, [scheduleTimers]);

  const home = () => navigate('/');

  return (
    <>
      {/* Session Expiry Modal */}
      <Dialog open={showExpiryModal}>
        <DialogTitle>Session Expiring</DialogTitle>
        <DialogContent>
          Your session will expire in less than 1 minute. Do you want to stay logged in?
        </DialogContent>
        <DialogActions>
          <Button onClick={logout} color="error">Logout</Button>
          <Button onClick={refreshSession} variant="contained" color="primary">
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>

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
        <Route path="/entities" element={<EntitiesPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifestsedit" element={<ManifestsEditPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/edit" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/view" element={<ManifestPDFViewer />} />
        <Route path="/create" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </>
  );
}

export default App;