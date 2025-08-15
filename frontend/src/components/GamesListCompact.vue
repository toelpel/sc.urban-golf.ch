<template>
    <h1 class="maintitle">{{ $t('Games.ListGames.AllGames') }}</h1>

    <!-- Search: Glass-Input mit Icon & Clear -->
    <div class="relative mb-4">
        <!-- Icon -->
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <!-- Heroicon: Magnifying Glass -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35m.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </span>

        <!-- Glass Input -->
        <input type="search" v-model="searchTerm" :placeholder="` ${$t('Games.ListGames.SearchText')}`"
            class="input-field input-compact w-full pl-10 pr-10" inputmode="search" autocomplete="off"
            aria-label="Search games" />

        <!-- Clear -->
        <button v-if="searchTerm" @click="searchTerm = ''" class="absolute right-2 top-1/2 -translate-y-1/2 px-2 h-8 rounded-full
             bg-white/40 hover:bg-white/50 ring-1 ring-white/60
             text-gray-700 dark:text-gray-200 transition" aria-label="Clear search" type="button">
            ✕
        </button>
    </div>

    <Suspense>
        <template #default>
            <GamesListCompactContent :search-term="searchTerm" :current-page="currentPage" :per-page="perPage"
                @update:currentPage="(val) => currentPage = val" />
        </template>
        <template #fallback>
            <div class="text-center text-gray-400 py-10">
                ⏳ {{ $t('Games.ListGames.Loading') }}
            </div>
        </template>
    </Suspense>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GamesListCompactContent from './GamesListCompactContent.vue';

function calculatePerPage() {
    const skeleton = document.querySelector('.game-preview-skeleton');
    const itemHeight = skeleton?.offsetHeight || 70;
    const availableHeight = window.innerHeight - 320;
    return Math.max(5, Math.floor(availableHeight / itemHeight));
}

const currentPage = ref(1);
const searchTerm = ref('');
const perPage = ref(calculatePerPage());

onMounted(() => {
    window.addEventListener('resize', () => {
        perPage.value = calculatePerPage();
    });
});
</script>