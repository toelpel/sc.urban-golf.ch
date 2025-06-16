import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // wichtig für Supabase
  },
  host: process.env.DATABASE_HOST || 'db.supabase.co',
  family: 4 // ⬅️ Erzwingt IPv4
});

// Funktion zum Abrufen eines DB-Clients
export const getClient = () => pool.connect();