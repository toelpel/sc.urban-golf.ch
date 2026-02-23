import { getClient } from '../db/pg.js';
import { validateGame, isValidId } from '../utils/validate.js';

export default async function (fastify, _opts) {
  // Spiel erstellen oder aktualisieren
  fastify.post('/', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute',
      },
    },
  }, async (req, reply) => {
    const validationErrors = validateGame(req.body || {});
    if (validationErrors) {
      return reply.code(400).send({ error: 'Validation failed', details: validationErrors });
    }

    const { id, name, players } = req.body;

    // Filter valid player IDs
    const validPlayers = players.filter(pid => isValidId(pid));

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO games (id, name)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [id, name]
      );

      // Batch INSERT for players (single query instead of loop)
      if (validPlayers.length > 0) {
        const values = [];
        const placeholders = validPlayers.map((pid, i) => {
          values.push(id, pid);
          return `($${i * 2 + 1}, $${i * 2 + 2})`;
        });

        await client.query(
          `INSERT INTO game_players (game_id, player_id)
           VALUES ${placeholders.join(', ')}
           ON CONFLICT DO NOTHING`,
          values
        );
      }

      await client.query('COMMIT');
      reply.send({ ...result.rows[0], status: 'upserted' });
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error({ id, players, error: err.message }, 'Failed to upsert game with players');
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });

  // Spiele abrufen mit optionaler Suche und Pagination
  fastify.get('/', async (req, reply) => {
    const client = await getClient();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(10, parseInt(req.query.per_page) || 4);
    const offset = (page - 1) * perPage;
    const search = req.query.search;

    try {
      let gamesQuery = '';
      let valuesGames = [];
      let countQuery = '';
      let valuesCount = [];

      if (search) {
        gamesQuery = `
          SELECT g.* FROM games g
          WHERE g.name ILIKE $1 OR EXISTS (
            SELECT 1 FROM game_players gp
            JOIN players p ON gp.player_id = p.id
            WHERE gp.game_id = g.id AND p.name ILIKE $1
          )
          ORDER BY g.created_at DESC
          LIMIT $2 OFFSET $3`;

        valuesGames = [`%${search}%`, perPage, offset];

        countQuery = `
          SELECT COUNT(*) FROM games g
          WHERE g.name ILIKE $1 OR EXISTS (
            SELECT 1 FROM game_players gp
            JOIN players p ON gp.player_id = p.id
            WHERE gp.game_id = g.id AND p.name ILIKE $1
          )`;
        valuesCount = [`%${search}%`];
      } else {
        gamesQuery = `
          SELECT g.* FROM games g
          ORDER BY g.created_at DESC
          LIMIT $1 OFFSET $2`;

        valuesGames = [perPage, offset];
        countQuery = `SELECT COUNT(*) FROM games g`;
      }

      const [gamesResult, countResult] = await Promise.all([
        client.query(gamesQuery, valuesGames),
        client.query(countQuery, valuesCount)
      ]);

      reply.send({
        games: gamesResult.rows,
        total: parseInt(countResult.rows[0].count)
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });

  // Spielname via ID abrufen
  fastify.get('/:id', async (req, reply) => {
    const gameId = req.params.id;
    if (!isValidId(gameId)) return reply.code(400).send({ error: 'Invalid game ID' });

    const client = await getClient();
    try {
      const result = await client.query(`SELECT id, name FROM games WHERE id = $1`, [gameId]);
      if (result.rowCount === 0) return reply.code(404).send({ error: 'Not found' });
      reply.send(result.rows[0]);
    } finally {
      client.release();
    }
  });

  // Spieler eines Spiels abrufen
  fastify.get('/:id/players', async (req, reply) => {
    const gameId = req.params.id;
    if (!isValidId(gameId)) return reply.code(400).send({ error: 'Invalid game ID' });

    const client = await getClient();
    try {
      const result = await client.query(
        `SELECT p.id, p.name
         FROM players p
         JOIN game_players gp ON gp.player_id = p.id
         WHERE gp.game_id = $1`,
        [gameId]
      );
      reply.send(result.rows);
    } finally {
      client.release();
    }
  });

  // Zusammenfassung with total count for pagination
  fastify.get('/summary', async (req, reply) => {
    const client = await getClient();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(10, parseInt(req.query.per_page) || 10);
    const offset = (page - 1) * perPage;
    const search = req.query.search;
    const values = search ? [`%${search}%`, perPage, offset] : [perPage, offset];

    try {
      const searchFilter = search ? `
        WHERE g.name ILIKE $1
          OR EXISTS (
            SELECT 1 FROM game_players gp
            JOIN players p ON gp.player_id = p.id
            WHERE gp.game_id = g.id AND p.name ILIKE $1
          )` : '';

      const countValues = search ? [`%${search}%`] : [];

      const gamesQuery = `
        WITH filtered_games AS (
          SELECT g.*
          FROM games g
          ${searchFilter}
          ORDER BY g.created_at DESC
          LIMIT $${search ? 2 : 1} OFFSET $${search ? 3 : 2}
        ),
        player_stats AS (
          SELECT
            g.id AS game_id,
            p.id AS player_id,
            p.name,
            ROUND(AVG(s.strokes)::numeric, 2) AS avg,
            SUM(s.strokes) AS total
          FROM filtered_games g
          JOIN game_players gp ON gp.game_id = g.id
          JOIN players p ON p.id = gp.player_id
          LEFT JOIN scores s ON s.game_id = g.id AND s.player_id = p.id
          GROUP BY g.id, p.id, p.name
        )
        SELECT
          g.*,
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', ps.player_id,
                'name', ps.name,
                'avg', ps.avg,
                'total', ps.total
              )
            )
            FROM player_stats ps
            WHERE ps.game_id = g.id
          ) AS players,
          (
          SELECT ARRAY_AGG(DISTINCT s.hole ORDER BY s.hole)
          FROM scores s
          WHERE s.game_id = g.id
        ) AS holes
        FROM filtered_games g
      `;

      const countQuery = `SELECT COUNT(*) FROM games g ${searchFilter}`;

      const [{ rows }, countResult] = await Promise.all([
        client.query(gamesQuery, values),
        client.query(countQuery, countValues)
      ]);

      reply.send({
        games: rows,
        total: parseInt(countResult.rows[0].count)
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Database error' });
    } finally {
      client.release();
    }
  });
}
