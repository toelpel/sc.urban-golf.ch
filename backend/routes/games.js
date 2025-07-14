import { getClient } from '../db/pg.js';

/**
 * Regex zur ID-Validierung: nanoid (21 Zeichen, alphanumerisch, - und _)
 */
const isValidId = (id) => /^[a-zA-Z0-9_-]{10,30}$/.test(id);

export default async function (fastify, opts) {
  // Neues Spiel erstellen
  fastify.post('/', async (req, reply) => {
    const { id, name, players } = req.body;

    if (!name || !Array.isArray(players) || players.length === 0) {
      return reply.code(400).send({ error: 'Name and players required' });
    }

    const gameId = id;
    if (!isValidId(gameId)) {
      return reply.code(400).send({ error: 'Invalid or missing game ID' });
    }

    const client = await getClient();
    try {
      await client.query(
        `INSERT INTO games (id, name)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [gameId, name]
      );
      for (const playerId of players) {
        if (!isValidId(playerId)) continue;
        await client.query(
          'INSERT INTO game_players (game_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [gameId, playerId]
        );
      }

      reply.code(200).send({ id: gameId, name });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });

  // Spieler einem Spiel hinzufügen
  fastify.post('/', async (req, reply) => {
    const { id, name, players } = req.body;

    if (!name || !Array.isArray(players) || players.length === 0) {
      return reply.code(400).send({ error: 'Name and players required' });
    }

    const gameId = id;
    if (!isValidId(gameId)) {
      return reply.code(400).send({ error: 'Invalid or missing game ID' });
    }

    const client = await getClient();
    try {
      await client.query(
        `INSERT INTO games (id, name)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [gameId, name]
      );

      for (const playerId of players) {
        if (!isValidId(playerId)) continue;
        await client.query(
          'INSERT INTO game_players (game_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [gameId, playerId]
        );
      }

      reply.code(200).send({ id: gameId, name, status: 'upserted' });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });

  // Spieler eines Spiels abrufen
  fastify.get('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    if (!isValidId(gameId)) {
      return reply.code(400).send({ error: 'Invalid game ID' });
    }

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