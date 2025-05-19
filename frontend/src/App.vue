<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <nav class="bg-white border-b p-4 shadow-sm">
      <div class="max-w-6xl mx-auto flex justify-between">
        <router-link to="/" class="font-bold text-xl text-green-700">Urban Golf</router-link>
        <div class="space-x-4">
          <router-link to="/new-game" class="hover:underline">Neues Spiel</router-link>
        </div>
      </div>
    </nav>
    <router-view class="mt-8" />
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>