import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

// Lazy initialization - create pool only when first needed
function getPool() {
  if (!pool) {
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      // Release idle clients after 30s to avoid leaking long-lived connections
      idleTimeoutMillis: 30_000,
      // Fail fast if a new connection can't be acquired in 5s
      connectionTimeoutMillis: 5_000,
      // Per-statement timeout — protects against runaway queries
      statement_timeout: 30_000,
      // Cap pool size to prevent saturating the database
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    };

    // Only enable SSL for production external databases (e.g., managed services)
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL === 'true') {
      poolConfig.ssl = {
        rejectUnauthorized: false
      };
    }

    pool = new Pool(poolConfig);

    // Log idle client errors instead of crashing the process
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });
  }
  return pool;
}

// Graceful shutdown
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    console.log(`Received ${signal}, closing database pool...`);
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  });
}

// Funktion zum Abrufen eines DB-Clients
export const getClient = () => getPool().connect();
