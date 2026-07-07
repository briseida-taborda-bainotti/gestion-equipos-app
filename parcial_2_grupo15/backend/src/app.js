import express from 'express';
import cors from 'cors';
import { PORT, NODE_ENV } from './config/env.js';
import { sequelize } from './config/database.js';
import './models/index.js';
import authRoutes from './routes/auth.routes.js';
import equiposRoutes from './routes/equipos.routes.js';
import solicitudesRoutes from './routes/solicitudes.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Middleware de errores — SIEMPRE al final
app.use(errorMiddleware);

async function startServer() {
  await sequelize.sync();
  app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
}
if (NODE_ENV !== 'test') {
  startServer();
}
export default app;