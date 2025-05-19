import { getDBConnection } from '../db/database.js';

export default async function (fastify, opts) {
  fastify.get('/', async (req, reply) => {
    const gameId = req.query.game_id;
    if (!gameId) {
      return reply.code(400).send({ error: 'Missing game_id query parameter' });
    }

    const db = await getDBConnection();
    const scores = await db.all(
      `SELECT s.*, p.name as player_name FROM scores s
       JOIN players p ON s.player_id = p.id
       WHERE s.game_id = ?
       ORDER BY s.hole ASC, p.name ASC`,
      [gameId]
    );
    reply.send(scores);
  });

  fastify.post('/', async (req, reply) => {
    const { game_id, player_id, strokes, hole } = req.body;
    if (!game_id || !player_id || !strokes || !hole) {
      return reply.code(400).send({ error: 'Missing fields' });
    }
    const db = await getDBConnection();
    const result = await db.run(
      'INSERT INTO scores (game_id, player_id, hole, strokes) VALUES (?, ?, ?, ?)',
      [game_id, player_id, hole, strokes]
    );
    reply.code(200).send({ id: result.lastID, game_id, player_id, hole, strokes });
  });
}