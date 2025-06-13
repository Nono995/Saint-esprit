import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'editor', label: 'Editeur' }
];

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('moderator');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Inscription réussie !');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
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
        width: 380,
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
        }}>Créer un compte Admin</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, color: '#5F4B8B' }}>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
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
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
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
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
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
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: '#5F4B8B' }}>Rôle</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
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
              }}
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {error && <div style={{ color: '#FF4D4F', marginBottom: 14, textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: '#4CAF50', marginBottom: 14, textAlign: 'center' }}>{success}</div>}
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
            }}
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span>Déjà un compte ? </span>
          <span
            style={{ color: '#5F4B8B', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => navigate('/admin/login')}
          >
            Se connecter
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
