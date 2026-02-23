<template>
    <div class="min-h-screen flex flex-col text-gray-800 dark:text-white bg-white/40 dark:bg-gray-800/60">
        <a href="#main-content"
           class="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md">
          Skip to main content
        </a>
        <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <Header />
        </div>

        <main id="main-content" class="flex-1 overflow-y-auto w-[98%] max-w-6xl mx-auto px-4 py-3">
            <slot></slot>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>
