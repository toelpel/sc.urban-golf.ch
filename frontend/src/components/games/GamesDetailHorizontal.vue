<template>
    <div class="relative w-full overflow-x-auto">
        <div class="glass-card p-0 inline-block min-w-full">
            <table class="scorecard-table min-w-[42rem] w-full border-collapse">
                <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                    <tr>
                        <th class="scorecard-header-cell cursor-pointer first:rounded-tl-2xl"
                            @click="$emit('sort', 'name')">
                            {{ $t('General.Player') }}
                            <span v-if="sortColumn === 'name'">{{ sortDirectionSymbol }}</span>
                        </th>

                        <th v-for="hole in holes" :key="hole"
                            class="scorecard-header-cell text-center border-l border-white/30 dark:border-white/10">
                            <router-link :to="'/games/' + gameId + '/' + hole"
                                class="hover:underline text-blue-600 dark:text-blue-400">
                                {{ hole }}
                            </router-link>
                        </th>

                        <th class="scorecard-header-cell cursor-pointer w-14 border-l border-white/30 dark:border-white/10"
                            @click="$emit('sort', 'average')">
                            Ø <span v-if="sortColumn === 'average'">{{ sortDirectionSymbol }}</span>
                        </th>
                        <th class="scorecard-header-cell cursor-pointer w-16 border-l border-white/30 dark:border-white/10 last:rounded-tr-2xl"
                            @click="$emit('sort', 'total')">
                            {{ $t('General.Total') }}
                            <span v-if="sortColumn === 'total'">{{ sortDirectionSymbol }}</span>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="player in sortedPlayers" :key="player.id"
                        class="hover:bg-white/30 dark:hover:bg-gray-800/30 transition">
                        <td class="scorecard-player-cell">
                            {{ player.name }}
                        </td>

                        <td v-for="hole in holes" :key="hole" class="scorecard-cell text-center">
                            {{ scores[player.id]?.[hole] ?? '–' }}
                        </td>

                        <td class="scorecard-metric-cell w-14 text-center">
                            {{ averageScore(player.id) }}
                        </td>
                        <td class="scorecard-metric-cell w-16 text-center">
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
import type { Player } from '@/services/api'
import type { ScoreMap } from '@/types'

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

const sortDirectionSymbol = computed(() =>
    props.sortDirection === 'asc' ? '↑' : '↓'
)
</script>
