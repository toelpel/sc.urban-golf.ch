<template>
    <div v-if="games.length === 0 && !isLoading && showNoGamesTimeout"
        class="text-center text-gray-500 dark:text-gray-400">
        {{ $t('Games.ListGames.NoGamesFound') }}
    </div>

    <ul v-if="games.length === 0 && isLoading" class="space-y-2">
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

    <transition-group v-else name="game-list" tag="ul" class="space-y-2">
        <li v-for="game in games" :key="game.id"
            class="relative group glass-list glass-card--interactive rounded-2xl cursor-pointer"
            @click="navigateToGame(game.id)">
            <div class="card-inner">
                <div class="card-row relative flex items-center gap-3">
                    <div class="flex-1 min-w-0 flex flex-col z-10">
                        <div class="list-title truncate" :title="game.name">
                            {{ game.name }}
                        </div>
                        <div class="list-meta truncate" :title="playerMap[game.id]?.join(', ')">
                            {{ formatDateCH(game.created_at ?? '') }}
                            <span v-if="playerMap[game.id]"> – {{ getPlayerListShort(game.id) }}</span>
                        </div>
                    </div>

                    <button @click.stop="toggleDetails(game.id)" class="chevron-btn z-10 shrink-0"
                        :aria-expanded="expandedGameId === game.id" :aria-controls="`game-details-${game.id}`"
                        :aria-label="expandedGameId === game.id ? 'Collapse' : 'Expand'" title="Details">
                        <ChevronRightIcon class="w-5 h-5 transition-transform duration-200"
                            :class="expandedGameId === game.id ? 'rotate-90' : ''" />
                    </button>
                </div>

                <transition name="fade">
                    <div v-if="expandedGameId === game.id" :id="`game-details-${game.id}`"
                        class="card-body text-xs text-gray-700 dark:text-gray-300">
                        <div class="mb-1">
                            {{ $t('Games.ListGames.HolesPlayed') }}: {{ gameMeta[game.id]?.holes?.length || 0 }}
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                            <div v-for="player in gameMeta[game.id]?.players || []" :key="player.id" class="truncate"
                                :title="player.name">
                                {{ player.name }} – Ø {{ player.avg?.toFixed(2) ?? '–' }} – Σ {{ player.total }}
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </li>
    </transition-group>
    <div ref="target" class="h-8"></div>

    <ScrollToTopButton />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useGamesSummaryData } from '@/composables/useGamesSummaryData'
import { useInfiniteLoader } from '@/composables/useInfiniteLoader'
import { useRouter } from 'vue-router'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton.vue'
import { formatDateCH } from '@/utils/format'

const router = useRouter()
function navigateToGame(id: string) {
    router.push(`/games/${id}`)
}

const props = defineProps<{
    searchTerm?: string
    perPage?: number
}>()

const expandedGameId = ref<string | null>(null)
const showNoGamesTimeout = ref(false)
const target = ref<HTMLElement | null>(null)

const {
    games,
    playerMap,
    gameMeta,
    loadGames,
    reset,
    hasMore
} = useGamesSummaryData()

const { loadMore, isLoading } = useInfiniteLoader({
    loadFn: ({ reset: resetFirst = false } = {}) => loadMoreGames({ resetFirst }),
    target,
    hasMore,
})

onMounted(() => {
    loadMore({ resetFirst: true })
})

let noGamesTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
    if (noGamesTimer) clearTimeout(noGamesTimer)
    // useDebounceFn cleans up automatically when component unmounts
})

const debouncedSearch = useDebounceFn(async () => {
    showNoGamesTimeout.value = false
    await loadMoreGames({ resetFirst: true })

    noGamesTimer = setTimeout(() => {
        showNoGamesTimeout.value = true
    }, 10000)
}, 300)

watch(
    () => props.searchTerm,
    () => {
        if (noGamesTimer) clearTimeout(noGamesTimer)
        debouncedSearch()
    },
    { immediate: false }
)

async function loadMoreGames({ resetFirst = false } = {}) {
    if (resetFirst) {
        reset()
    }

    await loadGames({
        perPage: props.perPage ?? 10,
        search: props.searchTerm || '',
    })
}

function getPlayerListShort(gameId: string): string {
    const list = (playerMap.value[gameId] || []).join(', ')
    return list.length > 38 ? list.slice(0, 38) + '…' : list
}

function toggleDetails(id: string) {
    expandedGameId.value = expandedGameId.value === id ? null : id
}
</script>

<style scoped>
.game-list-move {
    transition: transform 0.3s ease;
}
</style>
