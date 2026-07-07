import { Op, fn, col } from 'sequelize';
import { Solicitud, Equipo, Usuario, HistorialSolicitud } from '../models/index.js';
import { solicitudesRepository } from '../repositories/solicitudesRepository.js';

// Helper: guarda historial 
async function registrarHistorial(solicitudId, usuarioId, accion, anterior, nuevo) {
  await HistorialSolicitud.create({
    solicitudId,
    usuarioId,
    accion,
    valorAnterior: anterior ? JSON.stringify(anterior) : null,
    valorNuevo: nuevo ? JSON.stringify(nuevo) : null,
  });
}

// Helper: hay superposición de fechas 
async function haySuperposicion(equipoId, fechaRetiro, fechaDevolucion, excluirId = null) {

  const where = {
    equipoId,
    estado: 'aprobada',
    [Op.and]: [
      { fechaRetiro: { [Op.lt]: fechaDevolucion } },
      { fechaDevolucion: { [Op.gt]: fechaRetiro } },
    ],
  };

  if (excluirId) where.id = { [Op.ne]: excluirId };
  const count = await Solicitud.count({ where });
  return count > 0;
}

async function buscarInstancia(id) {
  const sol = await solicitudesRepository.findConDetalle(id);
  if (!sol) {
    const e = new Error('Solicitud no encontrada');
    e.status = 404;
    throw e;
  }
  return sol;
}

function agregarVencida(sol) {
  const hoy = new Date().toISOString().split('T')[0];
  return {
    ...sol.toJSON(),
    vencida: sol.estado === 'aprobada' && sol.fechaDevolucion < hoy,
  };
}

