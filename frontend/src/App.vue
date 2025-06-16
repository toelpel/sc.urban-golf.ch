<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-white">
    <nav class="bg-white border-b p-4 shadow-sm relative z-50 dark:bg-gray-800 dark:text-white dark:border-gray-600">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <router-link to="/" class="font-bold text-xl text-green-700 dark:text-green-300">
          Urban Golf
        </router-link>

        <!-- Desktop-Navigation -->
        <div class="space-x-4 hidden md:flex items-center">
          <router-link to="/newgame" class="hover:underline">🆕 Neues Spiel</router-link>
          <router-link to="/listgames" class="hover:underline">📋 Spiele</router-link>
          <button @click="toggleDark" class="ml-4 text-xl">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>

        <!-- Mobile Burger -->
        <div class="md:hidden relative" ref="menuWrapper">
          <button @click="isOpen = !isOpen" class="focus:outline-none">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <transition name="fade-slide">
            <div
              v-if="isOpen"
              class="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <router-link
                to="/newgame"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="isOpen = false"
              >
                🆕 Neues Spiel
              </router-link>
              <router-link
                to="/listgames"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="isOpen = false"
              >
                📋 Spiele
              </router-link>
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="toggleDark"
              >
                {{ isDark ? '🌙 Darkmode' : '☀️ Lightmode' }}
              </button>
            </div>
          </transition>
        </div>
      </div>
    </nav>

    <main class="w-[98%] max-w-screen-lg mx-auto px-2">
      <router-view class="mt-8" />
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isOpen = ref(false);
const isDark = ref(false);
const menuWrapper = ref(null);

function toggleDark() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}

function handleClickOutside(event) {
  if (menuWrapper.value && !menuWrapper.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  const saved = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && systemPrefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
