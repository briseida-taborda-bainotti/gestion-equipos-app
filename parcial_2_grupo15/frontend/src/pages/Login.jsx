import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { loginService } from '../services/auth.service.js';

export default function Login() {
  const location = useLocation();
  const mensajeRegistro = location.state?.mensaje;
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const res = await loginService(form);
      login(res.data);
      navigate('/solicitudes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  }
  
  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Iniciar sesión</h2>
      {mensajeRegistro && (
        <p style={{ color: 'green', background: '#f0fdf4', padding: 8, borderRadius: 4 }}>
          {mensajeRegistro}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ flex: 1, border: 'none', outline: 'none', padding: 8 }}
              required
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Contraseña</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ flex: 1, border: 'none', outline: 'none', padding: 8 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1e3a5f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>¿No tenés cuenta? <Link to="/register">Registrarse</Link></p>
    </div>
  );
}