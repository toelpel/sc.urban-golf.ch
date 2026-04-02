<template>
    <div class="glass-card p-0 overflow-hidden">
        <table class="scorecard-table w-full border-collapse">
            <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                <tr>
                    <th class="scorecard-header-cell text-center w-12 first:rounded-tl-2xl">
                        #
                    </th>
                    <th class="scorecard-header-cell cursor-pointer border-l border-white/30 dark:border-white/10"
                        @click="$emit('sort', 'name')">
                        {{ $t('General.Player') }}
                        <span v-if="sortColumn === 'name'">{{ sortDirectionSymbol }}</span>
                    </th>
                    <th class="scorecard-header-cell cursor-pointer w-16 text-center border-l border-white/30 dark:border-white/10"
                        @click="$emit('sort', 'average')">
                        Ø <span v-if="sortColumn === 'average'">{{ sortDirectionSymbol }}</span>
                    </th>
                    <th class="scorecard-header-cell cursor-pointer w-20 text-center border-l border-white/30 dark:border-white/10 last:rounded-tr-2xl"
                        @click="$emit('sort', 'total')">
                        {{ $t('General.Total') }}
                        <span v-if="sortColumn === 'total'">{{ sortDirectionSymbol }}</span>
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(player, index) in sortedPlayers" :key="player.id"
                    class="hover:bg-white/30 dark:hover:bg-gray-800/30 transition"
                    :class="{ 'ranking-podium': index < 3 }">
                    <td class="scorecard-cell text-center font-bold" :class="rankClass(index)">
                        {{ index + 1 }}
                    </td>
                    <td class="scorecard-player-cell" :class="rankTextClass(index)">
                        {{ player.name }}
                    </td>
                    <td class="scorecard-metric-cell text-center">
                        {{ averageScore(player.id) }}
                    </td>
                    <td class="scorecard-metric-cell text-center font-bold text-lg">
                        {{ totalScore(player.id) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '@/services/api'

defineEmits<{
  sort: [column: 'name' | 'total' | 'average']
}>()

const props = defineProps<{
    sortColumn: string
    sortDirection: string
    sortedPlayers: Player[]
    averageScore: (playerId: string) => string
    totalScore: (playerId: string) => number
}>()

const sortDirectionSymbol = computed(() =>
    props.sortDirection === 'asc' ? '↑' : '↓'
)

function rankClass(index: number): string {
    if (index === 0) return 'text-yellow-500 dark:text-yellow-400'
    if (index === 1) return 'text-gray-400 dark:text-gray-300'
    if (index === 2) return 'text-amber-600 dark:text-amber-500'
    return 'text-gray-500 dark:text-gray-400'
}

function rankTextClass(index: number): string {
    if (index === 0) return 'font-bold'
    return ''
}
</script>
