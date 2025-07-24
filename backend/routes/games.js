import { getClient } from '../db/pg.js';

const isValidId = (id) => /^[a-zA-Z0-9_-]{10,30}$/.test(id);

export default async function (fastify, opts) {
  // Spiel erstellen oder aktualisieren
  fastify.post('/', async (req, reply) => {
    const { id, name, players } = req.body;

    if (!name || !Array.isArray(players) || players.length === 0)
      return reply.code(400).send({ error: 'Name and players required' });

    if (!isValidId(id))
      return reply.code(400).send({ error: 'Invalid or missing game ID' });

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO games (id, name)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [id, name]
      );

      for (const playerId of players) {
        if (!isValidId(playerId)) continue;
        await client.query(
          `INSERT INTO game_players (game_id, player_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, playerId]
        );
      }

      await client.query('COMMIT');
      reply.send({ ...result.rows[0], status: 'upserted' });
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error({ id, players, error: err.message }, 'Failed to upsert game with players');
      reply.code(500).send({ error: 'Database error', details: err.message });
    } finally {
      client.release();
    }
  });

  // Spiele abrufen mit optionaler Suche und Pagination
  fastify.get('/', async (req, reply) => {
    const client = await getClient();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(10, parseInt(req.query.per_page) || 4);
    const offset = (page - 1) * perPage;
    const search = req.query.search;

    try {
      let gamesQuery = '';
      let valuesGames = [];
      let countQuery = '';
      let valuesCount = [];

      if (search) {
        gamesQuery = `
          SELECT g.* FROM games g
          WHERE g.name ILIKE $1 OR EXISTS (
            SELECT 1 FROM game_players gp
            JOIN players p ON gp.player_id = p.id
            WHERE gp.game_id = g.id AND p.name ILIKE $1
          )
          ORDER BY g.created_at DESC
          LIMIT $2 OFFSET $3`;

        valuesGames = [`%${search}%`, perPage, offset];

        countQuery = `
          SELECT COUNT(*) FROM games g
          WHERE g.name ILIKE $1 OR EXISTS (
            SELECT 1 FROM game_players gp
            JOIN players p ON gp.player_id = p.id
            WHERE gp.game_id = g.id AND p.name ILIKE $1
          )`;
        valuesCount = [`%${search}%`];
      } else {
        gamesQuery = `
          SELECT g.* FROM games g
          ORDER BY g.created_at DESC
          LIMIT $1 OFFSET $2`;

        valuesGames = [perPage, offset];
        countQuery = `SELECT COUNT(*) FROM games g`;
      }

      const [gamesResult, countResult] = await Promise.all([
        client.query(gamesQuery, valuesGames),
        client.query(countQuery, valuesCount)
      ]);

      reply.send({
        games: gamesResult.rows,
        total: parseInt(countResult.rows[0].count)
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error', details: err.message });
    } finally {
      client.release();
    }
  });

  // Spielname via ID abrufen
  fastify.get('/:id', async (req, reply) => {
    const gameId = req.params.id;
    if (!isValidId(gameId)) return reply.code(400).send({ error: 'Invalid game ID' });

    const client = await getClient();
    try {
      const result = await client.query(`SELECT id, name FROM games WHERE id = $1`, [gameId]);
      if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
      reply.send(result.rows[0]);
    } finally {
      client.release();
    }
  });

  // Spieler eines Spiels abrufen
  fastify.get('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    if (!isValidId(gameId)) return reply.code(400).send({ error: 'Invalid game ID' });

    const client = await getClient();
    try {
      const result = await client.query(
        `SELECT p.id, p.name
         FROM players p
         JOIN game_players gp ON gp.player_id = p.id
         WHERE gp.game_id = $1`,
        [gameId]
      );
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  // Zusammenfassung
  fastify.get('/summary', async (req, reply) => {
    const client = await getClient();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(10, parseInt(req.query.per_page) || 10);
    const offset = (page - 1) * perPage;
    const search = req.query.search;
    const values = search ? [`%${search}%`, perPage, offset] : [perPage, offset];

    try {
      const gamesQuery = `
        WITH filtered_games AS (
          SELECT g.*
          FROM games g
          ${search ? `
            WHERE g.name ILIKE $1
              OR EXISTS (
                SELECT 1 FROM game_players gp
                JOIN players p ON gp.player_id = p.id
                WHERE gp.game_id = g.id AND p.name ILIKE $1
              )` : ''}
          ORDER BY g.created_at DESC
          LIMIT $${search ? 2 : 1} OFFSET $${search ? 3 : 2}
        )
        SELECT
          g.*,
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'avg', ROUND(AVG(s.strokes), 2),
                'total', SUM(s.strokes)
              )
            )
            FROM game_players gp
            JOIN players p ON gp.player_id = p.id
            LEFT JOIN scores s ON s.player_id = p.id AND s.game_id = g.id
            WHERE gp.game_id = g.id
          ) AS players,
          (
            SELECT COUNT(DISTINCT s.hole)
            FROM scores s
            WHERE s.game_id = g.id
          ) AS holes_played
        FROM filtered_games g
      `;

      const { rows } = await client.query(gamesQuery, values);
      reply.send({ games: rows });
    } finally {
      client.release();
    }
  });
}