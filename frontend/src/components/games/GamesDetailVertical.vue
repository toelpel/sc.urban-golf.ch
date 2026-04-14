<template>
    <div class="max-h-[calc(100dvh-11rem)] overflow-y-auto overflow-x-auto">
        <div class="glass-card p-0 overflow-hidden inline-block min-w-full">
            <table class="scorecard-table w-full min-w-max border-collapse"
                :class="{ 'scorecard-compact': players.length >= 5 }">
                <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                    <tr>
                        <th class="scorecard-header-cell text-left first:rounded-tl-2xl">
                            {{ $t('General.Hole') }}
                        </th>

                        <th v-for="player in sortedPlayers" :key="player.id"
                            class="scorecard-header-cell text-center max-w-40 truncate
                            first:border-l-0 border-l border-white/30 dark:border-white/10
                            last:rounded-tr-2xl"
                            :title="player.name">
                            <span class="flex items-center justify-center gap-1.5">
                                <span class="w-2 h-2 rounded-full shrink-0"
                                    :class="colorMap[player.id]?.dot ?? ''"></span>
                                <span class="truncate">{{ player.name }}</span>
                            </span>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="hole in holes" :key="hole"
                        class="hover:bg-white/30 dark:hover:bg-gray-800/30 transition">
                        <td class="scorecard-cell text-left font-semibold">
                            <router-link :to="'/games/' + gameId + '/' + hole"
                                class="text-blue-600 dark:text-blue-400 hover:underline">
                                {{ hole }}
                            </router-link>
                        </td>

                        <td v-for="player in sortedPlayers" :key="player.id"
                            class="scorecard-cell max-w-40 truncate text-center"
                            :class="getHeatmapClass(player.id, hole)">
                            {{ scores[player.id]?.[hole] ?? '–' }}
                        </td>
                    </tr>

                    <!-- Ø row -->
                    <tr class="cursor-pointer hover:bg-white/30 dark:hover:bg-gray-800/30 transition scorecard-metric-highlight"
                        :class="{ 'scorecard-sort-active': sortColumn === 'average' }"
                        :aria-label="$t('Scorecard.SortByAverage')"
                        tabindex="0" @click="$emit('sort', 'average')"
                        @keydown.enter.prevent="$emit('sort', 'average')"
                        @keydown.space.prevent="$emit('sort', 'average')">
                        <td class="scorecard-cell text-left font-semibold"
                            :class="{ 'scorecard-sort-active-header': sortColumn === 'average' }">
                            Ø
                            <ChevronUpIcon v-if="sortColumn === 'average' && sortDirection === 'asc'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" aria-hidden="true" />
                            <ChevronDownIcon v-else-if="sortColumn === 'average'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" aria-hidden="true" />
                        </td>
                        <td v-for="player in sortedPlayers" :key="player.id"
                            class="scorecard-cell text-center font-medium">
                            {{ averageScore(player.id) }}
                        </td>
                    </tr>

                    <!-- Total row -->
                    <tr class="cursor-pointer hover:bg-white/40 dark:hover:bg-gray-800/40 transition scorecard-metric-highlight"
                        :class="{ 'scorecard-sort-active': sortColumn === 'total' }"
                        :aria-label="$t('Scorecard.SortByTotal')"
                        tabindex="0" @click="$emit('sort', 'total')"
                        @keydown.enter.prevent="$emit('sort', 'total')"
                        @keydown.space.prevent="$emit('sort', 'total')">
                        <td class="scorecard-cell text-left font-semibold"
                            :class="{ 'scorecard-sort-active-header': sortColumn === 'total' }">
                            {{ $t('General.Total') }}
                            <ChevronUpIcon v-if="sortColumn === 'total' && sortDirection === 'asc'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" aria-hidden="true" />
                            <ChevronDownIcon v-else-if="sortColumn === 'total'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" aria-hidden="true" />
                        </td>
                        <td v-for="player in sortedPlayers" :key="player.id"
                            class="scorecard-cell text-center font-semibold">
                            {{ totalScore(player.id) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/16/solid'
import type { Player } from '@/services/api'
import type { ScoreMap } from '@/types'
import { usePlayerColors } from '@/composables/usePlayerColors'
import { heatmapClass } from '@/utils/scoreHeatmap'

const props = defineProps<{
    players: Player[]
    holes: number[]
    scores: ScoreMap
    gameId: string
    sortColumn: string
    sortDirection: string
    sortedPlayers: Player[]
    averageScore: (playerId: string) => string
    totalScore: (playerId: string) => number
}>()

defineEmits<{
  sort: [column: 'name' | 'total' | 'average']
}>()

const { colorMap } = usePlayerColors(computed(() => props.players))

const playerIds = computed(() => props.players.map(p => p.id))

function getHeatmapClass(playerId: string, hole: number): string {
  return heatmapClass(playerId, hole, props.scores, playerIds.value)
}
</script>
