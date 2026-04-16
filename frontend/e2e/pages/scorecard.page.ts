import { type Page, type Locator } from '@playwright/test'

/**
 * Scorecard (Detail) — enthält Ranking (Default), Horizontal- und Vertikal-View.
 */
export class ScorecardPage {
  readonly page: Page
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('.games-detail__title')
  }

  async goto(gameId: string) {
    await this.page.goto(`/games/${gameId}`)
    await this.heading.waitFor()
  }

  async getTitle(): Promise<string> {
    return (await this.heading.textContent()) || ''
  }

  /**
   * Extrahiert Spielernamen aus der aktuell sichtbaren Ansicht.
   * Funktioniert sowohl für Ranking (`.ranking__name`) als auch für
   * die Tabellen-Views (`.scorecard__player-name`, `.scorecard__head-name`).
   */
  async getPlayerNames(): Promise<string[]> {
    await this.page.waitForSelector(
      '.ranking__name, .scorecard__player-name, .scorecard__head-name',
      { timeout: 10000 }
    )
    const rankingNames = await this.page.locator('.ranking__name').allTextContents()
    const horizontalNames = await this.page.locator('.scorecard__player-name').allTextContents()
    const verticalNames = await this.page.locator('.scorecard__head-name').allTextContents()
    const all = [...rankingNames, ...horizontalNames, ...verticalNames].map((s) => s.trim()).filter(Boolean)
    return [...new Set(all)]
  }

  /**
   * Wechselt die View via SegmentedControl (role=tablist, aria-label="Ansicht").
   * - "ranking"   → 1. Tab (Trophy-Icon)
   * - "horizontal" → 2. Tab (Table-Icon)
   * - "vertical"  → 3. Tab (List-Icon)
   */
  async switchView(mode: 'ranking' | 'horizontal' | 'vertical') {
    const order = { ranking: 0, horizontal: 1, vertical: 2 }
    const idx = order[mode]
    await this.page.getByRole('tablist', { name: /Ansicht|View/i }).locator('.segmented__item').nth(idx).click()
  }
}
