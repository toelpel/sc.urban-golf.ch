<template>
  <BackgroundImage />
  <router-view />
  <ToastContainer />
  <PWAUpdateDialog />
  <PWAInstallBanner />
</template>

<script setup lang="ts">
import BackgroundImage from '@/components/ui/BackgroundImage.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import PWAUpdateDialog from '@/components/pwa/PWAUpdateDialog.vue'
import PWAInstallBanner from '@/components/pwa/PWAInstallBanner.vue'
import { useNetworkStatus } from '@/composables/useNetworkStatus'

useNetworkStatus()
</script>
