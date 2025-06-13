<template>
  <div class="max-w-xl mx-auto p-8 text-center">
    <h1 class="text-3xl font-bold mb-6">Urban Golf ScoreCard</h1>
    <p class="mb-4 text-gray-600">Willkommen zur digitalen Scorekarte für Urban Golf Turniere.</p>

    <div class="space-y-4 mt-6">
      <router-link
        to="new-game"
        class="block w-full bg-gray-200 py-3 rounded-xl font-semibold"
      >
        Neues Spiel starten
      </router-link>

      <router-link
        to="list-games"
        class="block w-full bg-gray-200 py-3 rounded-xl font-semibold"
      >
        Spiel öffnen
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>