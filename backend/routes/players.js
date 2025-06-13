import { getDBConnection } from '../db/database.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name } = req.body;
    if (!name) return reply.code(400).send({ error: 'Player name required' });

    const db = await getDBConnection();
    const result = await db.run('INSERT INTO players (name) VALUES (?)', [name]);
    reply.code(200).send({ id: result.lastID, name });
  });

  fastify.get('/', async (req, reply) => {
    const db = await getDBConnection();
    const players = await db.all('SELECT * FROM players ORDER BY name ASC');
    reply.send(players);
  });

  // NEU: Spieler umbenennen
  fastify.put('/:id', async (req, reply) => {
    const playerId = req.params.id;
    const { name } = req.body;

    if (!name) {
      return reply.code(400).send({ error: 'Player name required' });
    }

    const db = await getDBConnection();
    await db.run('UPDATE players SET name = ? WHERE id = ?', [name, playerId]);

    reply.send({ success: true });
  });
}