<template>
  <BackgroundImage />
  <router-view :key="$route.fullPath" />
  <ToastContainer />
</template>

<script setup>
import BackgroundImage from './components/BackgroundImage.vue'
import ToastContainer from './components/ToastContainer.vue'
</script>