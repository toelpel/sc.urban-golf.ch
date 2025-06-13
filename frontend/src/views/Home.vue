<template>
  <div class="text-center mt-10">
    <h1 class="text-3xl font-bold mb-4">Willkommen bei Urban Golf Scorecard</h1>
    <p class="mb-6 text-gray-700 dark:text-gray-300">
      Erstelle ein neues Spiel oder sieh dir bestehende Spiele an.
    </p>
    <div class="flex flex-col items-stretch gap-3 mt-6">
      <router-link
        to="/new-game"
        class="button-primary w-full text-center"
      >
        🆕 Neues Spiel
      </router-link>
      <router-link
        to="/list-games"
        class="button-primary w-full text-center"
      >
        📋 Spiele
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>