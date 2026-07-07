import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSolicitud, updateSolicitud, getSolicitud } from '../services/solicitudes.service.js';
import { getEquipos } from '../services/equipos.service.js';

export default function SolicitudForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);
  const [form, setForm] = useState({ equipoId: '', fechaRetiro: '', fechaDevolucion: '', motivo: '' });
  const [equipos, setEquipos] = useState([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Obtener fecha mínima (hoy) en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (esEdicion) {
      getSolicitud(id).then(r => {
        const s = r.data;
        setForm({ equipoId: s.equipoId, fechaRetiro: s.fechaRetiro, fechaDevolucion: s.fechaDevolucion, motivo: s.motivo });
      });
    }
  }, [id]);

  // Filtrar equipos cuando cambien las fechas
  useEffect(() => {
    if (form.fechaRetiro && form.fechaDevolucion) {
      getEquipos({ 
        fechaRetiro: form.fechaRetiro,
        fechaDevolucion: form.fechaDevolucion,
      }).then(r => setEquipos(r.data)).catch(err => console.error(err));
    }
  }, [form.fechaRetiro, form.fechaDevolucion]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setEnviando(true);
    
    try {
      if (esEdicion) {
        await updateSolicitud(id, form);
      } else {
        await createSolicitud(form);
      }

      navigate('/solicitudes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la solicitud');
    } finally {
      setEnviando(false);
    }
  }
  
  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 32, border: '1px solid #e5e7eb', borderRadius: 8, background: 'white' }}>
      <h2>{esEdicion ? 'Editar solicitud' : 'Nueva solicitud'}</h2>
      {error && <p style={{ color: 'red', background: '#fef2f2', padding: 10, borderRadius: 6 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Fecha de retiro</label>
          <input 
            type="date" 
            value={form.fechaRetiro} 
            onChange={e => setForm({ ...form, fechaRetiro: e.target.value })}
            min={hoy}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} 
            required 
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Fecha de devolución</label>
          <input 
            type="date" 
            value={form.fechaDevolucion} 
            onChange={e => setForm({ ...form, fechaDevolucion: e.target.value })}
            min={form.fechaRetiro || hoy}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} 
            required 
          />
        </div>
        {esEdicion && (
          <div style={{ marginBottom: 16 }}>
            <label>Equipo</label>
            <p style={{ marginTop: 4, padding: 8, background: '#f3f4f6', borderRadius: 4, fontSize: 14 }}>
              Equipo #{form.equipoId} (no se puede cambiar)
            </p>
          </div>
        )}
        {!esEdicion && form.fechaRetiro && form.fechaDevolucion && (
          <div style={{ marginBottom: 16 }}>
            <label>Equipo</label>
            {equipos.length > 0 ? (
              <select value={form.equipoId} onChange={e => setForm({ ...form, equipoId: e.target.value })}
                style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} required>
                <option value="">Seleccioná un equipo</option>
                {equipos.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nombre} — {eq.categoria} ({eq.ubicacion}) {eq.requiereAutorizacion ? '(Requiere autorización)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ color: '#ef4444', marginTop: 4, fontSize: 14 }}>No hay equipos disponibles para este rango de fechas</p>
            )}
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <label>Motivo</label>
          <textarea value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, minHeight: 80 }} required />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={enviando || (!esEdicion && !form.equipoId)}
            style={{ flex: 1, padding: 10, background: '#1e3a5f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: (enviando || (!esEdicion && !form.equipoId)) ? 0.5 : 1 }}>
            {enviando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear solicitud')}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            style={{ padding: 10, background: '#e5e7eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}