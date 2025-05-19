import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/scores.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export async function getDBConnection() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_players (
      game_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      PRIMARY KEY (game_id, player_id),
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      hole INTEGER NOT NULL,
      strokes INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);

  return db;
}


// === backend/routes/games.js ===
import { getDBConnection } from '../db/database.js';

export default async function (fastify, opts) {
  fastify.post('/', async (req, reply) => {
    const { name, players } = req.body;
    if (!name || !Array.isArray(players)) {
      return reply.code(400).send({ error: 'Game name and player list required' });
    }

    const db = await getDBConnection();
    const result = await db.run('INSERT INTO games (name) VALUES (?)', [name]);
    const gameId = result.lastID;

    for (const playerId of players) {
      await db.run('INSERT INTO game_players (game_id, player_id) VALUES (?, ?)', [gameId, playerId]);
    }

    reply.code(200).send({ id: gameId, name });
  });

  fastify.get('/', async (req, reply) => {
    const db = await getDBConnection();
    const games = await db.all('SELECT * FROM games ORDER BY created_at DESC');
    reply.send(games);
  });

  fastify.get('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    const db = await getDBConnection();
    const players = await db.all(
      `SELECT p.id, p.name
       FROM players p
       JOIN game_players gp ON gp.player_id = p.id
       WHERE gp.game_id = ?`,
      [gameId]
    );
    reply.send(players);
  });
}