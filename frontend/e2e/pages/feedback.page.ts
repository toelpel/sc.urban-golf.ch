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
    this.heading = page.getByRole('heading', { name: /Feedback zur Scorecard|Feedback/ })
    this.starButtons = page.locator('.feedback__star')
    this.messageInput = page.locator('textarea#message')
    this.nameInput = page.locator('input#name')
    this.emailInput = page.locator('input#email')
    this.submitButton = page.getByRole('button', { name: /Absenden|Send/ })
    this.thankYouMessage = page.getByText(/Vielen Dank für dein Feedback|Thank you/)
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
