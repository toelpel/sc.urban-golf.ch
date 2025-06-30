import { getClient } from '../db/pg.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

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
      // In DB speichern
      await client.query(
        `INSERT INTO feedback (rating, message, name, email)
         VALUES ($1, $2, $3, $4)`,
        [rating, message, name || null, email || null]
      );

      // Benachrichtigung senden
      await transporter.sendMail({
        from: '"Urban-Golf.ch ScoreCard" <909864001@smtp-brevo.com>',
        to: process.env.ADMIN_EMAIL,
        subject: '🎉 Neues Feedback eingegangen',
        text: `Bewertung: ${rating}/5\nVon: ${name || 'Anonym'} <${email || 'keine Email'}>\n\n${message}`,
      });

      reply.send({ success: true });
    } catch (err) {
      request.log.error(err);
      reply.code(500).send({ error: 'Fehler beim Speichern oder Mailversand' });
    } finally {
      client.release();
    }
  });
}