# Gestión de Equipos

Aplicación web para la gestión de préstamos de equipos dentro de una organización. Permite administrar un inventario de equipos, solicitar su préstamo y gestionar la aprobación, rechazo o devolución de esas solicitudes según el rol de cada usuario.

Desarrollado como trabajo práctico de la materia Desarrollo de Software.

## Funcionalidades

- **Autenticación de usuarios** con registro, login y sesión basada en JWT.
- **Roles de usuario**: `usuario`, `encargado` y `admin`, cada uno con distintos permisos.
- **Gestión de inventario**: alta de equipos con código de inventario, categoría, ubicación y estado (`disponible`, `prestado`, `mantenimiento`, `baja`).
- **Solicitudes de préstamo**: los usuarios pueden solicitar un equipo indicando fecha de retiro, fecha de devolución y motivo.
- **Aprobación / rechazo**: los administradores y encargados pueden aprobar, rechazar o marcar como devuelta cada solicitud.
- **Validación de disponibilidad**: el sistema evita superposiciones, filtrando los equipos que ya tienen una solicitud pendiente o aprobada en el rango de fechas elegido.
- **Historial de solicitudes** por equipo.
- **Panel de resumen** para administradores con el estado general de las solicitudes.

## Tecnologías utilizadas

**Backend**
- Node.js + Express
- Sequelize (ORM) sobre SQLite
- JSON Web Tokens (JWT) para autenticación
- bcryptjs para hash de contraseñas
- Jest + Supertest para testing

**Frontend**
- React
- Vite
- React Router
- Axios
- React Icons

## Estructura del proyecto

```
parcial_2_grupo15/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración de entorno y base de datos
│   │   ├── controllers/   # Lógica de las rutas (auth, solicitudes)
│   │   ├── middlewares/    # Autenticación, roles y manejo de errores
│   │   ├── models/         # Modelos Sequelize (Usuario, Equipo, Solicitud, HistorialSolicitud)
│   │   ├── repositories/   # Acceso a datos
│   │   ├── routes/         # Definición de endpoints
│   │   └── db/             # Scripts de seed y reset de la base de datos
│   └── tests/
└── frontend/
    └── src/
        ├── components/     # Componentes reutilizables (Navbar, EstadoBadge, ProtectedRoute)
        ├── context/        # Contexto de autenticación
        ├── layouts/         # Layout principal de la aplicación
        ├── pages/           # Login, Registro, Resumen, Solicitudes, etc.
        └── services/        # Llamadas a la API (auth, equipos, solicitudes)
```

## Instalación y uso

### Requisitos previos
- Node.js (v18 o superior recomendado)
- npm

### Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` en `backend/` con las siguientes variables:

```
PORT=3001
JWT_SECRET=tu_secreto
NODE_ENV=development
DB_STORAGE=db.sqlite
```

Inicializar la base de datos con datos de ejemplo:

```bash
npm run seed
```

Levantar el servidor:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

## Endpoints principales de la API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/equipos` | Listado de equipos (con filtros por categoría, estado y fechas) |
| GET | `/api/solicitudes` | Listado de solicitudes |
| GET | `/api/solicitudes/resumen` | Resumen general (solo admin) |
| GET | `/api/solicitudes/:id` | Detalle de una solicitud |
| GET | `/api/solicitudes/:id/historial` | Historial de una solicitud |
| POST | `/api/solicitudes` | Crear una solicitud |
| PUT | `/api/solicitudes/:id` | Editar una solicitud |
| PATCH | `/api/solicitudes/:id/cancelar` | Cancelar una solicitud |
| PATCH | `/api/solicitudes/:id/aprobar` | Aprobar una solicitud (admin/encargado) |
| PATCH | `/api/solicitudes/:id/rechazar` | Rechazar una solicitud (admin/encargado) |
| PATCH | `/api/solicitudes/:id/devolver` | Marcar una solicitud como devuelta (admin/encargado) |

## Testing

```bash
cd backend
npm test
```

## Autores

Trabajo práctico grupal – Grupo 15.
