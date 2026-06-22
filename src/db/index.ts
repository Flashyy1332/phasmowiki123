import { Pool } from 'pg';

// Пряме підключення до бази даних без використання змінних середовища.
// Жодних конфігураційних файлів чи environment variables.
export const pool = new Pool({
  host: 'db.mnsqbsxazooykgzmjzug.supabase.co',
  port: 6543, // Змінено на 6543 для підтримки IPv4 на Vercel
  database: 'postgres',
  user: 'postgres',
  password: 'Database192837!(@*#&',
  ssl: {
    rejectUnauthorized: false
  }
});
