const ID_PATTERN = /^[a-zA-Z0-9_-]{10,30}$/

export function isValidId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id)
}

export function validateScore({ game_id, player_id, hole, strokes } = {}) {
  const errors = []

  if (!isValidId(game_id)) errors.push('Invalid game_id')
  if (!isValidId(player_id)) errors.push('Invalid player_id')

  if (!Number.isInteger(hole) || hole < 1 || hole > 18) {
    errors.push('hole must be integer 1-18')
  }

  if (!Number.isInteger(strokes) || strokes < -3 || strokes > 20) {
    errors.push('strokes must be integer -3 to 20')
  }

  return errors.length ? errors : null
}

export function validatePlayer({ id, name } = {}) {
  const errors = []

  if (!isValidId(id)) errors.push('Invalid player id')

  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('Player name cannot be blank')
  } else if (name.length > 100) {
    errors.push('Player name must be at most 100 characters')
  }

  return errors.length ? errors : null
}

export function validateGame({ id, name, players } = {}) {
  const errors = []

  if (!isValidId(id)) errors.push('Invalid game id')

  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('Game name required')
  } else if (name.length > 100) {
    errors.push('Game name must be at most 100 characters')
  }

  if (!Array.isArray(players) || players.length === 0) {
    errors.push('At least one player required')
  }

  return errors.length ? errors : null
}

export function validateFeedback({ rating, message, name, email: _email } = {}) {
  const errors = []

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be 1-5')
  }

  if (typeof message !== 'string' || message.trim() === '') {
    errors.push('Message required')
  } else if (message.length > 2000) {
    errors.push('Message must be at most 2000 characters')
  }

  if (name !== undefined && name !== null && typeof name === 'string' && name.length > 100) {
    errors.push('Name must be at most 100 characters')
  }

  return errors.length ? errors : null
}
