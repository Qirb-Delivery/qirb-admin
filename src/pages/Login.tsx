import { useState, CSSProperties, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { password });
      localStorage.setItem('admin_token', res.data.data.token);
      navigate('/');
    } catch {
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{ fontSize: 40, textAlign: 'center' }}>🇪🇹</div>
        <h1 style={styles.title}>Habesha Admin</h1>
        <p style={styles.subtitle}>Enter admin password to continue</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          style={{ width: '100%' }}
          autoFocus
        />

        <button type="submit" disabled={loading || !password} style={styles.button}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0F0F0F',
  },
  card: {
    background: '#1A1A1A',
    borderRadius: 16,
    padding: '48px 40px',
    width: 380,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    border: '1px solid #2A2A2A',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    margin: 0,
  },
  error: {
    background: '#3D1A1A',
    color: '#E74C3C',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    background: '#2ECC71',
    color: '#0F0F0F',
    border: 'none',
    borderRadius: 10,
    padding: '12px',
    fontSize: 16,
    fontWeight: 700,
    marginTop: 8,
  },
};
