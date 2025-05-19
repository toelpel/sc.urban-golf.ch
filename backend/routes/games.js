import { getDBConnection } from '../db/database.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name } = req.body;
    if (!name) return reply.code(400).send({ error: 'Game name required' });

    const db = await getDBConnection();
    const result = await db.run('INSERT INTO games (name) VALUES (?)', [name]);
    reply.code(200).send({ id: result.lastID, name });
  });

  fastify.get('/', async (req, reply) => {
    const db = await getDBConnection();
    const games = await db.all('SELECT * FROM games ORDER BY created_at DESC');
    reply.send(games);
  });
}