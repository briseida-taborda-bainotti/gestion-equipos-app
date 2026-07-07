// Convierte "2026-06-19" → "19/6/2026" sin corrimiento de zona horaria
export function formatearFecha(fecha) {
  if (!fecha) return '—';
  // Tomamos solo la parte de fecha (YYYY-MM-DD) y la partimos manualmente
  // para evitar que el navegador la interprete como UTC y la corra un día
  const solo = (typeof fecha === 'string' ? fecha : fecha.toISOString()).slice(0, 10);
  const [anio, mes, dia] = solo.split('-');
  return `${parseInt(dia)}/${parseInt(mes)}/${anio}`;
}

// Para fechas con hora (timestamps del historial) sí usamos toLocaleString con es-AR
export function formatearFechaHora(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
