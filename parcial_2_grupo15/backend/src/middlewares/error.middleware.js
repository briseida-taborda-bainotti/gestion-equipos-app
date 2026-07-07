// Firma obligatoria con 4 parámetros para que Express lo reconozca como handler de errores
// eslint-disable-next-line no-unused-vars

export default function errorMiddleware(err, req, res, next) {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
}