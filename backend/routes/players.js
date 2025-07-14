import { getClient } from '../db/pg.js';

/**
 * NanoID-Validierung (ca. 21 Zeichen, alphanumerisch + - _)
 */
const isValidId = (id) => /^[a-zA-Z0-9_-]{10,30}$/.test(id);

export default async function (fastify, opts) {
  // Spieler erstellen (mit vom Client gesetzter ID)
  fastify.post('/', async (req, reply) => {
    const { id, name } = req.body;

    if (!name) {
      return reply.code(400).send({ error: 'Player name required' });
    }

    const playerId = id;
    if (!playerId || !isValidId(playerId)) {
      return reply.code(400).send({ error: 'Valid player ID required' });
    }

    const client = await getClient();
    try {
      await client.query(
        'INSERT INTO players (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [playerId, name]
      );
      reply.code(200).send({ id: playerId, name });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });

  // Alle Spieler abrufen
  fastify.get('/', async (req, reply) => {
    const client = await getClient();
    try {
      const result = await client.query('SELECT * FROM players ORDER BY name');
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  // Spielername aktualisieren
  fastify.put('/:id', async (req, reply) => {
    const { name } = req.body;
    const playerId = req.params.id;

    if (!name) {
      return reply.code(400).send({ error: 'Player name required' });
    }

    if (!isValidId(playerId)) {
      return reply.code(400).send({ error: 'Invalid player ID' });
    }

    const client = await getClient();
    try {
      await client.query(
        'UPDATE players SET name = $1 WHERE id = $2',
        [name, playerId]
      );
      reply.send({ success: true });
    } finally {
      client.release();
    }
  });
}