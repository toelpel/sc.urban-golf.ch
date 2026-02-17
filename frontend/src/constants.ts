export const API_ROUTES = {
  GAMES: '/games',
  GAMES_SUMMARY: '/games/summary',
  PLAYERS: '/players',
  SCORES: '/scores',
  FEEDBACK: '/feedback',
} as const

export const VALIDATION = {
  STROKES_MIN: -3,
  STROKES_MAX: 15,
  HOLE_MIN: 1,
  HOLE_MAX: 18,
  NAME_MAX_LENGTH: 100,
  GAME_NAME_MAX_LENGTH: 30,
  MESSAGE_MAX_LENGTH: 2000,
  PLAYERS_MAX: 10,
  RATING_MIN: 1,
  RATING_MAX: 5,
} as const

export const ID_PATTERN = /^[a-zA-Z0-9_-]{10,30}$/
