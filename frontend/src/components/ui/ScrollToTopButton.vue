<template>
  <transition name="fade">
    <button v-if="showScrollToTop" @click="scrollToTop"
      class="fixed bottom-6 right-6 z-50 p-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition">
      <ArrowUpIcon class="h-5 w-5" />
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ArrowUpIcon } from '@heroicons/vue/24/outline'
import { useScrollToTopButton } from '@/composables/useScrollToTopButton'

const { showScrollToTop, scrollToTop } = useScrollToTopButton()
</script>
