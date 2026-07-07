import { sequelize } from '../config/database.js';
import { Usuario } from './Usuario.js';
import { Equipo } from './Equipo.js';
import { Solicitud } from './Solicitud.js';
import { HistorialSolicitud } from './HistorialSolicitud.js';

Solicitud.belongsTo(Equipo,   { foreignKey: 'equipoId',    as: 'equipo' });

Solicitud.belongsTo(Usuario,  { foreignKey: 'usuarioId',   as: 'solicitante' });

Solicitud.belongsTo(Usuario,  { foreignKey: 'autorizadoPor', as: 'autorizador' });

HistorialSolicitud.belongsTo(Solicitud, { foreignKey: 'solicitudId' });

HistorialSolicitud.belongsTo(Usuario,   { foreignKey: 'usuarioId', as: 'actor' });

export { sequelize, Usuario, Equipo, Solicitud, HistorialSolicitud };
