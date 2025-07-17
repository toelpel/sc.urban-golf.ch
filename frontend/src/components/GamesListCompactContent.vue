<template>
    <div v-if="games.length === 0 && !isLoading && showNoGamesTimeout"
        class="text-center text-gray-500 dark:text-gray-400">
        {{ $t('ListGames-NoGamesFound') }}
    </div>

    <ul class="space-y-2">
        <!-- Existing game items -->
        <li v-for="game in games" :key="game.id"
            class="bg-white/80 dark:bg-gray-900/80 shadow-md rounded-2xl px-5 py-4 transition-transform transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
                <div class="flex flex-col min-w-0">
                    <div class="font-medium text-lg text-gray-800 dark:text-white truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[70vw] sm:max-w-[30ch]"
                        :title="game.name">{{ game.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
                        :title="playerMap[game.id]?.join(', ')">
                        {{ formatDate(game.created_at) }}
                        <span v-if="playerMap[game.id]"> – {{ getPlayerListShort(game.id) }}</span>
                    </div>
                </div>
                <div class="flex gap-3 items-center flex-shrink-0">
                    <router-link :to="`/games/${game.id}`" class="button-primary text-sm">📋</router-link>
                    <button @click="toggleDetails(game.id)"
                        class="text-xl text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        {{ expandedGameId === game.id ? '▾' : '▸' }}
                    </button>
                </div>
            </div>

            <transition name="fade">
                <div v-if="expandedGameId === game.id"
                    class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
                    <div class="mb-2">
                        🕳️ {{ $t('ListGames-HolesPlayed') }}: {{ gameMeta[game.id]?.holes?.length || 0 }}
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                        <div v-for="player in gameMeta[game.id]?.players || []" :key="player.id" class="truncate"
                            :title="player.name">
                            {{ player.name }} – Ø {{ player.avg.toFixed(2) }} – Σ {{ player.total }}
                        </div>
                    </div>
                </div>
            </transition>
        </li>

        <!-- Skeleton loaders angepasst an perPage -->
        <li v-for="n in props.perPage" :key="'skeleton-' + n" v-if="isLoading"
            class="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-2xl px-5 py-4 border border-gray-300 dark:border-gray-600">
            <div class="flex justify-between items-center">
                <div class="space-y-2 w-full">
                    <div class="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
                <div class="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
        </li>
    </ul>

    <div v-if="hasMore && !isLoading && games.length > 0" class="mt-6 text-center">
        <button @click="loadMoreGames" class="button-primary">
            {{ $t('ListGames-LoadMore') || 'Mehr laden' }}
        </button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { useGameMetaData } from '@/composables/useGameMetaData';

const props = defineProps({
    searchTerm: String,
    perPage: {
        type: Number,
        default: 10,
    },
});

const games = ref([]);
const totalGames = ref(0);
const page = ref(1);
const playerMap = ref({});
const gameMeta = ref({});
const expandedGameId = ref(null);
const hasMore = ref(true);
const isLoading = ref(true);
const showNoGamesTimeout = ref(false);

let debounceTimer = null;
let noGamesTimer = null;

watch(
    () => props.searchTerm,
    (newTerm) => {
        clearTimeout(debounceTimer);
        clearTimeout(noGamesTimer);

        debounceTimer = setTimeout(async () => {
            games.value = [];
            playerMap.value = {};
            gameMeta.value = {};
            page.value = 1;
            hasMore.value = true;
            isLoading.value = true;
            showNoGamesTimeout.value = false;

            noGamesTimer = setTimeout(() => {
                showNoGamesTimeout.value = true;
            }, 10000); // 10 Sekunden Timeout

            await loadMoreGames();
        }, 300);
    },
    { immediate: true }
);

async function loadMoreGames() {
    isLoading.value = true;

    const params = {
        page: page.value,
        per_page: props.perPage,
        search: props.searchTerm || undefined,
    };
    const { data } = await axios.get('/games', { params });

    if (data.games.length === 0) {
        hasMore.value = false;
        isLoading.value = false;
        return;
    }

    for (const game of data.games) {
        const { data: players } = await axios.get(`/games/${game.id}/players`);
        playerMap.value[game.id] = players.map(p => p.name);
        const meta = await useGameMetaData(game.id);
        gameMeta.value[game.id] = {
            holes: meta.holes,
            players: meta.players
        };
    }

    games.value.push(...data.games);
    totalGames.value = data.total;
    page.value++;

    if (games.value.length >= totalGames.value) {
        hasMore.value = false;
    }

    isLoading.value = false;
}

function formatDate(ts) {
    return new Date(ts).toLocaleString('de-CH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function getPlayerListShort(gameId) {
    const list = (playerMap.value[gameId] || []).join(', ');
    return list.length > 40 ? list.slice(0, 40) + '…' : list;
}

function toggleDetails(id) {
    expandedGameId.value = expandedGameId.value === id ? null : id;
}
</script>