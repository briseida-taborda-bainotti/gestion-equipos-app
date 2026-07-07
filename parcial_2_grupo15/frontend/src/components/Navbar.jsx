import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate('/login');
  }

 return (
    <nav style={{ padding: '12px 24px', background: '#1e3a5f', color: 'white', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}> </Link>
      {usuario && (
        <>
          <Link to="/solicitudes" style={{ color: 'white' }}>Solicitudes</Link>
          <Link to="/solicitudes/nueva" style={{ color: 'white' }}>Nueva</Link>
          {['admin', 'encargado'].includes(usuario.rol) && (
            <Link to="/resumen" style={{ color: 'white' }}>Resumen</Link>
          )}
          <span style={{ marginLeft: 'auto' }}>{usuario.nombre} ({usuario.rol})</span>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', cursor: 'pointer', padding: '4px 12px', borderRadius: '4px' }}>
            Salir
          </button>
        </>
      )}
    </nav>
  );
}