<template>
    <h1 class="maintitle">{{ $t('Games.ListGames.AllGames') }}</h1>

    <div class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
           text-gray-500 dark:text-gray-400 z-10" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35m.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </span>

        <input type="search" v-model="searchTerm" :placeholder="` ${$t('Games.ListGames.SearchText')}`"
            class="input-field input-compact w-full pl-10 pr-10 relative z-0" inputmode="search" autocomplete="off"
            aria-label="Search games" />

        <button v-if="searchTerm" @click="searchTerm = ''" class="absolute right-2 top-1/2 -translate-y-1/2 p-1
           text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100
           transition z-10" aria-label="Clear search" type="button">✕</button>
    </div>

    <Suspense>
        <template #default>
            <GamesListCompactContent :search-term="searchTerm" :per-page="perPage" />
        </template>
        <template #fallback>
            <div class="text-center text-gray-400 py-10">
                {{ $t('Games.ListGames.Loading') }}
            </div>
        </template>
    </Suspense>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GamesListCompactContent from '@/components/games/GamesListCompactContent.vue'

function calculatePerPage(): number {
    const skeleton = document.querySelector('.game-preview-skeleton')
    const itemHeight = (skeleton as HTMLElement)?.offsetHeight || 70
    const availableHeight = window.innerHeight - 320
    return Math.max(5, Math.floor(availableHeight / itemHeight))
}

const searchTerm = ref('')
const perPage = ref(calculatePerPage())

function handleResize() {
    perPage.value = calculatePerPage()
}

onMounted(() => {
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>
