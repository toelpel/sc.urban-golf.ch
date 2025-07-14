<template>
  <BackgroundImage />
  <router-view :key="$route.fullPath" />
</template>

<script setup>
import BackgroundImage from './components/BackgroundImage.vue'
</script>