import request from 'supertest';
import app from '../src/app.js';
import { sequelize, Usuario, Equipo, Solicitud } from '../src/models/index.js';
import bcrypt from 'bcryptjs';
let tokenAdmin, tokenUser, equipoId, solicitudId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const hash = (p) => bcrypt.hashSync(p, 10);
  await Usuario.create({ nombre: 'Admin', email: 'admin@t.com', passwordHash: hash('admin123'), rol: 'admin' });
  await Usuario.create({ nombre: 'User',  email: 'user@t.com',  passwordHash: hash('user123'),  rol: 'usuario' });
  const eq = await Equipo.create({
    codigoInventario: 'T-001', nombre: 'PC Test', categoria: 'notebook',
    estado: 'disponible', ubicacion: 'Lab', requiereAutorizacion: false,
  });
  equipoId = eq.id;
  const resA = await request(app).post('/api/auth/login').send({ email: 'admin@t.com', password: 'admin123' });
  tokenAdmin = resA.body.token;
  const resU = await request(app).post('/api/auth/login').send({ email: 'user@t.com', password: 'user123' });
  tokenUser = resU.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

// 1. Login correcto e inválido
describe('Auth', () => {
  test('login correcto devuelve token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@t.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
  test('login inválido devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@t.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// 2. Listado
describe('GET /api/solicitudes', () => {
  test('devuelve lista con token', async () => {
    const res = await request(app).get('/api/solicitudes').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('solicitudes');
  });
  test('sin token devuelve 401', async () => {
    const res = await request(app).get('/api/solicitudes');
    expect(res.status).toBe(401);
  });
});

// 3. Detalle existente e inexistente
describe('GET /api/solicitudes/:id', () => {
  test('solicitud inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/solicitudes/9999').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(404);
  });
});

// 4-6. Creación
describe('POST /api/solicitudes', () => {
  test('creación válida devuelve 201', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ equipoId, fechaRetiro: '2026-07-01', fechaDevolucion: '2026-07-05', motivo: 'Test' });
    expect(res.status).toBe(201);
    solicitudId = res.body.id;
  });
  test('fechas inconsistentes devuelve 400', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ equipoId, fechaRetiro: '2026-07-10', fechaDevolucion: '2026-07-05', motivo: 'Test malo' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/anterior/i);
  });
  test('equipo no disponible devuelve 400', async () => {
    const eqOcupado = await Equipo.create({
      codigoInventario: 'T-002', nombre: 'PC Ocupada', categoria: 'notebook',
      estado: 'mantenimiento', ubicacion: 'Lab', requiereAutorizacion: false,
    });
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ equipoId: eqOcupado.id, fechaRetiro: '2026-07-01', fechaDevolucion: '2026-07-05', motivo: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/disponible/i);
  });
});

// 7. Sin JWT a ruta protegida
describe('Protección JWT', () => {
  test('POST /api/solicitudes sin token devuelve 401', async () => {
    const res = await request(app).post('/api/solicitudes').send({});
    expect(res.status).toBe(401);
  });
});

// 8. Usuario sin permisos para aprobar
describe('Permisos', () => {
  test('usuario común no puede aprobar (403)', async () => {
    const res = await request(app)
      .patch(`/api/solicitudes/${solicitudId}/aprobar`)
      .set('Authorization', `Bearer ${tokenUser}`);
    expect(res.status).toBe(403);
  });
});

// 9. Devolución inválida
describe('Devolución', () => {
  test('devolver solicitud no aprobada devuelve 400', async () => {
    const res1 = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ equipoId, fechaRetiro: '2026-08-01', fechaDevolucion: '2026-08-05', motivo: 'Test dev' });
    const newId = res1.body.id;
    const res2 = await request(app)
      .patch(`/api/solicitudes/${newId}/devolver`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res2.status).toBe(400);
    expect(res2.body.error).toMatch(/aprobada/i);
  });
});

// 10. Transición no permitida
describe('Transiciones de estado', () => {
  test('aprobar solicitud cancelada devuelve 400', async () => {
    await request(app)
      .patch(`/api/solicitudes/${solicitudId}/cancelar`)
      .set('Authorization', `Bearer ${tokenUser}`);
    const res = await request(app)
      .patch(`/api/solicitudes/${solicitudId}/aprobar`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(400);
  });
});