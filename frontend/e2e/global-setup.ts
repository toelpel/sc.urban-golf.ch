import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://postgres:change-me-in-production@localhost:5432/urban_golf'

async function globalSetup() {
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    // Clean all test data (order matters due to FK constraints)
    await client.query('DELETE FROM scores')
    await client.query('DELETE FROM game_players')
    await client.query('DELETE FROM games')
    await client.query('DELETE FROM players')
    await client.query('DELETE FROM feedback')

    // Seed baseline data
    await client.query(`
      INSERT INTO players (id, name) VALUES
        ('e2e_player_alice1', 'Alice'),
        ('e2e_player_bob001', 'Bob'),
        ('e2e_player_carol1', 'Carol')
      ON CONFLICT (id) DO NOTHING
    `)

    await client.query(`
      INSERT INTO games (id, name, created_at) VALUES
        ('e2e_game_existing1', 'Seeded Game Alpha', NOW() - INTERVAL '2 hours'),
        ('e2e_game_existing2', 'Seeded Game Beta',  NOW() - INTERVAL '1 hour'),
        ('e2e_game_existing3', 'Seeded Game Gamma', NOW() - INTERVAL '30 minutes')
      ON CONFLICT (id) DO NOTHING
    `)

    await client.query(`
      INSERT INTO game_players (game_id, player_id) VALUES
        ('e2e_game_existing1', 'e2e_player_alice1'),
        ('e2e_game_existing1', 'e2e_player_bob001'),
        ('e2e_game_existing2', 'e2e_player_carol1'),
        ('e2e_game_existing2', 'e2e_player_alice1'),
        ('e2e_game_existing3', 'e2e_player_bob001')
      ON CONFLICT DO NOTHING
    `)

    await client.query(`
      INSERT INTO scores (game_id, player_id, hole, strokes) VALUES
        ('e2e_game_existing1', 'e2e_player_alice1', 1, 3),
        ('e2e_game_existing1', 'e2e_player_alice1', 2, 4),
        ('e2e_game_existing1', 'e2e_player_bob001', 1, 5),
        ('e2e_game_existing1', 'e2e_player_bob001', 2, 2)
      ON CONFLICT (game_id, player_id, hole) DO NOTHING
    `)

    console.log('[global-setup] Database seeded successfully')
  } finally {
    await client.end()
  }
}

export default globalSetup
