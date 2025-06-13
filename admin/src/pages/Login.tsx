import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Si déjà connecté, propose la déconnexion et empêche l'accès au formulaire
    const user = localStorage.getItem('adminUser');
    if (user) {
      setShowLogout(true);
    } else {
      setShowLogout(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setShowLogout(false);
    navigate('/admin/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #5F4B8B 0%, #FF914D 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 18,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        padding: 36,
        width: 360,
        maxWidth: '90vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img src="/logo192.png" alt="Logo" style={{ width: 64, marginBottom: 18 }} />
        <h2 style={{
          color: '#5F4B8B',
          fontWeight: 700,
          marginBottom: 24,
          letterSpacing: 1
        }}>Connexion Admin</h2>
        {showLogout ? (
          <button
            onClick={handleLogout}
            style={{
              marginBottom: 18,
              background: '#FF4D4F',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Se déconnecter
          </button>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, color: '#5F4B8B' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    marginTop: 6,
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    outline: 'none',
                    fontSize: 16,
                    background: '#F7F6FB',
                    transition: 'border 0.2s',
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500, color: '#5F4B8B' }}>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    marginTop: 6,
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    outline: 'none',
                    fontSize: 16,
                    background: '#F7F6FB',
                    transition: 'border 0.2s',
                  }}
                />
              </div>
              {error && <div style={{ color: '#FF4D4F', marginBottom: 14, textAlign: 'center' }}>{error}</div>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#b39ddb' : 'linear-gradient(90deg, #5F4B8B 60%, #FF914D 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(95,75,139,0.10)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => {
                  if (!loading) (e.currentTarget.style.background = 'linear-gradient(90deg, #FF914D 60%, #5F4B8B 100%)');
                }}
                onMouseOut={e => {
                  if (!loading) (e.currentTarget.style.background = 'linear-gradient(90deg, #5F4B8B 60%, #FF914D 100%)');
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <span>Pas de compte ? </span>
              <span
                style={{ color: '#5F4B8B', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => navigate('/admin/register')}
              >
                S'inscrire
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
