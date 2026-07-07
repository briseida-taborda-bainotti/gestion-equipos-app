import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize, Usuario, Equipo, Solicitud, HistorialSolicitud } from '../models/index.js';

async function seed() {
  await sequelize.sync();
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const usuariosSemilla = [
    { nombre: 'Admin Sistema',  email: 'admin@dds.com',     passwordHash: hash('admin123'),  rol: 'admin' },
    { nombre: 'Encargado Lab',  email: 'encargado@dds.com', passwordHash: hash('encarg123'), rol: 'encargado' },
    { nombre: 'Ana López',      email: 'ana@dds.com',       passwordHash: hash('user123'),   rol: 'usuario' },
    { nombre: 'Carlos Vera',    email: 'carlos@dds.com',    passwordHash: hash('user123'),   rol: 'usuario' },
  ];

  for (const u of usuariosSemilla) {
    const [usuario, creado] = await Usuario.findOrCreate({
      where: { email: u.email },
      defaults: u,
    });
    if (creado) console.log(`  ✓ Usuario creado: ${u.email}`);
    else console.log(`  · Usuario ya existe: ${u.email} (no modificado)`);
  }

  const totalEquipos = await Equipo.count();
  if (totalEquipos === 0) {
    const equipos = await Equipo.bulkCreate([
      { codigoInventario: 'INV-001', nombre: 'Notebook Dell 14',        categoria: 'notebook',  estado: 'disponible',    ubicacion: 'Lab A5',    requiereAutorizacion: false },
      { codigoInventario: 'INV-002', nombre: 'Notebook HP Pavilion',    categoria: 'notebook',  estado: 'disponible',    ubicacion: 'Lab A5',    requiereAutorizacion: false },
      { codigoInventario: 'INV-003', nombre: 'Proyector Epson X41',     categoria: 'proyector', estado: 'disponible',    ubicacion: 'Aula 12',   requiereAutorizacion: true  },
      { codigoInventario: 'INV-004', nombre: 'Proyector BenQ MX520',    categoria: 'proyector', estado: 'prestado',      ubicacion: 'Aula 8',    requiereAutorizacion: true  },
      { codigoInventario: 'INV-005', nombre: 'Cámara Canon EOS',        categoria: 'cámara',    estado: 'disponible',    ubicacion: 'Depósito',  requiereAutorizacion: true  },
      { codigoInventario: 'INV-006', nombre: 'Kit de Red Cisco',        categoria: 'kit de red',estado: 'disponible',    ubicacion: 'Lab Redes', requiereAutorizacion: false },
      { codigoInventario: 'INV-007', nombre: 'Tablet Samsung A8',       categoria: 'tablet',    estado: 'mantenimiento', ubicacion: 'Lab A5',    requiereAutorizacion: false },
      { codigoInventario: 'INV-008', nombre: 'Notebook Lenovo ThinkPad',categoria: 'notebook',  estado: 'disponible',    ubicacion: 'Lab B1',    requiereAutorizacion: false },
    ]);

    const ana    = await Usuario.findOne({ where: { email: 'ana@dds.com' } });
    const carlos = await Usuario.findOne({ where: { email: 'carlos@dds.com' } });
    const admin  = await Usuario.findOne({ where: { email: 'admin@dds.com' } });

    const solicitudes = await Solicitud.bulkCreate([
      { equipoId: equipos[0].id, usuarioId: ana.id,    fechaRetiro: '2026-06-15', fechaDevolucion: '2026-06-17', motivo: 'Práctica de laboratorio', estado: 'pendiente' },
      { equipoId: equipos[1].id, usuarioId: ana.id,    fechaRetiro: '2026-06-10', fechaDevolucion: '2026-06-12', motivo: 'Proyecto final',          estado: 'aprobada',  autorizadoPor: admin.id },
      { equipoId: equipos[2].id, usuarioId: carlos.id, fechaRetiro: '2026-06-20', fechaDevolucion: '2026-06-21', motivo: 'Presentación',            estado: 'pendiente' },
      { equipoId: equipos[3].id, usuarioId: carlos.id, fechaRetiro: '2026-06-01', fechaDevolucion: '2026-06-05', motivo: 'Clase magistral',         estado: 'aprobada',  autorizadoPor: admin.id },
      { equipoId: equipos[5].id, usuarioId: ana.id,    fechaRetiro: '2026-05-20', fechaDevolucion: '2026-05-22', motivo: 'Config red local',        estado: 'devuelta' },
    ]);

    for (const sol of solicitudes) {
      await HistorialSolicitud.create({
        solicitudId: sol.id,
        usuarioId:   sol.usuarioId,
        accion:      'creacion',
        valorAnterior: null,
        valorNuevo:  JSON.stringify({ estado: 'pendiente' }),
        fechaHora:   new Date(),
      });

      if (sol.estado === 'aprobada') {
        await HistorialSolicitud.create({
          solicitudId: sol.id,
          usuarioId:   admin.id,
          accion:      'aprobacion',
          valorAnterior: JSON.stringify({ estado: 'pendiente' }),
          valorNuevo:    JSON.stringify({ estado: 'aprobada' }),
          fechaHora:     new Date(),
        });
      }

      if (sol.estado === 'devuelta') {
        await HistorialSolicitud.create({
          solicitudId: sol.id,
          usuarioId:   admin.id,
          accion:      'devolucion',
          valorAnterior: JSON.stringify({ estado: 'aprobada' }),
          valorNuevo:    JSON.stringify({ estado: 'devuelta' }),
          fechaHora:     new Date(),
        });
      }
    }

    console.log('  ✓ Equipos y solicitudes semilla creados con historial');
  } else {
    console.log(`  · Equipos ya existen (${totalEquipos} encontrados) — no se modificaron`);
  }

  console.log('\n✅ Seed completado. Los datos existentes NO fueron borrados.\n');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });