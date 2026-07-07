import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DB_STORAGE, NODE_ENV } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// En tests usamos memoria para no contaminar la DB de desarrollo
const storage = NODE_ENV === 'test'
  ? ':memory:'
  : join(__dirname, '../../', DB_STORAGE);

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});
