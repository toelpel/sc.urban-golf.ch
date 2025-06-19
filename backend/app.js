import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import scoreRoutes from './routes/scores.js';
import gameRoutes from './routes/games.js';
import playerRoutes from './routes/players.js';
import feedbackRoutes from './routes/feedback.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'https://sc.urban-golf.ch',
      'https://sc-test.urban-golf.ch'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 200
});

await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://*.supabase.co'],
    }
  }
});

await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

fastify.register(scoreRoutes, { prefix: '/api/scores' });
fastify.register(gameRoutes, { prefix: '/api/games' });
fastify.register(playerRoutes, { prefix: '/api/players' });
fastify.register(feedbackRoutes, { prefix: '/api/feedback' });

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