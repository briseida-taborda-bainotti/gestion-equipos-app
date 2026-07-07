import { Op } from 'sequelize';
import { BaseRepository } from './baseRepository.js';
import { Solicitud, Equipo, Usuario } from '../models/index.js';

class SolicitudesRepository extends BaseRepository {
  constructor() {
    super(Solicitud);
  }

  findConDetalle(id) {
    return this.model.findByPk(id, {
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Usuario, as: 'solicitante', attributes: ['nombre', 'email'] },
        { model: Usuario, as: 'autorizador', attributes: ['nombre', 'email'] },
      ],
    });
  }

  async haySuperposicion(equipoId, fechaRetiro, fechaDevolucion, excluirId = null, estados = ['aprobada']) {
    const where = {
      equipoId,
      estado: { [Op.in]: estados },
      [Op.and]: [
        { fechaRetiro:    { [Op.lt]: fechaDevolucion } },
        { fechaDevolucion: { [Op.gt]: fechaRetiro } },
      ],
    };
    
    if (excluirId) where.id = { [Op.ne]: excluirId };
    return (await this.model.count({ where })) > 0;
  }
}

export const solicitudesRepository = new SolicitudesRepository();
