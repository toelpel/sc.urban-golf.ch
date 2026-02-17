import { watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

export function useNetworkStatus() {
  const isOnline = useOnline()
  const { warning, success } = useToast()
  const { t } = useI18n()
  let initialized = false

  watch(isOnline, (online) => {
    // Ersten Aufruf überspringen (Initial-State, kein Wechsel)
    if (!initialized) {
      initialized = true
      return
    }
    if (online) {
      success(t('Network.BackOnline'), 3000)
    } else {
      warning(t('Network.Offline'), 0) // duration 0 = sticky bis dismissed
    }
  })

  return { isOnline }
}
