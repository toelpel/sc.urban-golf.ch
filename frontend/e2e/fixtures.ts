import { test as base } from '@playwright/test'
import { HomePage } from './pages/home.page'
import { GamesListPage } from './pages/games-list.page'
import { NewGamePage } from './pages/new-game.page'
import { ScorecardPage } from './pages/scorecard.page'
import { HoleViewPage } from './pages/hole-view.page'
import { FeedbackPage } from './pages/feedback.page'
import { AboutPage } from './pages/about.page'

type PageObjects = {
  homePage: HomePage
  gamesListPage: GamesListPage
  newGamePage: NewGamePage
  scorecardPage: ScorecardPage
  holeViewPage: HoleViewPage
  feedbackPage: FeedbackPage
  aboutPage: AboutPage
}

export const test = base.extend<PageObjects>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },
  gamesListPage: async ({ page }, use) => {
    await use(new GamesListPage(page))
  },
  newGamePage: async ({ page }, use) => {
    await use(new NewGamePage(page))
  },
  scorecardPage: async ({ page }, use) => {
    await use(new ScorecardPage(page))
  },
  holeViewPage: async ({ page }, use) => {
    await use(new HoleViewPage(page))
  },
  feedbackPage: async ({ page }, use) => {
    await use(new FeedbackPage(page))
  },
  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page))
  },
})

export { expect } from '@playwright/test'
