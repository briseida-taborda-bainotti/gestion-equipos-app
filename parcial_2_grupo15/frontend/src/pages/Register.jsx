import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useNavigate, Link } from 'react-router-dom';
import { registerService } from '../services/auth.service.js';

export default function Register() {

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await registerService({ nombre: form.nombre, email: form.email, password: form.password });
      navigate('/login', { state: { mensaje: 'Registro exitoso. Iniciá sesión.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  }
  
  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Registrarse</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {['nombre', 'email'].map(field => (
          <div key={field} style={{ marginBottom: 16 }}>
            <label style={{ textTransform: 'capitalize' }}>{field}</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ flex: 1, border: 'none', outline: 'none', padding: 8 }}
                required
              />
            </div>
          </div>
        ))}
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
              onClick={() => setShowPassword(prev => !prev)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 20,
                padding: '0 12px',
                color: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Confirmar contraseña</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              style={{ flex: 1, border: 'none', outline: 'none', padding: 8 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 20,
                padding: '0 12px',
                color: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
              aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1e3a5f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Registrarse
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </div>
  );
}