// Listar con filtros y paginación
export async function listar({
  estado, equipoId, categoria, desde, hasta,
  page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC',
  usuarioRol, usuarioId,
}) {
  const where = {};

  if (estado) where.estado = estado;
  if (equipoId) where.equipoId = equipoId;
  if (desde || hasta) {
    where.fechaRetiro = {};
    if (desde) where.fechaRetiro[Op.gte] = desde;
    if (hasta) where.fechaRetiro[Op.lte] = hasta;
  }

  if (usuarioRol === 'usuario') where.usuarioId = usuarioId;
  const includeEquipo = {
    model: Equipo,
    as: 'equipo',
    where: categoria ? { categoria } : undefined,
  };

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await solicitudesRepository.findAndCountAll({
    where,
    include: [
      includeEquipo,
      { model: Usuario, as: 'solicitante', attributes: ['nombre', 'email'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [[sortBy, order.toUpperCase()]],
  });
  return {
    total: count,
    pagina: parseInt(page),
    limite: parseInt(limit),
    solicitudes: rows.map(agregarVencida),
  };
}

// Detalle
export async function obtener(id) {
  const sol = await buscarInstancia(id);
  return agregarVencida(sol);
}

// Historial
export async function obtenerHistorial(solicitudId) {
  return HistorialSolicitud.findAll({
    where: { solicitudId },
    include: [{ model: Usuario, as: 'actor', attributes: ['nombre', 'email'] }],
    order: [['fechaHora', 'ASC']],
  });
}

// Crear 
export async function crear({ equipoId, fechaRetiro, fechaDevolucion, motivo }, usuarioId) {
  if (fechaRetiro >= fechaDevolucion) {
    const e = new Error('La fecha de retiro debe ser anterior a la de devolución');
    e.status = 400; throw e;
  }
  const equipo = await Equipo.findByPk(equipoId);

  if (!equipo) { const e = new Error('Equipo no encontrado'); e.status = 404; throw e; }

  if (equipo.estado === 'mantenimiento') {
    const e = new Error('El equipo no está disponible');
    e.status = 400; throw e;
  }

  if (await solicitudesRepository.haySuperposicion(equipoId, fechaRetiro, fechaDevolucion)) {
    const e = new Error('El equipo ya tiene un préstamo aprobado en ese período'); e.status = 400; throw e;
  }

  if (await solicitudesRepository.haySuperposicion(equipoId, fechaRetiro, fechaDevolucion, null, ['pendiente'])) {
    const e = new Error('Ya existe una solicitud pendiente para ese equipo en ese período'); e.status = 400; throw e;
  }

  const sol = await Solicitud.create({ equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo });
  await registrarHistorial(sol.id, usuarioId, 'creacion', null, { estado: 'pendiente' });
  return sol;
}

// Editar
export async function editar(id, { fechaRetiro, fechaDevolucion, motivo }, usuarioId, usuarioRol) {

  const sol = await buscarInstancia(id);
  if (sol.estado !== 'pendiente') {
    const e = new Error('Solo se puede editar una solicitud pendiente'); e.status = 400; throw e;
  }

  if (usuarioRol === 'usuario' && sol.usuarioId !== usuarioId) {
    const e = new Error('Solo podés editar tus propias solicitudes'); e.status = 403; throw e;
  }

  const anterior = { fechaRetiro: sol.fechaRetiro, fechaDevolucion: sol.fechaDevolucion, motivo: sol.motivo };
  if (fechaRetiro && fechaDevolucion && fechaRetiro >= fechaDevolucion) {
    const e = new Error('La fecha de retiro debe ser anterior a la de devolución'); e.status = 400; throw e;
  }

  await sol.update({ fechaRetiro, fechaDevolucion, motivo });
  await registrarHistorial(id, usuarioId, 'edicion', anterior, { fechaRetiro, fechaDevolucion, motivo });
  return sol;
}

// Cancelar 
export async function cancelar(id, usuarioId, rol) {
  const sol = await buscarInstancia(id);
  if (rol === 'usuario' && sol.usuarioId !== usuarioId) {
    const e = new Error('Solo podés cancelar tus propias solicitudes'); e.status = 403; throw e;
  }

  if (sol.estado === 'devuelta' || sol.estado === 'rechazada') {
    const e = new Error(`No se puede cancelar una solicitud en estado ${sol.estado}`); e.status = 400; throw e;
  }

  const anterior = { estado: sol.estado };
  await sol.update({ estado: 'cancelada' });
  await registrarHistorial(id, usuarioId, 'cancelacion', anterior, { estado: 'cancelada' });
  return sol;
}

// Aprobar
export async function aprobar(id, usuarioAprobador, rol) {
  const sol = await buscarInstancia(id);
  if (sol.estado !== 'pendiente') {
    const e = new Error('Solo se pueden aprobar solicitudes pendientes'); e.status = 400; throw e;
  }

  const equipo = sol.equipo;
  if (equipo.requiereAutorizacion && !['admin', 'encargado'].includes(rol)) {
    const e = new Error('Este equipo requiere autorización de admin o encargado'); e.status = 403; throw e;
  }

  if (equipo.estado === 'mantenimiento') {
    const e = new Error('El equipo no está disponible');
    e.status = 400; throw e;
  }

  if (await solicitudesRepository.haySuperposicion(equipo.id, sol.fechaRetiro, sol.fechaDevolucion, id)) {
    const e = new Error('Superposición de fechas con otro préstamo aprobado'); e.status = 400; throw e;
  }

  await sol.update({ estado: 'aprobada', autorizadoPor: usuarioAprobador });
  await registrarHistorial(id, usuarioAprobador, 'aprobacion', { estado: 'pendiente' }, { estado: 'aprobada' });
  return sol;
}

// Rechazar
export async function rechazar(id, usuarioId) {
  const sol = await buscarInstancia(id);
  if (sol.estado !== 'pendiente') {
    const e = new Error('Solo se pueden rechazar solicitudes pendientes'); e.status = 400; throw e;
  }
  await sol.update({ estado: 'rechazada' });
  await registrarHistorial(id, usuarioId, 'rechazo', { estado: 'pendiente' }, { estado: 'rechazada' });
  return sol;
}

// Devolver 
export async function devolver(id, usuarioId) {
  const sol = await buscarInstancia(id);
  if (sol.estado !== 'aprobada') {
    const e = new Error('Solo se pueden devolver solicitudes aprobadas'); e.status = 400; throw e;
  }
  await sol.update({ estado: 'devuelta' });
  await sol.equipo.update({ estado: 'disponible' });
  await registrarHistorial(id, usuarioId, 'devolucion', { estado: 'aprobada' }, { estado: 'devuelta' });
  return sol;
}

// Resumen
export async function resumen() {

  const hoy = new Date().toISOString().split('T')[0];
  const equiposPorCategoria = await Equipo.findAll({
    where: { estado: 'disponible' },
    attributes: ['categoria', [fn('COUNT', col('id')), 'total']],
    group: ['categoria'],
  });

  const pendientes = await Solicitud.count({ where: { estado: 'pendiente' } });
  const vencidas = await Solicitud.count({
    where: { estado: 'aprobada', fechaDevolucion: { [Op.lt]: hoy } },
  });
  
  const prestados = await Equipo.count({ where: { estado: 'prestado' } });
  return { equiposPorCategoria, pendientes, vencidas, prestados };
}