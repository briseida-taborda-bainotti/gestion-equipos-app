export function success(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function created(res, data) {
  return success(res, data, 201);
}

export function notFound(res, message = 'Recurso no encontrado') {
  return res.status(404).json({ ok: false, error: message });
}
