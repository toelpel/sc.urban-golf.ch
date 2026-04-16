/**
 * Visual-Audit-Script (Playwright Node API, kein Test-Runner)
 *
 * Nutzt den laufenden Vite-Dev-Server (http://localhost:5173) um
 * für alle Haupt-Views Screenshots zu erzeugen — einmal im Light-
 * und einmal im Dark-Mode auf einem Pixel-5-Viewport. API-Calls werden
 * für Detail-Screens gemockt, damit der Screenshot-Lauf ohne Backend
 * funktioniert.
 *
 * Nutzung: node e2e/visual-audit.mjs
 * Output:  e2e/screenshots/
 */
import { chromium, devices } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, 'screenshots')
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

// Gemockte Daten, damit Detail-Views etwas anzeigen können
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
  games: [
    {
      id: SAMPLE_GAME_ID,
      name: 'Stadtpark-Runde mit Freunden',
      created_at: '2026-04-12T18:30:00Z',
      players: SAMPLE_PLAYERS.map((p, i) => ({
        ...p,
        total: 20 + i * 3,
        avg: 2.5 + i * 0.4,
      })),
      holes: SAMPLE_HOLES,
    },
    {
      id: 'demo-game-spring-2026',
      name: 'Frühlings-Training',
      created_at: '2026-04-05T10:15:00Z',
      players: SAMPLE_PLAYERS.slice(0, 2).map((p, i) => ({ ...p, total: 18 + i * 2, avg: 3 + i * 0.3 })),
      holes: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 'demo-game-solo-2026',
      name: 'Solo Practice',
      created_at: '2026-03-28T14:00:00Z',
      players: [{ ...SAMPLE_PLAYERS[0], total: 14, avg: 2.3 }],
      holes: [1, 2, 3, 4, 5, 6],
    },
  ],
}

/** Mockt API-Routen (Prefix /api/) auf einer Playwright-Page. */
async function mockApi(page) {
  await page.route('**/api/games/summary**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_SUMMARY) })
  )
  await page.route(`**/api/games/${SAMPLE_GAME_ID}/players`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_PLAYERS) })
  )
  await page.route(`**/api/games/${SAMPLE_GAME_ID}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: SAMPLE_GAME_ID,
        name: SAMPLE_SUMMARY.games[0].name,
        created_at: SAMPLE_SUMMARY.games[0].created_at,
      }),
    })
  )
  await page.route('**/api/scores**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, ...JSON.parse(route.request().postData() || '{}') }),
      })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_SCORES) })
  })
  await page.route('**/api/players**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SAMPLE_PLAYERS),
    })
  )
  await page.route('**/api/feedback', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  )
}

const PAGES = [
  { name: '01-home', path: '/' },
  { name: '02-games-list', path: '/games' },
  { name: '03-games-new', path: '/games/new' },
  { name: '04-games-detail', path: `/games/${SAMPLE_GAME_ID}` },
  { name: '05-games-hole', path: `/games/${SAMPLE_GAME_ID}/3` },
  { name: '06-about', path: '/about' },
  { name: '07-about-roadmap', path: '/about/roadmap' },
  { name: '08-feedback', path: '/feedback' },
]

async function captureAll({ theme }) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    ...devices['Pixel 5'],
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  })

  const page = await context.newPage()
  await mockApi(page)

  // Theme explizit setzen via localStorage, bevor die App bootet
  await page.addInitScript((mode) => {
    localStorage.setItem('theme', mode)
    localStorage.setItem('language', 'de')
    // Auto install-banner dismissen damit es keine Screenshots verdeckt
    localStorage.setItem('ug-install-dismissed', 'true')
    localStorage.setItem('GamesDetailView', 'ranking')
  }, theme)

  const results = []

  for (const target of PAGES) {
    const url = BASE_URL + target.path
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)

      const htmlClass = await page.locator('html').getAttribute('class')
      const hasDark = (htmlClass || '').includes('dark')

      // 1) Viewport-only Screenshot (das was der User initial sieht)
      const vp = resolve(OUT_DIR, `${target.name}-${theme}-viewport.png`)
      await page.screenshot({ path: vp, fullPage: false })

      // 2) Scroll zum Ende und nochmal Screenshot — zeigt, ob die
      //    Bottom-Nav / Action-Bar die letzten Inhalte verdeckt
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
      const vpHeight = await page.evaluate(() => window.innerHeight)
      if (scrollHeight > vpHeight + 40) {
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
        await page.waitForTimeout(250)
        const bot = resolve(OUT_DIR, `${target.name}-${theme}-bottom.png`)
        await page.screenshot({ path: bot, fullPage: false })
      }

      results.push({ name: target.name, theme, url, dark: hasDark, ok: true })
      console.log(`  ✓ ${target.name} (${theme}) — html.dark=${hasDark} — scrollable=${scrollHeight > vpHeight + 40}`)
    } catch (err) {
      results.push({ name: target.name, theme, url, ok: false, error: String(err) })
      console.log(`  ✗ ${target.name} (${theme}) — ${err.message}`)
    }
  }

  await context.close()
  await browser.close()
  return results
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  console.log('— Light-Mode Screenshots —')
  const light = await captureAll({ theme: 'light' })
  console.log('— Dark-Mode Screenshots —')
  const dark = await captureAll({ theme: 'dark' })

  const failures = [...light, ...dark].filter((r) => !r.ok)
  const darkModeAppliedCount = dark.filter((r) => r.dark).length
  console.log('\nZusammenfassung:')
  console.log(`  Erfolgreich: ${light.filter((r) => r.ok).length + dark.filter((r) => r.ok).length}/${light.length + dark.length}`)
  console.log(`  Dark-Klasse auf <html>: ${darkModeAppliedCount}/${dark.length}`)
  if (failures.length) {
    console.log(`  Fehler:`)
    for (const f of failures) console.log(`    - ${f.name} (${f.theme}): ${f.error}`)
    process.exit(1)
  }
  console.log(`\nScreenshots: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
