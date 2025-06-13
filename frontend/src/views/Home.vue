<template>
  <div class="text-center mt-10">
    <h1 class="text-3xl font-bold mb-4">Willkommen bei Urban Golf Scorecard</h1>
    <p class="mb-6 text-gray-700 dark:text-gray-300">
      Erstelle ein neues Spiel oder sieh dir bestehende Spiele an.
    </p>
    <div class="space-x-4">
      <router-link
        to="/new-game"
        class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 
               dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:bg-gray-0"
      >
        🆕 Neues Spiel
      </router-link>
      <router-link
        to="/list-games"
        class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 
               dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:bg-gray-0"
      >
        📋 Spiele
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>