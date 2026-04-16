/**
 * Horizontal-Scroll-Audit
 *
 * Besucht alle Haupt-Views und prüft, ob der Body bzw. der Main-Container
 * horizontal scrollt (= scrollWidth > clientWidth).
 *
 * Pixel-5 Viewport (393×851).
 */
import { chromium, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, 'screenshots')
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

const SAMPLE_GAME_ID = 'demo-game-2026-42'
const SAMPLE_PLAYERS = [
  { id: 'player-1-anna-marie', name: 'Anna Meier' },
  { id: 'player-2-boris-wild', name: 'Boris Wild' },
  { id: 'player-3-chris-schmi', name: 'Christian Schmid' },
  { id: 'player-4-david-huber', name: 'David Huber' },
]
const SAMPLE_HOLES = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const SAMPLE_SCORES = SAMPLE_PLAYERS.flatMap((p, pIdx) =>
  SAMPLE_HOLES.map((h) => ({
    game_id: SAMPLE_GAME_ID,
    player_id: p.id,
    hole: h,
    strokes: 2 + ((pIdx + h) % 4),
  }))
)

const SAMPLE_SUMMARY = {
  games: [{
    id: SAMPLE_GAME_ID,
    name: 'Stadtpark-Runde mit Freunden',
    created_at: '2026-04-12T18:30:00Z',
    players: SAMPLE_PLAYERS.map((p, i) => ({ ...p, total: 20 + i * 3, avg: 2.5 + i * 0.4 })),
    holes: SAMPLE_HOLES,
  }],
}

async function mockApi(page) {
  await page.route('**/api/games/summary**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_SUMMARY) })
  )
  await page.route(`**/api/games/${SAMPLE_GAME_ID}/players`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_PLAYERS) })
  )
  await page.route(`**/api/games/${SAMPLE_GAME_ID}`, (route) =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ id: SAMPLE_GAME_ID, name: SAMPLE_SUMMARY.games[0].name, created_at: SAMPLE_SUMMARY.games[0].created_at }),
    })
  )
  await page.route('**/api/scores**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_SCORES) })
  )
}

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'GamesList', path: '/games' },
  { name: 'GamesNew', path: '/games/new' },
  { name: 'GamesDetail-Ranking', path: `/games/${SAMPLE_GAME_ID}`, prep: (page) =>
    page.evaluate(() => localStorage.setItem('GamesDetailView', 'ranking')) },
  { name: 'GamesDetail-Horizontal', path: `/games/${SAMPLE_GAME_ID}`, prep: (page) =>
    page.evaluate(() => localStorage.setItem('GamesDetailView', 'horizontal')) },
  { name: 'GamesDetail-Vertical', path: `/games/${SAMPLE_GAME_ID}`, prep: (page) =>
    page.evaluate(() => localStorage.setItem('GamesDetailView', 'vertical')) },
  { name: 'GamesHole', path: `/games/${SAMPLE_GAME_ID}/3` },
  { name: 'About', path: '/about' },
  { name: 'Roadmap', path: '/about/roadmap' },
  { name: 'Feedback', path: '/feedback' },
]

async function measure(page) {
  return await page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    return {
      docClient: doc.clientWidth,
      docScroll: doc.scrollWidth,
      bodyClient: body.clientWidth,
      bodyScroll: body.scrollWidth,
    }
  })
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ ...devices['Pixel 5'] })
  const page = await context.newPage()

  await page.addInitScript(() => {
    localStorage.setItem('language', 'de')
    localStorage.setItem('theme', 'light')
    localStorage.setItem('ug-install-dismissed', 'true')
  })
  await mockApi(page)

  const issues = []

  for (const target of PAGES) {
    if (target.prep) {
      await page.goto(BASE_URL, { waitUntil: 'load' })
      await target.prep(page)
    }
    await page.goto(BASE_URL + target.path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    const m = await measure(page)
    const overflow = m.docScroll - m.docClient
    const status = overflow > 1 ? 'BAD' : 'OK'
    console.log(
      `  ${status.padEnd(3)} ${target.name.padEnd(28)} ` +
      `scroll=${m.docScroll} client=${m.docClient} overflow=${overflow}px`
    )
    if (overflow > 1) {
      // Screenshot des aktuellen Zustands
      await page.screenshot({ path: resolve(OUT_DIR, `h-overflow-${target.name}.png`), fullPage: false })
      issues.push({ name: target.name, overflow, ...m })
    }
  }

  await context.close()
  await browser.close()

  console.log(`\nSummary: ${issues.length} view(s) have horizontal overflow`)
  for (const i of issues) {
    console.log(`  - ${i.name}: ${i.overflow}px excess`)
  }
  if (issues.length) process.exit(1)
}

main().catch((err) => { console.error(err); process.exit(1) })
