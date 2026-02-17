<template>
    <div v-if="games.length === 0 && !loading && showNoGamesTimeout"
        class="text-center text-gray-500 dark:text-gray-400">
        {{ $t('Games.ListGames.NoGamesFound') }}
    </div>

    <!-- Skeleton Loader separat -->
    <ul v-if="games.length === 0 && loading" class="space-y-2">
        <li v-for="n in props.perPage" :key="'skeleton-' + n"
            class="animate-pulse glass-card rounded-2xl px-4 py-3 isolate will-change-backdrop">
            <div class="flex justify-between items-center">
                <div class="space-y-1 w-full">
                    <div class="h-4 bg-white/30 dark:bg-white/20 rounded w-1/2"></div>
                    <div class="h-3 bg-white/20 dark:bg-white/10 rounded w-3/4"></div>
                </div>
                <div class="h-7 w-7 bg-white/20 dark:bg-white/10 rounded-full"></div>
            </div>
        </li>
    </ul>

    <!-- Spiele-Liste -->
    <transition-group v-else name="game-list" tag="ul" class="space-y-2">
        <li v-for="game in games" :key="game.id"
            class="relative group glass-list glass-card--interactive rounded-2xl cursor-pointer"
            @click="navigateToGame(game.id)">
            <div class="card-inner">
                <!-- Header -->
                <div class="card-row relative flex items-center gap-3">
                    <!-- Textbereich -->
                    <div class="flex-1 min-w-0 flex flex-col z-10">
                        <div class="list-title truncate" :title="game.name">
                            {{ game.name }}
                        </div>
                        <div class="list-meta truncate" :title="playerMap[game.id]?.join(', ')">
                            {{ formatDate(game.created_at) }}
                            <span v-if="playerMap[game.id]"> – {{ getPlayerListShort(game.id) }}</span>
                        </div>
                    </div>

                    <!-- Chevron immer volle Größe, nicht schrumpfen -->
                    <button @click.stop="toggleDetails(game.id)" class="chevron-btn z-10 shrink-0"
                        :aria-expanded="expandedGameId === game.id" :aria-controls="`game-details-${game.id}`"
                        :aria-label="expandedGameId === game.id ? 'Collapse' : 'Expand'" title="Details">
                        <ChevronRightIcon class="w-5 h-5 transition-transform duration-200"
                            :class="expandedGameId === game.id ? 'rotate-90' : ''" />
                    </button>
                </div>

                <!-- Body -->
                <transition name="fade">
                    <div v-if="expandedGameId === game.id" :id="`game-details-${game.id}`"
                        class="card-body text-xs text-gray-700 dark:text-gray-300">
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
            </div>
        </li>
    </transition-group>
    <!-- Beobachtungspunkt für Infinite Scroll -->
    <div ref="target" class="h-8"></div>

    <!-- Scroll To Top Button -->
    <transition name="fade">
        <button v-if="showScrollToTop" @click="scrollToTop"
            class="fixed bottom-6 right-6 z-50 p-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition">
            <ArrowUpIcon class="h-5 w-5" />
        </button>
    </transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useDebounceFn } from '@vueuse/core'
import { useGamesSummaryData } from '@/composables/useGamesSummaryData';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader'
import { useScrollToTopButton } from '@/composables/useScrollToTopButton.js'
import { useRouter } from 'vue-router';
import { ArrowUpIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'

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
const showNoGamesTimeout = ref(false);
const target = ref(null)
const loading = ref(false)
const { showScrollToTop, scrollToTop } = useScrollToTopButton()

const {
    games,
    playerMap,
    gameMeta,
    loadGames,
    reset,
    hasMore
} = useGamesSummaryData();

const { loadMore } = useInfiniteLoader({
    loadFn: ({ reset = false } = {}) => loadMoreGames({ resetFirst: reset }),
    target,
    hasMore,
    isLoading: loading,
})

onMounted(() => {
    loadMore({ reset: true })
});

onUnmounted(() => {
    clearTimeout(noGamesTimer);
    debouncedSearch.cancel?.();
});

let noGamesTimer = null;

const debouncedSearch = useDebounceFn(async () => {
    showNoGamesTimeout.value = false;
    await loadMoreGames({ resetFirst: true });

    noGamesTimer = setTimeout(() => {
        showNoGamesTimeout.value = true;
    }, 10000);
}, 300);

watch(
    () => props.searchTerm,
    () => {
        clearTimeout(noGamesTimer);
        debouncedSearch();
    },
    { immediate: false }
);

async function loadMoreGames({ resetFirst = false } = {}) {
    if (resetFirst) {
        reset();
    }

    await loadGames({
        perPage: props.perPage,
        search: props.searchTerm || '',
    });
}

const formatDate = (ts) =>
    new Date(ts).toLocaleString('de-CH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

function getPlayerListShort(gameId) {
    const list = (playerMap.value[gameId] || []).join(', ');
    return list.length > 38 ? list.slice(0, 38) + '…' : list;
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