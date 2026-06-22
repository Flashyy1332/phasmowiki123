import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

// Для підключення до Supabase потрібен повний URL або деталі підключення.
// Краще використовувати Connection String (URI) з пулером (порт 6543) на Vercel
export const pool = new Pool({
  host: process.env.DB_HOST || 'db.mnsqbsxazooykgzmjzug.supabase.co',
  port: process.env.DB_PORT === '5432' ? 6543 : parseInt(process.env.DB_PORT || '6543'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Database192837!(@*#&',
  // Supabase вимагає SSL для зовнішніх підключень
  ssl: {
    rejectUnauthorized: false
  }
});
