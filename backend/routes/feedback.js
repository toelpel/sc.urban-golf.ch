import { getClient } from '../db/pg.js';

export default async function (fastify, opts) {
  fastify.post('/', async (request, reply) => {
    const { rating, message, name, email } = request.body;

    if (
      !rating || !message ||
      typeof rating !== 'number' || rating < 1 || rating > 5 ||
      typeof message !== 'string' || message.trim() === ''
    ) {
      return reply.code(400).send({ error: 'Ungültige Eingaben' });
    }

    const client = await getClient();

    try {
      await client.query(
        `INSERT INTO feedback (rating, message, name, email)
         VALUES ($1, $2, $3, $4)`,
        [rating, message, name || null, email || null]
      );

      reply.send({ success: true });
    } catch (err) {
      request.log.error(err);
      reply.code(500).send({ error: 'Fehler beim Speichern des Feedbacks' });
    } finally {
      client.release();
    }
  });
}
