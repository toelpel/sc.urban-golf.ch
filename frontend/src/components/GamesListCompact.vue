<template>
    <h1 class="maintitle">{{ $t('Games.ListGames.AllGames') }}</h1>

    <div class="relative mb-4">
        <input type="text" v-model="searchTerm" :placeholder="`🔍 ${$t('Games.ListGames.SearchText')}`"
            class="input-field w-full pr-10" />
        <button v-if="searchTerm" @click="searchTerm = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
    </div>

    <Suspense>
        <template #default>
            <GamesListCompactContent :search-term="searchTerm" :current-page="currentPage" :per-page="perPage"
                @update:currentPage="(val) => currentPage = val" />
        </template>
        <template #fallback>
            <div class="text-center text-gray-400 py-10">⏳ {{ $t('Games.ListGames.Loading') }}</div>
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