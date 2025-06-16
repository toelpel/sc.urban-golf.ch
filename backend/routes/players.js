import { getClient } from '../db/pg.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name } = req.body;
    if (!name) return reply.code(400).send({ error: 'Player name required' });

    const client = await getClient();
    try {
      const result = await client.query('INSERT INTO players (name) VALUES ($1) RETURNING id', [name]);
      reply.code(200).send({ id: result.rows[0].id, name });
    } finally {
      client.release();
    }
  });

  fastify.get('/', async (req, reply) => {
    const client = await getClient();
    try {
      const result = await client.query('SELECT * FROM players ORDER BY name');
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  fastify.put('/:id', async (req, reply) => {
    const { name } = req.body;
    if (!name) return reply.code(400).send({ error: 'Player name required' });

    const client = await getClient();
    try {
      await client.query('UPDATE players SET name = $1 WHERE id = $2', [name, req.params.id]);
      reply.send({ success: true });
    } finally {
      client.release();
    }
  });
}
