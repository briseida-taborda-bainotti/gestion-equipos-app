import { useEffect, useState } from 'react';
import { getResumen } from '../services/solicitudes.service.js';

export default function Resumen() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResumen().then(r => setData(r.data)).catch(err => setError(err.response?.data?.error || 'Error'));
  }, []);

  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!data) return <div style={{ padding: 24 }}>Cargando...</div>;
  
  return (
    <div style={{ padding: 24 }}>
      <h2>Panel de resumen</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Pendientes de aprobación', valor: data.pendientes, color: '#f59e0b' },
          { label: 'Préstamos vencidos',        valor: data.vencidas,   color: '#ef4444' },
          { label: 'Equipos prestados',         valor: data.prestados,  color: '#3b82f6' },
        ].map(({ label, valor, color }) => (
          <div key={label} style={{ background: 'white', border: `2px solid ${color}`, borderRadius: 8, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color }}>{valor}</div>
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <h3>Equipos disponibles por categoría</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '10px 16px', textAlign: 'left',   border: '1px solid #e5e7eb' }}>Categoría</th>
            <th style={{ padding: '10px 16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>Disponibles</th>
          </tr>
        </thead>
        <tbody>
          {data.equiposPorCategoria.map(eq => (
            <tr key={eq.categoria}>
              <td style={{ padding: '10px 16px', border: '1px solid #e5e7eb' }}>{eq.categoria}</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{eq.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}