<template>
    <div class="relative w-full overflow-x-auto max-h-[calc(100dvh-11rem)] overflow-y-auto">
        <div class="glass-card p-0 inline-block min-w-full">
            <table class="scorecard-table min-w-[42rem] w-full border-collapse"
                :class="{ 'scorecard-compact': players.length >= 5 }">
                <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                    <tr>
                        <th class="scorecard-header-cell cursor-pointer first:rounded-tl-2xl"
                            :class="{ 'scorecard-sort-active-header': sortColumn === 'name' }"
                            @click="$emit('sort', 'name')">
                            {{ $t('General.Player') }}
                            <ChevronUpIcon v-if="sortColumn === 'name' && sortDirection === 'asc'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                            <ChevronDownIcon v-else-if="sortColumn === 'name'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                        </th>

                        <th v-for="hole in holes" :key="hole"
                            class="scorecard-header-cell text-center border-l border-white/30 dark:border-white/10">
                            <router-link :to="'/games/' + gameId + '/' + hole"
                                class="hover:underline text-blue-600 dark:text-blue-400">
                                {{ hole }}
                            </router-link>
                        </th>

                        <th class="scorecard-header-cell cursor-pointer w-14 border-l border-white/30 dark:border-white/10"
                            :class="{ 'scorecard-sort-active-header': sortColumn === 'average' }"
                            @click="$emit('sort', 'average')">
                            Ø
                            <ChevronUpIcon v-if="sortColumn === 'average' && sortDirection === 'asc'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                            <ChevronDownIcon v-else-if="sortColumn === 'average'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                        </th>
                        <th class="scorecard-header-cell cursor-pointer w-16 border-l border-white/30 dark:border-white/10 last:rounded-tr-2xl"
                            :class="{ 'scorecard-sort-active-header': sortColumn === 'total' }"
                            @click="$emit('sort', 'total')">
                            {{ $t('General.Total') }}
                            <ChevronUpIcon v-if="sortColumn === 'total' && sortDirection === 'asc'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                            <ChevronDownIcon v-else-if="sortColumn === 'total'"
                                class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="player in sortedPlayers" :key="player.id"
                        class="hover:bg-white/30 dark:hover:bg-gray-800/30 transition">
                        <td class="scorecard-player-cell font-medium border-l-3"
                            :class="[
                                colorMap[player.id]?.border ?? '',
                                { 'scorecard-sort-active': sortColumn === 'name' }
                            ]">
                            <span class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full shrink-0"
                                    :class="colorMap[player.id]?.dot ?? ''"></span>
                                {{ player.name }}
                            </span>
                        </td>

                        <td v-for="hole in holes" :key="hole"
                            class="scorecard-cell text-center"
                            :class="getHeatmapClass(player.id, hole)">
                            {{ scores[player.id]?.[hole] ?? '–' }}
                        </td>

                        <td class="scorecard-metric-cell w-14 text-center scorecard-metric-highlight"
                            :class="{ 'scorecard-sort-active': sortColumn === 'average' }">
                            {{ averageScore(player.id) }}
                        </td>
                        <td class="scorecard-metric-cell w-16 text-center font-semibold scorecard-metric-highlight"
                            :class="{ 'scorecard-sort-active': sortColumn === 'total' }">
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

defineEmits<{
  sort: [column: 'name' | 'total' | 'average']
}>()

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

const { colorMap } = usePlayerColors(computed(() => props.players))

const playerIds = computed(() => props.players.map(p => p.id))

function getHeatmapClass(playerId: string, hole: number): string {
  return heatmapClass(playerId, hole, props.scores, playerIds.value)
}
</script>
