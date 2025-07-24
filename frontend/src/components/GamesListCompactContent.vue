<template>
    <div v-if="games.length === 0 && !isLoading && showNoGamesTimeout"
        class="text-center text-gray-500 dark:text-gray-400">
        {{ $t('Games.ListGames.NoGamesFound') }}
    </div>

    <transition-group name="game-list" tag="ul" class="space-y-2">
        <li v-for="game in games" :key="game.id"
            class="relative group bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
            @click="navigateToGame(game.id)">
            <div class="flex justify-between items-center px-4 py-3 relative z-10">
                <div class="flex flex-col min-w-0">
                    <div class="font-semibold text-base text-gray-900 dark:text-white truncate" :title="game.name">
                        {{ game.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate"
                        :title="playerMap[game.id]?.join(', ')">
                        {{ formatDate(game.created_at) }}
                        <span v-if="playerMap[game.id]"> – {{ getPlayerListShort(game.id) }}</span>
                    </div>
                </div>

                <button @click.stop="toggleDetails(game.id)"
                    class="z-10 relative flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {{ expandedGameId === game.id ? '▾' : '▸' }}
                </button>
            </div>

            <transition name="fade">
                <div v-if="expandedGameId === game.id"
                    class="px-4 pb-3 pt-1 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300">
                    <div class="mb-1">
                        {{ $t('Games.ListGames.HolesPlayed') }}: {{ gameMeta[game.id]?.holes?.length || 0 }}
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

        <!-- Skeleton Loader -->
        <li v-for="n in props.perPage" :key="'skeleton-' + n" v-if="isLoading"
            class="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-300 dark:border-gray-600">
            <div class="flex justify-between items-center">
                <div class="space-y-1 w-full">
                    <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
                <div class="h-7 w-7 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
        </li>
    </transition-group>

    <div v-if="hasMore && !isLoading && games.length > 0" class="mt-4 text-center">
        <button @click="loadMoreGames" class="button-primary w-full text-center">
            {{ $t('Games.ListGames.LoadMore') }}
        </button>
    </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useGamesSummaryData } from '@/composables/useGamesSummaryData.js';
import { useRouter } from 'vue-router';

onUnmounted(() => {
    clearTimeout(debounceTimer);
    clearTimeout(noGamesTimer);
});

const router = useRouter();
function navigateToGame(id) {
    router.push(`/games/${id}`);
}

const props = defineProps({
    searchTerm: String,
    perPage: {
        type: Number,
        default: 10,
    },
});

const expandedGameId = ref(null);
const hasMore = ref(true);
const isLoading = ref(true);
const showNoGamesTimeout = ref(false);
const page = ref(1);

const {
    games,
    playerMap,
    gameMeta,
    totalGames,
    loadGames,
    reset,
} = useGamesSummaryData();

let debounceTimer = null;
let noGamesTimer = null;

watch(
    () => props.searchTerm,
    () => {
        clearTimeout(debounceTimer);
        clearTimeout(noGamesTimer);

        debounceTimer = setTimeout(async () => {
            reset();
            page.value = 1;
            hasMore.value = true;
            isLoading.value = true;
            showNoGamesTimeout.value = false;

            noGamesTimer = setTimeout(() => {
                showNoGamesTimeout.value = true;
            }, 10000);

            await loadMoreGames();
        }, 300);
    },
    { immediate: true }
);

async function loadMoreGames() {
    isLoading.value = true;

    await loadGames({
        page: page.value,
        perPage: props.perPage,
        search: props.searchTerm || '',
    });

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

<style scoped>
.game-list-move {
    transition: transform 0.3s ease;
}
</style>