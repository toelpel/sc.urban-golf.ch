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
    this.heading = page.locator('h1.maintitle')
    // First input.input-field is the game name
    this.gameNameInput = page.locator('input.input-field').first()
    this.addPlayerButton = page.getByRole('button', { name: 'Add Player' })
    this.startGameButton = page.getByRole('button', { name: 'Start Game' })
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' })
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
    // First input is game name, players start at index 1
    const playerInputs = this.page.locator('input.input-field')
    await playerInputs.nth(index + 1).fill(name)
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
