// Shared domain constants — keep in sync with frontend/src/constants.ts
export const VALIDATION = Object.freeze({
  STROKES_MIN: -3,
  STROKES_MAX: 20,
  HOLE_MIN: 1,
  HOLE_MAX: 18,
  NAME_MAX_LENGTH: 100,
  GAME_NAME_MAX_LENGTH: 100,
  MESSAGE_MAX_LENGTH: 2000,
  RATING_MIN: 1,
  RATING_MAX: 5,
  EMAIL_MAX_LENGTH: 100,
});

export const ID_PATTERN = /^[a-zA-Z0-9_-]{10,30}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
