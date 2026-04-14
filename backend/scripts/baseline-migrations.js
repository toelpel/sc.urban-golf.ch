// Idempotente Baseline-Registrierung für Altbestände.
//
// Hintergrund: In älteren Deployments wurde das Schema via
// `backend/db/init/schema.sql` geladen — ohne dass node-pg-migrate die
// Migrations 001/002 in `pgmigrations` vermerkt hat. Ein späteres
// `migrate:up` würde sie dann neu laufen lassen und auf bereits
// existierende Objekte bzw. nicht auflösbare Operator-Klassen stossen.
//
// Dieses Script erkennt genau diesen Fall (Core-Tabellen existieren,
// pgmigrations aber leer / ohne Baseline-Einträge) und stampt 001/002
// nachträglich als applied. Wenn die Tabellen nicht existieren oder
// pgmigrations bereits Einträge hat, tut das Script nichts.
//
// Aufruf: wird automatisch vor `migrate:up` ausgeführt (siehe
// backend/package.json), kann aber auch standalone laufen:
//   node --env-file-if-exists=../.env scripts/baseline-migrations.js

import pg from 'pg'

const { Client } = pg

const CORE_TABLES = ['games', 'players', 'scores', 'game_players']
const BASELINE_MIGRATIONS = ['001_initial-schema', '002_harden-scores-schema']

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[baseline] DATABASE_URL is not set — skipping baseline check')
    process.exit(1)
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  })

  await client.connect()

  try {
    const tables = await client.query(
      `SELECT tablename FROM pg_tables
         WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
      [CORE_TABLES],
    )
    const existingTables = new Set(tables.rows.map((r) => r.tablename))
    const schemaExists = CORE_TABLES.every((t) => existingTables.has(t))

    if (!schemaExists) {
      console.log('[baseline] Core tables missing — fresh DB, nothing to baseline')
      return
    }

    // pgmigrations-Tabelle anlegen, falls sie noch nicht existiert.
    // node-pg-migrate würde das sonst beim ersten Lauf selber tun.
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pgmigrations (
        id serial PRIMARY KEY,
        name varchar(255) NOT NULL,
        run_on timestamp NOT NULL
      )
    `)

    const { rows: appliedRows } = await client.query(
      `SELECT name FROM public.pgmigrations WHERE name = ANY($1::text[])`,
      [BASELINE_MIGRATIONS],
    )
    const alreadyStamped = new Set(appliedRows.map((r) => r.name))
    const toStamp = BASELINE_MIGRATIONS.filter((m) => !alreadyStamped.has(m))

    if (toStamp.length === 0) {
      console.log('[baseline] All baseline migrations already stamped — nothing to do')
      return
    }

    await client.query('BEGIN')
    for (const name of toStamp) {
      await client.query(
        `INSERT INTO public.pgmigrations (name, run_on) VALUES ($1, NOW())`,
        [name],
      )
      console.log(`[baseline] Stamped ${name} as applied`)
    }
    await client.query('COMMIT')
    console.log(`[baseline] Done. Stamped ${toStamp.length} migration(s).`)
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('[baseline] Failed:', err.message)
  process.exit(1)
})
