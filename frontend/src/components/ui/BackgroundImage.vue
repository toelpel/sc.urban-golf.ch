<template>
  <div
    class="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
    :style="`background-image: url('${background}')`"
  ></div>
</template>

<script setup lang="ts">
import background from '@/assets/bg.webp'
</script>