import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Reset module state between tests by re-importing
let usePWAUpdate: typeof import('../usePWAUpdate')['usePWAUpdate']

describe('usePWAUpdate', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()
    const mod = await import('../usePWAUpdate')
    usePWAUpdate = mod.usePWAUpdate
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with dialog hidden', () => {
    const { showUpdateDialog } = usePWAUpdate()
    expect(showUpdateDialog.value).toBe(false)
  })

  it('onNeedRefresh() shows the update dialog', () => {
    const { onNeedRefresh, showUpdateDialog } = usePWAUpdate()
    const mockUpdateFn = vi.fn()

    onNeedRefresh(mockUpdateFn)

    expect(showUpdateDialog.value).toBe(true)
  })

  it('onNeedRefresh() auto-hides after 20 seconds', () => {
    const { onNeedRefresh, showUpdateDialog } = usePWAUpdate()
    onNeedRefresh(vi.fn())

    expect(showUpdateDialog.value).toBe(true)

    vi.advanceTimersByTime(20_000)

    expect(showUpdateDialog.value).toBe(false)
  })

  it('applyUpdate() hides dialog and calls updateSW(true)', async () => {
    const mockUpdateFn = vi.fn().mockResolvedValue(undefined)
    const { onNeedRefresh, applyUpdate, showUpdateDialog } = usePWAUpdate()

    onNeedRefresh(mockUpdateFn)
    await applyUpdate()

    expect(showUpdateDialog.value).toBe(false)
    expect(mockUpdateFn).toHaveBeenCalledWith(true)
  })

  it('dismissUpdate() hides dialog without calling updateSW', () => {
    const mockUpdateFn = vi.fn()
    const { onNeedRefresh, dismissUpdate, showUpdateDialog } = usePWAUpdate()

    onNeedRefresh(mockUpdateFn)
    dismissUpdate()

    expect(showUpdateDialog.value).toBe(false)
    expect(mockUpdateFn).not.toHaveBeenCalled()
  })

  it('shares state across multiple calls (singleton)', () => {
    const { onNeedRefresh } = usePWAUpdate()
    onNeedRefresh(vi.fn())

    const { showUpdateDialog } = usePWAUpdate()
    expect(showUpdateDialog.value).toBe(true)
  })
})
