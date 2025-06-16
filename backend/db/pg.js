import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // wichtig für Supabase
  }
});

// Funktion zum Abrufen eines DB-Clients
export const getClient = () => pool.connect();