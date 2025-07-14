<template>
    <div class="min-h-screen flex flex-col text-gray-800 dark:text-white bg-white/40 dark:bg-gray-800/60">
        <!-- Header: volle Breite, sticky -->
        <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <Header />
        </div>

        <!-- Hauptinhalt zentriert (95%) -->
        <main class="flex-1 overflow-y-auto w-[95%] max-w-6xl mx-auto px-4 py-3">
            <slot />
        </main>

        <!-- Footer: volle Breite -->
        <Footer />
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>