import { Pool } from 'pg';

// Пряме підключення до бази даних без використання змінних середовища.
// Жодних конфігураційних файлів чи environment variables.
export const pool = new Pool({
  host: 'db.mnsqbsxazooykgzmjzug.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Database192837!(@*#&',
  ssl: {
    rejectUnauthorized: false
  }
});
