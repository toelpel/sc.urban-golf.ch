<template>
  <BackgroundImage />
  <router-view :key="$route.fullPath" />
  <ToastContainer />
  <PWAUpdateDialog />
  <PWAInstallBanner />
</template>

<script setup>
import BackgroundImage from './components/BackgroundImage.vue'
import ToastContainer from './components/ToastContainer.vue'
import PWAUpdateDialog from './components/PWAUpdateDialog.vue'
import PWAInstallBanner from './components/PWAInstallBanner.vue'
import { useNetworkStatus } from './composables/useNetworkStatus'

// Netzwerk-Status-Monitoring für die gesamte App-Lifetime initialisieren
useNetworkStatus()
</script>
