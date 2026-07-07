import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSolicitudes } from '../services/solicitudes.service.js';
import { getEquipos } from '../services/equipos.service.js';
import { formatearFecha } from '../utils/fechaUtils.js';
import EstadoBadge from '../components/EstadoBadge.jsx';

const ESTADOS = ['', 'pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta'];

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({ estado: '', categoria: '', equipoId: '', desde: '', hasta: '' });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    getEquipos({}).then(r => {
      const cats = [...new Set(r.data.map(eq => eq.categoria))].sort();
      setCategorias(cats);
    }).catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  useEffect(() => { fetchSolicitudes(); }, [pagina, filtros]);
  async function fetchSolicitudes() {
    setCargando(true); setError('');

    try {
      const params = { ...filtros, page: pagina, limit: 10 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await getSolicitudes(params);
      setSolicitudes(res.data.solicitudes);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar solicitudes');
    } finally {
      setCargando(false);
    }
  }
  
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Solicitudes</h2>
        <Link to="/solicitudes/nueva" style={{ padding: '8px 16px', background: '#1e3a5f', color: 'white', borderRadius: 4, textDecoration: 'none' }}>
          + Nueva
        </Link>
      </div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })} style={{ padding: 8 }}>
          {ESTADOS.map(e => <option key={e} value={e}>{e || 'Todos los estados'}</option>)}
        </select>
        <select value={filtros.categoria} onChange={e => setFiltros({ ...filtros, categoria: e.target.value })} style={{ padding: 8 }}>
          <option value="">Todas las categorías</option>
          {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input placeholder="ID Equipo" value={filtros.equipoId} onChange={e => setFiltros({ ...filtros, equipoId: e.target.value })} style={{ padding: 8 }} />
        <input type="date" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })} style={{ padding: 8 }} />
        <input type="date" value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} style={{ padding: 8 }} />
        <button onClick={() => { setFiltros({ estado: '', categoria: '', equipoId: '', desde: '', hasta: '' }); setPagina(1); }}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>Limpiar</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && solicitudes.length === 0 && <p>No hay solicitudes para mostrar.</p>}
      {solicitudes.map(sol => (
        <div key={sol.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12, background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{sol.equipo?.nombre || `Equipo #${sol.equipoId}`}</strong>
            <EstadoBadge estado={sol.estado} vencida={sol.vencida} />
          </div>
          <p style={{ margin: '8px 0', color: '#4b5563' }}>{sol.motivo}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            {formatearFecha(sol.fechaRetiro)} → {formatearFecha(sol.fechaDevolucion)} | Solicitante: {sol.solicitante?.nombre}
          </p>
          <Link to={`/solicitudes/${sol.id}`} style={{ fontSize: 13, color: '#1e3a5f', textDecoration: 'none' }}>
            Ver detalle →
          </Link>
        </div>
      ))}
      {/* Paginación */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} style={{ padding: '6px 14px', cursor: 'pointer' }}>
          Anterior
        </button>
        <span style={{ padding: '6px 0' }}>Página {pagina} — Total: {total}</span>
        <button disabled={pagina * 10 >= total} onClick={() => setPagina(p => p + 1)} style={{ padding: '6px 14px', cursor: 'pointer' }}>
          Siguiente
        </button>
      </div>
    </div>
  );
}