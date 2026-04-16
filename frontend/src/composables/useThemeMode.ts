import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

const isDark = ref<boolean>(false)
let initialized = false

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const saved = localStorage.getItem(STORAGE_KEY)
  const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = saved === 'dark' || (!saved && prefers)
  applyTheme(isDark.value)

  watch(isDark, (next) => {
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  })
}

export function useThemeMode() {
  initialize()
  function toggle() { isDark.value = !isDark.value }
  function set(dark: boolean) { isDark.value = dark }
  return { isDark, toggle, set }
}
