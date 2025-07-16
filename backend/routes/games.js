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
          'INSERT INTO game_players (game_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, playerId]
        );
      }

      reply.code(200).send({ ...result.rows[0], status: 'upserted' });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });

  // Spieler einem Spiel hinzufügen
  fastify.post('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    const { players } = req.body;

    if (!isValidId(gameId) || !Array.isArray(players) || players.length === 0)
      return reply.code(400).send({ error: 'Valid game ID and player list required' });

    const client = await getClient();
    try {
      for (const playerId of players) {
        if (!isValidId(playerId)) continue;
        await client.query(
          'INSERT INTO game_players (game_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [gameId, playerId]
        );
      }
      reply.send({ success: true });
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
      let where = '';
      let valuesGames = [perPage, offset];
      let valuesCount = [];

      if (search) {
        where = `WHERE g.name ILIKE $3 OR EXISTS (
          SELECT 1 FROM game_players gp
          JOIN players p ON gp.player_id = p.id
          WHERE gp.game_id = g.id AND p.name ILIKE $3
        )`;
        valuesGames = [perPage, offset, `%${search}%`];
        valuesCount = [`%${search}%`];
      }

      const gamesResult = await client.query(
        `SELECT g.* FROM games g
         ${where}
         ORDER BY g.created_at DESC
         LIMIT $1 OFFSET $2`,
        valuesGames
      );

      const countResult = await client.query(
        `SELECT COUNT(*) FROM games g
         ${where}`,
        valuesCount
      );

      reply.send({ games: gamesResult.rows, total: parseInt(countResult.rows[0].count) });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
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
}