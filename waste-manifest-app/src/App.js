import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Authentication from './components/authentication/Authentication';
import ResetPassword from './components/authentication/ResetPassword';
import ManifestsPage from './components/ManifestsPage';
import HomePage from './components/HomePage';
import { useState, useEffect, useRef } from 'react';
import CreatePage from './components/CreatePage';
import EntitiesPage from './components/EntitiesPage';
import ManifestPDFViewer from './components/ManifestPDFViewer';
import ManifestsEditPage from './components/ManifestsEditPage';
import VerifyEmail from './components/authentication/VerifyEmail';
import jwtDecode from 'jwt-decode';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Keep refs for timers so we can reset them
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
    setShowTimeoutWarning(false);
    navigate('/');
  };

  const scheduleTimers = (expiry) => {
    const now = Date.now();
    const timeout = expiry - now;
    const warningTime = timeout - 60000; // 1 min before

    // clear old timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // set new timers
    if (warningTime > 0) {
      warningTimerRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, warningTime);
    }

    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, timeout);
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return logout();
      const res = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to refresh');

      const { token: newToken } = await res.json();
      const decoded = jwtDecode(newToken);
      const expiry = decoded.exp * 1000;

      localStorage.setItem('token', newToken);
      localStorage.setItem('tokenExpiry', expiry);
      setUser({ id: decoded.id, username: decoded.username });
      setShowTimeoutWarning(false);

      // reschedule timers
      scheduleTimers(expiry);
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const home = () => {
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');

    if (token && expiry) {
      const now = Date.now();

      if (now >= expiry) {
        logout();
      } else {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, username: decoded.username });

        scheduleTimers(Number(expiry));
      }
    }
  }, []);

  return (
    <>
      {showTimeoutWarning && (
        <div className="session-warning">
          ⚠️ Your session will expire in 1 minute.
          <button onClick={refreshToken}>Stay Logged In</button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <HomePage user={user} onLogout={logout} onHome={home} />
            ) : (
              <Authentication setUser={setUser} />
            )
          }
        />
        <Route path="/manifests" element={<ManifestsPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/entities" element={<EntitiesPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifestsedit" element={<ManifestsEditPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/edit" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/view" element={<ManifestPDFViewer />} onHome={home} />
        <Route path="/create" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </>
  );
}

export default App;