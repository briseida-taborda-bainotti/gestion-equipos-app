import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSolicitud, getHistorial,
  cancelarSolicitud, aprobarSolicitud, rechazarSolicitud, devolverSolicitud,
} from '../services/solicitudes.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearFecha, formatearFechaHora } from '../utils/fechaUtils.js';
import EstadoBadge from '../components/EstadoBadge.jsx';

function formatearValorHistorial(valor) {
  if (!valor) return '—';
  try {
    const obj = typeof valor === 'string' ? JSON.parse(valor) : valor;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ');
  } catch {
    return valor;
  }
}

export default function SolicitudDetalle() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [sol, setSol] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    getSolicitud(id).then(r => setSol(r.data)).catch(() => setError('Solicitud no encontrada'));
    getHistorial(id).then(r => setHistorial(r.data)).catch(() => {});
  }, [id]);

  async function accion(fn, nombre) {
    setError(''); setMensaje('');

    try {
      await fn(id);
      setMensaje(`Solicitud ${nombre} correctamente`);
      const r = await getSolicitud(id);
      setSol(r.data);
      const h = await getHistorial(id);
      setHistorial(h.data);
    } catch (err) {
      setError(err.response?.data?.error || `Error al ${nombre}`);
    }
  }

  if (error && !sol) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!sol) return <div style={{ padding: 24 }}>Cargando...</div>;

  const esAdmin = ['admin', 'encargado'].includes(usuario?.rol);
  const esPropietario = usuario?.id === sol.usuarioId;
  
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16, cursor: 'pointer', padding: '6px 14px' }}>
        ← Volver
      </button>
      <h2>Solicitud #{sol.id}</h2>
      {error  && <p style={{ color: 'red',   background: '#fef2f2', padding: 12, borderRadius: 6 }}>{error}</p>}
      {mensaje && <p style={{ color: 'green', background: '#f0fdf4', padding: 12, borderRadius: 6 }}>{mensaje}</p>}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <p><strong>Equipo:</strong> {sol.equipo?.nombre} ({sol.equipo?.categoria}) — ID: {sol.equipoId}</p>
        <p><strong>Solicitante:</strong> {sol.solicitante?.nombre} ({sol.solicitante?.email})</p>
        <p><strong>Período:</strong> {formatearFecha(sol.fechaRetiro)} → {formatearFecha(sol.fechaDevolucion)}</p>
        <p><strong>Motivo:</strong> {sol.motivo}</p>
        <p><strong>Estado:</strong> <EstadoBadge estado={sol.estado} vencida={sol.vencida} /></p>
        {sol.autorizador && <p><strong>Autorizado por:</strong> {sol.autorizador?.nombre}</p>}
      </div>
      {/* Acciones según rol y estado */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {(esPropietario || esAdmin) && sol.estado === 'pendiente' && (
          <button
            onClick={() => navigate(`/solicitudes/${sol.id}/editar`)}
            style={{ padding: '8px 16px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Editar
          </button>
        )}
        {(esPropietario || esAdmin) && ['pendiente', 'aprobada'].includes(sol.estado) && (
          <button onClick={() => accion(cancelarSolicitud, 'cancelada')}
            style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
        {esAdmin && sol.estado === 'pendiente' && (
          <>
            <button onClick={() => accion(aprobarSolicitud, 'aprobada')}
              style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Aprobar
            </button>
            <button onClick={() => accion(rechazarSolicitud, 'rechazada')}
              style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Rechazar
            </button>
          </>
        )}
        {esAdmin && sol.estado === 'aprobada' && (
          <button onClick={() => accion(devolverSolicitud, 'devuelta')}
            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Marcar devuelta
          </button>
        )}
      </div>
      {/* Historial */}
      <h3>Historial</h3>
      {historial.length === 0 && <p>Sin registros de historial.</p>}
      {historial.map(h => (
        <div key={h.id} style={{ borderLeft: '3px solid #1e3a5f', paddingLeft: 12, marginBottom: 10 }}>
          <strong>{h.accion}</strong> — {h.actor?.nombre} — {formatearFechaHora(h.fechaHora)}
          {h.valorAnterior && <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>Antes: {formatearValorHistorial(h.valorAnterior)}</p>}
          {h.valorNuevo && <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>Después: {formatearValorHistorial(h.valorNuevo)}</p>}
        </div>
      ))}
    </div>
  );
}