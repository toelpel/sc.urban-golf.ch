import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import scoreRoutes from './routes/scores.js';
import gameRoutes from './routes/games.js';
import playerRoutes from './routes/players.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: ['https://sc.urban-golf.ch'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

fastify.register(scoreRoutes, { prefix: '/api/scores' });
fastify.register(gameRoutes, { prefix: '/api/games' });
fastify.register(playerRoutes, { prefix: '/api/players' });

fastify.get('/', async (req, reply) => {
  reply.send({ status: 'ok', service: 'Urban Golf API' });
});

const PORT = process.env.PORT || 3000;

fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});