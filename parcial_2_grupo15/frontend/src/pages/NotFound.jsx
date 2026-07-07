import { Link } from 'react-router-dom';

export default function NotFound() {
  
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontSize: 72, color: '#1e3a5f', margin: 0 }}>404</h1>
      <p style={{ fontSize: 20, color: '#4b5563' }}>Página no encontrada</p>
      <Link to="/" style={{ color: '#1e3a5f' }}>Volver al inicio</Link>
    </div>
  );
}