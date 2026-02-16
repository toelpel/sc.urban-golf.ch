import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

// Lazy initialization - create pool only when first needed
function getPool() {
  if (!pool) {
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
    };

    // Only enable SSL for production external databases (e.g., managed services)
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL === 'true') {
      poolConfig.ssl = {
        rejectUnauthorized: false
      };
    }

    pool = new Pool(poolConfig);
  }
  return pool;
}

// Funktion zum Abrufen eines DB-Clients
export const getClient = () => getPool().connect();