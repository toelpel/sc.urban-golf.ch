import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '../useToast'

describe('useToast', () => {
  beforeEach(() => {
    const { toasts, dismiss } = useToast()
    // Clear all toasts
    toasts.value.forEach(t => dismiss(t.id))
  })

  it('show() adds a toast', () => {
    const { show, toasts } = useToast()
    show('Test message', 'info', 0)
    expect(toasts.value.length).toBeGreaterThanOrEqual(1)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.message).toBe('Test message')
    expect(last.type).toBe('info')
  })

  it('dismiss() removes a toast by id', () => {
    const { show, dismiss, toasts } = useToast()
    show('To remove', 'info', 0)
    const id = toasts.value[toasts.value.length - 1].id
    dismiss(id)
    expect(toasts.value.find(t => t.id === id)).toBeUndefined()
  })

  it('success() sets type to success', () => {
    const { success, toasts } = useToast()
    success('Done!', 0)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.type).toBe('success')
  })

  it('error() sets type to error with 6s default', () => {
    const { error, toasts } = useToast()
    error('Failed!', 0)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.type).toBe('error')
  })

  it('warning() sets type to warning', () => {
    const { warning, toasts } = useToast()
    warning('Careful!', 0)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.type).toBe('warning')
  })

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers()
    const { show, toasts } = useToast()
    show('Auto dismiss', 'info', 1000)
    const id = toasts.value[toasts.value.length - 1].id
    expect(toasts.value.find(t => t.id === id)).toBeDefined()
    vi.advanceTimersByTime(1100)
    expect(toasts.value.find(t => t.id === id)).toBeUndefined()
    vi.useRealTimers()
  })
})
