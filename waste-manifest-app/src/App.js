import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Authentication from './components/authentication/Authentication';
import ResetPassword from './components/authentication/ResetPassword';
import ManifestsPage from './components/ManifestsPage';
import HomePage from './components/HomePage';
import { useState } from 'react';
import CreatePage from './components/CreatePage';
import EntitiesPage from './components/EntitiesPage';
import ManifestPDFViewer from './components/ManifestPDFViewer';
import ManifestsEditPage from './components/ManifestsEditPage';
import VerifyEmail from './components/authentication/VerifyEmail';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };
  const home = () => {
    navigate('/');
  };
  return (
      <Routes>
        <Route path="/" element={user ? (<HomePage user={user} onLogout={logout} onHome={home} />): (<Authentication setUser={setUser} />)} />
        <Route path="/manifests" element={<ManifestsPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/entities" element={<EntitiesPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifestsedit" element={<ManifestsEditPage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/edit" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/manifest/:id/view" element={<ManifestPDFViewer />} onHome={home} />
        <Route path="/create" element={<CreatePage user={user} onLogout={logout} onHome={home} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
  );
}

export default App;
