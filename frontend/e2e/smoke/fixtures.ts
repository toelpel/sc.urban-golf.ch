import { test as base, expect } from '@playwright/test'
import { installMockApi } from './mock-api'

type Fixtures = {
  mockApi: Awaited<ReturnType<typeof installMockApi>>
}

/**
 * Smoke-Fixture: bereitet jede Page mit API-Mocks, Default-Sprache "de",
 * dismissed PWA-Banner und Light-Theme vor. Kein Backend erforderlich.
 */
export const test = base.extend<Fixtures>({
  mockApi: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('language', 'de')
      localStorage.setItem('theme', 'light')
      localStorage.setItem('ug-install-dismissed', 'true')
      localStorage.setItem('GamesDetailView', 'ranking')
    })
    const state = await installMockApi(page)
    await use(state)
  },
})

export { expect }
