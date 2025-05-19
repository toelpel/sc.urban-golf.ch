import { getDBConnection } from '../db/database.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name } = req.body;
    if (!name) return reply.code(400).send({ error: 'Player name required' });

    const db = await getDBConnection();
    const result = await db.run('INSERT INTO players (name) VALUES (?)', [name]);
    reply.send({ id: result.lastID, name });
  });

  fastify.get('/', async (req, reply) => {
    const db = await getDBConnection();
    const players = await db.all('SELECT * FROM players');
    reply.send(players);
  });
}