import { type Page, type Locator } from '@playwright/test'

export class NewGamePage {
  readonly page: Page
  readonly heading: Locator
  readonly gameNameInput: Locator
  readonly addPlayerButton: Locator
  readonly startGameButton: Locator
  readonly saveChangesButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /Neues Spiel erstellen|Spiel bearbeiten|New Game|Edit Game/ })
    this.gameNameInput = page.locator('input#game-name')
    this.addPlayerButton = page.getByRole('button', { name: /Spieler hinzufügen|Add Player/ })
    this.startGameButton = page.getByRole('button', { name: /Spiel starten|Start Game/ })
    this.saveChangesButton = page.getByRole('button', { name: /Änderungen speichern|Save Changes/ })
  }

  async goto() {
    await this.page.goto('/games/new')
    await this.heading.waitFor()
  }

  async gotoEdit(gameId: string) {
    await this.page.goto(`/games/new/${gameId}`)
    await this.heading.waitFor()
  }

  async fillGameName(name: string) {
    await this.gameNameInput.fill(name)
  }

  async fillPlayerName(index: number, name: string) {
    await this.page.locator('.new-game__player-input').nth(index).fill(name)
  }

  async addPlayer() {
    await this.addPlayerButton.click()
  }

  async startGame() {
    await this.startGameButton.click()
  }

  async saveChanges() {
    await this.saveChangesButton.click()
  }
}
