import 'dotenv/config';

export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DB_STORAGE = process.env.DB_STORAGE || 'db.sqlite';
