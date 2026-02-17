import { type Page, type Locator } from '@playwright/test'

export class FeedbackPage {
  readonly page: Page
  readonly heading: Locator
  readonly starButtons: Locator
  readonly messageInput: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly submitButton: Locator
  readonly thankYouMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1.maintitle')
    this.starButtons = page.locator('button:has-text("★")')
    this.messageInput = page.locator('textarea#message')
    this.nameInput = page.locator('input#name')
    this.emailInput = page.locator('input#email')
    this.submitButton = page.locator('button.button-primary[type="submit"]')
    this.thankYouMessage = page.getByText('Thank you for your feedback')
  }

  async goto() {
    await this.page.goto('/feedback')
    await this.heading.waitFor()
  }

  async setRating(stars: number) {
    await this.starButtons.nth(stars - 1).click()
  }

  async fillMessage(text: string) {
    await this.messageInput.fill(text)
  }

  async fillName(name: string) {
    await this.nameInput.fill(name)
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async submit() {
    await this.submitButton.click()
  }
}
