<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <nav class="bg-white border-b p-4 shadow-sm relative z-50">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <router-link to="/" class="font-bold text-xl text-green-700">
          Urban Golf
        </router-link>

        <!-- Desktop-Navigation -->
        <div class="space-x-4 hidden md:flex">
          <router-link to="/new-game" class="hover:underline">🆕 Neues Spiel</router-link>
          <router-link to="/list-games" class="hover:underline">📋 Spiele</router-link>
        </div>

        <!-- Mobile Hamburger -->
        <div class="md:hidden relative" ref="menuWrapper">
          <button @click="isOpen = !isOpen" class="focus:outline-none">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <!-- Dropdown-Menü mit Transition -->
          <transition name="fade-slide">
            <div
              v-if="isOpen"
              class="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50 text-sm"
            >
              <router-link
                to="/new-game"
                class="block px-4 py-2 hover:bg-gray-100"
                @click="isOpen = false"
              >
                🆕 Neues Spiel
              </router-link>
              <router-link
                to="/list-games"
                class="block px-4 py-2 hover:bg-gray-100"
                @click="isOpen = false"
              >
                📋 Spiele
              </router-link>
            </div>
          </transition>
        </div>
      </div>
    </nav>

    <router-view class="mt-8" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isOpen = ref(false);
const menuWrapper = ref(null);

function handleClickOutside(event) {
  if (menuWrapper.value && !menuWrapper.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
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
