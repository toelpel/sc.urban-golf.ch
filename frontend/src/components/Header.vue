<template>
    <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur dark:bg-gray-800/70 border-b dark:border-gray-700">
        <div class="flex justify-between items-center px-4 py-2">
            <!-- Logo + Link -->
            <div class="flex items-center space-x-4">
                <img src="/icons/web-app-manifest-192x192.png" alt="ScoreCard" class="w-8 h-8" />
                <router-link to="/" class="font-bold text-xl text-green-700 dark:text-green-300">
                    ScoreCard
                </router-link>
            </div>
            <NavControls />
        </div>
    </nav>
</template>

<script setup>
import NavControls from './NavControls.vue'
</script>