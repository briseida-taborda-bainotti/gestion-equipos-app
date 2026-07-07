import { Router } from 'express';
import { Op } from 'sequelize';
import { equiposRepository } from '../repositories/equiposRepository.js';
import { Solicitud } from '../models/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {

  try {
    const { categoria, estado, fechaRetiro, fechaDevolucion } = req.query;
    const where = {};
    if (categoria) where.categoria = categoria;
    if (estado && !fechaRetiro && !fechaDevolucion) where.estado = estado;
    
    let equipos = await equiposRepository.findAll({ where });
    
    // Filtrar por disponibilidad en el rango de fechas si se proporcionan
    if (fechaRetiro && fechaDevolucion) {
      const solicitudesConflicto = await Solicitud.findAll({
        where: {
          estado: { [Op.in]: ['pendiente', 'aprobada'] },
          [Op.and]: [
            { fechaRetiro: { [Op.lt]: fechaDevolucion } },
            { fechaDevolucion: { [Op.gt]: fechaRetiro } },
          ]
        },
        attributes: ['equipoId']
      });
      
      const equiposEnConflicto = new Set(solicitudesConflicto.map(s => s.equipoId));
      equipos = equipos.filter(eq => !equiposEnConflicto.has(eq.id));
    }
    
    res.json(equipos);
  } catch (e) { next(e); }
});

export default router;
