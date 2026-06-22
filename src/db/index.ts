import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

// Для підключення до Supabase на Vercel (який не підтримує IPv6),
// потрібно використовувати IPv4 Connection Pooler (зазвичай з портом 6543).
// Найзручніше додати змінну DATABASE_URL у налаштуваннях Vercel.
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(connectionString ? {
  connectionString,
  ssl: { rejectUnauthorized: false }
} : {
  host: process.env.DB_HOST || 'db.mnsqbsxazooykgzmjzug.supabase.co',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Database192837!(@*#&',
  // Supabase вимагає SSL для зовнішніх підключень
  ssl: {
    rejectUnauthorized: false
  }
});
