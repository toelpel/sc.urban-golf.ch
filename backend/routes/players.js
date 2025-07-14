import { getClient } from '../db/pg.js';

/**
 * NanoID-Validierung (ca. 21 Zeichen, alphanumerisch + - _)
 */
const isValidId = (id) => /^[a-zA-Z0-9_-]{10,30}$/.test(id);

export default async function (fastify, opts) {
  // Spieler erstellen oder aktualisieren (POST + UPSERT)
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
        `INSERT INTO players (id, name)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [playerId, name]
      );
      reply.code(200).send({ id: playerId, name, status: 'upserted' });
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
}