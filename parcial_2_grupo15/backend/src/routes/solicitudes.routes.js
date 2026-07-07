import { Router } from 'express';
import * as ctrl from '../controllers/solicitudes.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { soloAdmin } from '../middlewares/roles.middleware.js';

const router = Router();

// Rutas protegidas para todos los autenticados
router.get('/', authMiddleware, ctrl.listar);
router.get('/resumen', authMiddleware, soloAdmin, ctrl.resumen);
router.get('/:id', authMiddleware, ctrl.detalle);
router.get('/:id/historial', authMiddleware, ctrl.historial);
router.post('/', authMiddleware, ctrl.crear);
router.put('/:id', authMiddleware, ctrl.editar);
router.patch('/:id/cancelar', authMiddleware, ctrl.cancelar);

// Solo admin/encargado
router.patch('/:id/aprobar', authMiddleware, soloAdmin, ctrl.aprobar);
router.patch('/:id/rechazar', authMiddleware, soloAdmin, ctrl.rechazar);
router.patch('/:id/devolver', authMiddleware, soloAdmin, ctrl.devolver);

export default router;