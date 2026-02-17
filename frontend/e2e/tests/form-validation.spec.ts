import { test, expect } from '../fixtures'

test.describe('Form Validation', () => {
  test.describe('New Game Form', () => {
    test('cannot start game without game name', async ({ newGamePage, page }) => {
      await newGamePage.goto()
      await newGamePage.fillPlayerName(0, 'SomePlayer')
      await newGamePage.startGame()

      // Should remain on the page (toast error shown)
      await expect(page).toHaveURL('/games/new')
    })

    test('cannot start game without any player', async ({ newGamePage, page }) => {
      await newGamePage.goto()
      await newGamePage.fillGameName('Test Game')
      // Leave player name empty
      await newGamePage.startGame()

      await expect(page).toHaveURL('/games/new')
    })

    test('add player button limited to 10 players', async ({ newGamePage }) => {
      await newGamePage.goto()
      // Start with 1 player, add 9 more to reach 10
      for (let i = 0; i < 9; i++) {
        await newGamePage.addPlayer()
      }
      await expect(newGamePage.addPlayerButton).toBeDisabled()
    })

    test('game name has maxlength 30', async ({ newGamePage }) => {
      await newGamePage.goto()
      await newGamePage.fillGameName('A'.repeat(50))
      const value = await newGamePage.gameNameInput.inputValue()
      expect(value.length).toBeLessThanOrEqual(30)
    })
  })
})
