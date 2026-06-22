import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

// Для підключення до Supabase потрібен повний URL або деталі підключення.
// Краще використовувати Connection String (URI).
export const pool = new Pool({
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
