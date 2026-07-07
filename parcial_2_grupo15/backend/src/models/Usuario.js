import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER,
     primaryKey: true,
     autoIncrement: true },

  nombre: { type: DataTypes.STRING,
      allowNull: false },

  email: { type: DataTypes.STRING,
      allowNull: false,
      unique: true },

  passwordHash: { type: DataTypes.STRING,
      allowNull: false },

  rol: { type: DataTypes.ENUM('usuario', 'encargado', 'admin'),
     defaultValue: 'usuario' },

  activo: { type: DataTypes.BOOLEAN,
     defaultValue: true },
});
