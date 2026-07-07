import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { JWT_SECRET } from '../config/env.js';

export async function registrar({ nombre, email, password, rol = 'usuario' }) {
  const existe = await Usuario.findOne({ where: { email } });

  if (existe) {
    const err = new Error('No se pudo registrar el usuario');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, email, passwordHash, rol });

  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

export async function login({ email, password }) {
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario || !usuario.activo) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, usuario.passwordHash);

  if (!ok) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  return {
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  };
}