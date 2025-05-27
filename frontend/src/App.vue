<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div class="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <router-link to="/" class="text-2xl font-semibold text-green-700 hover:text-green-800">Urban Golf</router-link>
        <div class="space-x-4">
          <router-link to="/new-game" class="text-gray-700 hover:text-black">Neues Spiel</router-link>
        </div>
      </div>
    </nav>
    <main class="mt-8 px-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
