import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'

const mockIsOnline = ref(true)
vi.mock('@vueuse/core', () => ({
  useOnline: () => mockIsOnline,
}))

const mockWarning = vi.fn()
const mockSuccess = vi.fn()
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    warning: mockWarning,
    success: mockSuccess,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

import { useNetworkStatus } from '../useNetworkStatus'

describe('useNetworkStatus', () => {
  beforeEach(() => {
    mockIsOnline.value = true
    mockWarning.mockClear()
    mockSuccess.mockClear()
  })

  it('returns the online status', () => {
    const { isOnline } = useNetworkStatus()
    expect(isOnline.value).toBe(true)
  })

  it('skips the first watch trigger (initial state)', async () => {
    useNetworkStatus()
    mockIsOnline.value = false
    await nextTick()

    // First change is skipped (initialization guard)
    expect(mockWarning).not.toHaveBeenCalled()
  })

  it('shows warning toast when going offline after initialization', async () => {
    useNetworkStatus()

    // First change: initialization
    mockIsOnline.value = false
    await nextTick()

    // Second change: real offline event
    mockIsOnline.value = true
    await nextTick()
    mockIsOnline.value = false
    await nextTick()

    expect(mockWarning).toHaveBeenCalledWith('Network.Offline', 0)
  })

  it('shows success toast when coming back online after initialization', async () => {
    useNetworkStatus()

    // First change: initialization
    mockIsOnline.value = false
    await nextTick()

    // Second change: back online
    mockIsOnline.value = true
    await nextTick()

    expect(mockSuccess).toHaveBeenCalledWith('Network.BackOnline', 3000)
  })
})
