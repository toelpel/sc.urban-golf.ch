import { test, expect } from '../fixtures'

const GAME_ID = 'e2e_game_existing1'

test.describe('Offline Sync', () => {
  test('queues score changes while offline and syncs on reconnect', async ({
    holeViewPage,
    page,
  }) => {
    // Step 1: Navigate to hole view while online
    await holeViewPage.goto(GAME_ID, 1)

    // Step 2: Set a known value while online to establish baseline
    await holeViewPage.setStrokesViaSelect('Alice', 4)
    // Wait for the API call to complete
    await page.waitForTimeout(500)

    // Step 3: Go offline
    await page.context().setOffline(true)

    // Step 4: Change score while offline
    await holeViewPage.setStrokesViaSelect('Alice', 7)

    // Verify the UI updated optimistically
    const offlineScore = await holeViewPage.getStrokesForPlayer('Alice')
    expect(Number(offlineScore)).toBe(7)

    // Step 5: Verify the offline toast / sync queue is populated
    const queueLength = await page.evaluate(() => {
      const raw = localStorage.getItem('ug-sync-queue')
      if (!raw) return 0
      try {
        return JSON.parse(raw).length
      } catch {
        return 0
      }
    })
    expect(queueLength).toBeGreaterThan(0)

    // Step 6: Go back online
    await page.context().setOffline(false)

    // Step 7: Wait for sync to happen (flushQueue triggers on online event)
    await page.waitForTimeout(2000)

    // Step 8: Verify the queue is empty after sync
    const queueAfterSync = await page.evaluate(() => {
      const raw = localStorage.getItem('ug-sync-queue')
      if (!raw) return 0
      try {
        return JSON.parse(raw).length
      } catch {
        return 0
      }
    })
    expect(queueAfterSync).toBe(0)

    // Step 9: Reload to verify score was persisted server-side
    await holeViewPage.goto(GAME_ID, 1)
    const persistedScore = await holeViewPage.getStrokesForPlayer('Alice')
    expect(Number(persistedScore)).toBe(7)
  })
})
