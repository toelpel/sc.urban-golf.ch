<template>
    <h2 class="maintitle mb-4">{{ $t('Games.ListGames.AllGames') }}</h2>

    <div class="relative mb-4">
        <input type="text" v-model="searchTerm" :placeholder="`🔍 ${$t('Games.ListGames.SearchText')}`"
            class="input-field w-full pr-10" />
        <button v-if="searchTerm" @click="searchTerm = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
    </div>

    <Suspense>
        <template #default>
            <GameListContent :search-term="searchTerm" :current-page="currentPage" :per-page="perPage"
                @update:currentPage="(val) => currentPage = val" />
        </template>
        <template #fallback>
            <div class="text-center text-gray-400 py-10">⏳ {{ $t('Games.ListGames.Loading') }}</div>
        </template>
    </Suspense>
</template>

<script setup>
import { ref } from 'vue';
import GameListContent from './GamesListCompactContent.vue';

const currentPage = ref(1);
const perPage = 4;
const searchTerm = ref('');

</script>