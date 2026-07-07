import * as svc from '../services/solicitudes.service.js';
export const listar = async (req, res, next) => {
  try {
    const result = await svc.listar({
      ...req.query,
      usuarioRol: req.usuario.rol,
      usuarioId: req.usuario.id,
    });
    res.json(result);
  } catch (e) { next(e); }
};

export const detalle = async (req, res, next) => {
  try { res.json(await svc.obtener(req.params.id)); }
  catch (e) { next(e); }
};

export const historial = async (req, res, next) => {
  try { res.json(await svc.obtenerHistorial(req.params.id)); }
  catch (e) { next(e); }
};

export const crear = async (req, res, next) => {
  try {
    const sol = await svc.crear(req.body, req.usuario.id);
    res.status(201).json(sol);
  } catch (e) { next(e); }
};

export const editar = async (req, res, next) => {
  try {
    const sol = await svc.editar(
      req.params.id,
      req.body,
      req.usuario.id,
      req.usuario.rol
    );
    res.json(sol);
  } catch (e) { next(e); }
};

export const cancelar = async (req, res, next) => {
  try {
    const sol = await svc.cancelar(req.params.id, req.usuario.id, req.usuario.rol);
    res.json(sol);
  } catch (e) { next(e); }
};

export const aprobar = async (req, res, next) => {
  try {
    const sol = await svc.aprobar(req.params.id, req.usuario.id, req.usuario.rol);
    res.json(sol);
  } catch (e) { next(e); }
};

export const rechazar = async (req, res, next) => {
  try {
    const sol = await svc.rechazar(req.params.id, req.usuario.id);
    res.json(sol);
  } catch (e) { next(e); }
};

export const devolver = async (req, res, next) => {
  try {
    const sol = await svc.devolver(req.params.id, req.usuario.id);
    res.json(sol);
  } catch (e) { next(e); }
};

export const resumen = async (req, res, next) => {
  try { res.json(await svc.resumen()); }
  catch (e) { next(e); }
};