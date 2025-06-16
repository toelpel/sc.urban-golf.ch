import { getClient } from '../db/pg.js';

export default async function (fastify, opts) {
  fastify.get('/', async (req, reply) => {
    const gameId = req.query.game_id;
    if (!gameId) {
      return reply.code(400).send({ error: 'Missing game_id query parameter' });
    }

    const client = await getClient();
    try {
      const result = await client.query(
        `SELECT s.*, p.name as player_name FROM scores s
         JOIN players p ON s.player_id = p.id
         WHERE s.game_id = $1
         ORDER BY s.hole ASC, p.name ASC`,
        [gameId]
      );
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  fastify.post('/', async (req, reply) => {
    const { game_id, player_id, strokes, hole } = req.body;
    if (!game_id || !player_id || !strokes || !hole) {
      return reply.code(400).send({ error: 'Missing fields' });
    }

    const client = await getClient();
    try {
      const result = await client.query(
        'INSERT INTO scores (game_id, player_id, hole, strokes) VALUES ($1, $2, $3, $4) RETURNING id',
        [game_id, player_id, hole, strokes]
      );
      reply.code(200).send({ id: result.rows[0].id, game_id, player_id, hole, strokes });
    } finally {
      client.release();
    }
  });
}
