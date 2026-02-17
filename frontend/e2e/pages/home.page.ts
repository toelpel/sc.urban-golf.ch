import { type Page, type Locator } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly heading: Locator
  readonly newGameButton: Locator
  readonly gamesButton: Locator
  readonly feedbackButton: Locator
  readonly aboutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1.maintitle')
    this.newGameButton = page.locator('a.button-primary', { hasText: 'New Game' })
    this.gamesButton = page.locator('a.button-primary', { hasText: /^Games$/ })
    this.feedbackButton = page.locator('a.button-primary', { hasText: 'Feedback' })
    this.aboutButton = page.locator('a.button-primary', { hasText: 'About' })
  }

  async goto() {
    await this.page.goto('/')
    await this.heading.waitFor()
  }

  async navigateToNewGame() {
    await this.newGameButton.click()
    await this.page.waitForURL('/games/new')
  }

  async navigateToGames() {
    await this.gamesButton.click()
    await this.page.waitForURL('/games')
  }

  async navigateToFeedback() {
    await this.feedbackButton.click()
    await this.page.waitForURL('/feedback')
  }

  async navigateToAbout() {
    await this.aboutButton.click()
    await this.page.waitForURL(/\/about/)
  }
}
