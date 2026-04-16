import { type Page, type Locator } from '@playwright/test'

export class AboutPage {
  readonly page: Page
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /Über uns|About/ }).first()
  }

  async goto() {
    await this.page.goto('/about')
  }

  async goToChangelog() {
    await this.page.goto('/about/changelog')
  }

  async goToRoadmap() {
    await this.page.goto('/about/roadmap')
  }
}
