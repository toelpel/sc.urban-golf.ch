import { getDBConnection } from '../db/database.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name, players } = req.body;
    if (!name || !Array.isArray(players)) {
      return reply.code(400).send({ error: 'Game name and player list required' });
    }

    const db = await getDBConnection();
    const result = await db.run('INSERT INTO games (name) VALUES (?)', [name]);
    const gameId = result.lastID;

    for (const playerId of players) {
      await db.run('INSERT INTO game_players (game_id, player_id) VALUES (?, ?)', [gameId, playerId]);
    }

    reply.code(200).send({ id: gameId, name });
  });

  fastify.get('/', async (req, reply) => {
    const db = await getDBConnection();
    const games = await db.all('SELECT * FROM games ORDER BY created_at DESC');
    reply.send(games);
  });

  fastify.get('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    const db = await getDBConnection();
    const players = await db.all(
      `SELECT p.id, p.name
       FROM players p
       JOIN game_players gp ON gp.player_id = p.id
       WHERE gp.game_id = ?`,
      [gameId]
    );
    reply.send(players);
  });
}