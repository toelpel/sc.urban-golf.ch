import { getClient } from '../db/pg.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name, players } = req.body;
    if (!name || !Array.isArray(players)) {
      return reply.code(400).send({ error: 'Game name and player list required' });
    }

    const client = await getClient();
    try {
      const result = await client.query('INSERT INTO games (name) VALUES ($1) RETURNING id', [name]);
      const gameId = result.rows[0].id;

      for (const playerId of players) {
        await client.query('INSERT INTO game_players (game_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [gameId, playerId]);
      }

      reply.code(200).send({ id: gameId, name });
    } finally {
      client.release();
    }
  });

  fastify.post('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    const { players } = req.body;

    if (!Array.isArray(players) || players.length === 0) {
      return reply.code(400).send({ error: 'Player list required' });
    }

    const client = await getClient();
    try {
      for (const playerId of players) {
        await client.query('INSERT INTO game_players (game_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [gameId, playerId]);
      }
      reply.send({ success: true });
    } finally {
      client.release();
    }
  });

  fastify.get('/', async (req, reply) => {
    const client = await getClient();
    try {
      const result = await client.query('SELECT * FROM games ORDER BY created_at DESC');
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  fastify.get('/:id/players', async (req, reply) => {
    const client = await getClient();
    try {
      const result = await client.query(
        `SELECT p.id, p.name
         FROM players p
         JOIN game_players gp ON gp.player_id = p.id
         WHERE gp.game_id = $1`,
        [req.params.id]
      );
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  fastify.put('/:id', async (req, reply) => {
    const { name } = req.body;
    if (!name) {
      return reply.code(400).send({ error: 'Game name required' });
    }

    const client = await getClient();
    try {
      await client.query('UPDATE games SET name = $1 WHERE id = $2', [name, req.params.id]);
      reply.send({ success: true });
    } finally {
      client.release();
    }
  });
}
