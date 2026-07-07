import 'dotenv/config';
import { sequelize } from './database.js';

async function reset() {
  console.log('⚠️  Borrando TODA la base de datos...');
  await sequelize.sync({ force: true });
  console.log('✅ Base de datos limpia. Ahora corré: npm run seed');
  process.exit(0);
}

reset().catch((e) => { console.error(e); process.exit(1); });
