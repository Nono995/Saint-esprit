import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './config/firebaseConfig';
import Podcasts from './pages/Podcasts';
import Prayers from './pages/Prayers';
import Testimonies from './pages/Testimonies';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles.css';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <div>
                <nav className="nav">
                  <div className="nav-content">
                    <a href="/" className="nav-brand">
                      Church Admin
                    </a>
                    <div className="nav-links">
                      <a href="/admin/podcasts" className="nav-link">
                        Podcasts
                      </a>
                      <a href="/admin/prayers" className="nav-link">
                        Prières
                      </a>
                      <a href="/admin/testimonies" className="nav-link">
                        Témoignages
                      </a>
                      <a href="/admin/events" className="nav-link">
                        Événements
                      </a>
                    </div>
                  </div>
                </nav>
                <div className="main-content">
                  <Routes>
                    <Route path="/admin/podcasts" element={<Podcasts />} />
                    <Route path="/admin/prayers" element={<Prayers />} />
                    <Route path="/admin/testimonies" element={<Testimonies />} />
                    <Route path="/admin/events" element={<Events />} />
                    <Route path="*" element={<Navigate to="/admin/podcasts" replace />} />
                  </Routes>
                </div>
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
