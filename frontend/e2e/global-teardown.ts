import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://postgres:change-me-in-production@localhost:5432/urban_golf'

async function globalTeardown() {
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    await client.query("DELETE FROM scores WHERE game_id LIKE 'e2e_%'")
    await client.query("DELETE FROM game_players WHERE game_id LIKE 'e2e_%'")
    await client.query("DELETE FROM games WHERE id LIKE 'e2e_%'")
    await client.query("DELETE FROM players WHERE id LIKE 'e2e_%'")
    await client.query("DELETE FROM feedback WHERE name LIKE 'E2E %' OR message LIKE 'E2E %'")
    console.log('[global-teardown] Test data cleaned up')
  } finally {
    await client.end()
  }
}

export default globalTeardown
