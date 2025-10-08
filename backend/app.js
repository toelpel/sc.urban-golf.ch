import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'node:crypto';

import scoreRoutes from './routes/scores.js';
import gameRoutes from './routes/games.js';
import playerRoutes from './routes/players.js';
import feedbackRoutes from './routes/feedback.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// trustProxy: wichtig, wenn hinter einem Proxy (Render/Nginx/Heroku etc.)
const fastify = Fastify({ logger: true, trustProxy: true });

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

await fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  // Authorization zulassen, da wir ihn fürs Rate-Limit verwenden
  allowedHeaders: ['Content-Type', 'Authorization'],
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
      connectSrc: ["'self'", 'https://*.supabase.co', ...allowedOrigins]
    }
  }
});

// Globales Rate-Limit: 100 Requests pro 5 Minuten
await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '5 minutes',

  // Schlüsselbildung: bevorzugt Authorization-Header, sonst IP
  keyGenerator: (req) => {
    const auth = req.headers['authorization'];
    if (auth && typeof auth === 'string' && auth.trim() !== '') {
      // Hash für Datenschutz/gleichmäßige Länge
      const hash = crypto.createHash('sha256').update(auth).digest('hex');
      return `auth:${hash}`;
    }
    return `ip:${req.ip}`;
  },

  // Hilfreiche Response-Header aktivieren
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
    'retry-after': true,
  },

  // Saubere 429-Antwort
  errorResponseBuilder: (req, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Try again in ${Math.ceil(context.after / 1000)} seconds.`,
  }),

  // Falls der Store ausfällt: Requests nicht komplett blockieren
  skipOnError: true,
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