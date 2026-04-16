import { type Page, type Locator } from '@playwright/test'

/**
 * Home-Page Objekt für das Greenway-Designsystem.
 * - Hero-Titel ist `.home-hero__title`
 * - Primär-CTAs im Hero: Neues Spiel + Spiele
 * - Sekundäre Navigation (Feedback, About) liegt in der Bottom-Nav (mobile)
 *   bzw. der Top-Bar (Desktop ≥ 768px).
 */
export class HomePage {
  readonly page: Page
  readonly heading: Locator
  readonly newGameButton: Locator
  readonly gamesButton: Locator
  readonly feedbackButton: Locator
  readonly aboutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('.home-hero__title')
    this.newGameButton = page.getByRole('link', { name: /Neues Spiel|New Game/ })
    this.gamesButton = page.getByRole('link', { name: /^(Spiele|Games)$/ })
    // Feedback existiert nicht mehr als Hero-Button — nutze die Bottom-/Top-Nav
    this.feedbackButton = page.getByRole('link', { name: /Feedback/ }).first()
    this.aboutButton = page.getByRole('link', { name: /Über uns|About/ }).first()
  }

  async goto() {
    await this.page.goto('/')
    await this.heading.waitFor()
  }

  async navigateToNewGame() {
    await this.newGameButton.first().click()
    await this.page.waitForURL('/games/new')
  }

  async navigateToGames() {
    await this.gamesButton.first().click()
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
