// Single source of truth für die API-Contract-Shapes (Request/Response).
//
// Aktuell als Doku- und Test-Referenz gepflegt. Beim Wiring an Routes
// (`schema: { body, response }`) zwei Punkte beachten:
//   1. fast-json-stringify strippt Felder, die nicht in den response-properties
//      stehen → response-Schemas vorher gegen reale Antworten verifizieren.
//   2. Fastify-Default-Body-Errors haben ein anderes Format als die manuellen
//      `validate*()`-Helpers. Vor dem Umstieg `setSchemaErrorFormatter` setzen
//      und die Route-Tests anpassen, sonst brechen die `Validation failed`-
//      Assertions in backend/routes/__tests__.
import { VALIDATION } from './constants.js'

const idSchema = {
  type: 'string',
  pattern: '^[a-zA-Z0-9_-]{10,30}$',
}

const playerSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: idSchema,
    name: { type: 'string', minLength: 1, maxLength: VALIDATION.NAME_MAX_LENGTH },
  },
}

const gameRowSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: idSchema,
    name: { type: 'string' },
    created_at: { type: ['string', 'null'] },
  },
}

const scoreRowSchema = {
  type: 'object',
  required: ['game_id', 'player_id', 'hole', 'strokes'],
  properties: {
    id: { type: ['integer', 'string'] },
    game_id: idSchema,
    player_id: idSchema,
    player_name: { type: 'string' },
    hole: { type: 'integer', minimum: VALIDATION.HOLE_MIN, maximum: VALIDATION.HOLE_MAX },
    strokes: { type: 'integer', minimum: VALIDATION.STROKES_MIN, maximum: VALIDATION.STROKES_MAX },
  },
}

export const schemas = {
  // Players
  postPlayer: {
    body: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: idSchema,
        name: { type: 'string', minLength: 1, maxLength: VALIDATION.NAME_MAX_LENGTH },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: idSchema,
          name: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  },

  getPlayers: {
    response: {
      200: {
        type: 'array',
        items: playerSchema,
      },
    },
  },

  // Games
  postGame: {
    body: {
      type: 'object',
      required: ['id', 'name', 'players'],
      properties: {
        id: idSchema,
        name: { type: 'string', minLength: 1, maxLength: VALIDATION.GAME_NAME_MAX_LENGTH },
        players: {
          type: 'array',
          minItems: 1,
          items: idSchema,
        },
      },
      additionalProperties: false,
    },
  },

  getGameById: {
    response: {
      200: gameRowSchema,
    },
  },

  getGamePlayers: {
    response: {
      200: {
        type: 'array',
        items: playerSchema,
      },
    },
  },

  // Scores
  getScores: {
    querystring: {
      type: 'object',
      required: ['game_id'],
      properties: {
        game_id: idSchema,
      },
    },
    response: {
      200: {
        type: 'array',
        items: scoreRowSchema,
      },
    },
  },

  postScore: {
    body: {
      type: 'object',
      required: ['game_id', 'player_id', 'hole', 'strokes'],
      properties: {
        game_id: idSchema,
        player_id: idSchema,
        hole: { type: 'integer', minimum: VALIDATION.HOLE_MIN, maximum: VALIDATION.HOLE_MAX },
        strokes: { type: 'integer', minimum: VALIDATION.STROKES_MIN, maximum: VALIDATION.STROKES_MAX },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: ['integer', 'string'] },
          game_id: idSchema,
          player_id: idSchema,
          hole: { type: 'integer' },
          strokes: { type: 'integer' },
        },
      },
    },
  },

  // Feedback
  postFeedback: {
    body: {
      type: 'object',
      required: ['rating', 'message'],
      properties: {
        rating: {
          type: 'integer',
          minimum: VALIDATION.RATING_MIN,
          maximum: VALIDATION.RATING_MAX,
        },
        message: {
          type: 'string',
          minLength: 1,
          maxLength: VALIDATION.MESSAGE_MAX_LENGTH,
        },
        name: {
          type: ['string', 'null'],
          maxLength: VALIDATION.NAME_MAX_LENGTH,
        },
        email: {
          type: ['string', 'null'],
          maxLength: VALIDATION.EMAIL_MAX_LENGTH,
        },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        },
      },
    },
  },
}
