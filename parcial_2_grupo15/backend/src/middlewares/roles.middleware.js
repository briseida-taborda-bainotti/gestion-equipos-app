export function soloAdmin(req, res, next) {
  if (!['admin', 'encargado'].includes(req.usuario?.rol)) {
    return res.status(403).json({ error: 'No tenés permisos para esta acción' });
  }
  next();
}