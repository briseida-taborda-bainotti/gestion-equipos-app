const COLOR = {
  pendiente: '#f59e0b',
  aprobada: '#10b981',
  rechazada: '#ef4444',
  cancelada: '#6b7280',
  devuelta: '#3b82f6',
};

export default function EstadoBadge({ estado, vencida }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
      <span style={{
        background: COLOR[estado] || '#6b7280',
        color: 'white',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 13,
        textTransform: 'capitalize',
      }}>
        {estado}
      </span>
      {vencida && (
        <span style={{
          background: '#c74200',
          color: 'white',
          padding: '2px 10px',
          borderRadius: 12,
          fontSize: 13,
          textTransform: 'capitalize',
        }}>
          vencida
        </span>
      )}
    </div>
  );
}
