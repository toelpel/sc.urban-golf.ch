<template>
    <div class="glass-card p-0 overflow-hidden">
        <table class="scorecard-table w-full border-collapse">
            <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                <tr>
                    <th class="scorecard-header-cell text-center w-14 first:rounded-tl-2xl">
                        #
                    </th>
                    <th class="scorecard-header-cell cursor-pointer border-l border-white/30 dark:border-white/10"
                        :class="{ 'scorecard-sort-active-header': sortColumn === 'name' }"
                        @click="$emit('sort', 'name')">
                        {{ $t('General.Player') }}
                        <ChevronUpIcon v-if="sortColumn === 'name' && sortDirection === 'asc'"
                            class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                        <ChevronDownIcon v-else-if="sortColumn === 'name'"
                            class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                    </th>
                    <th class="scorecard-header-cell cursor-pointer w-16 text-center border-l border-white/30 dark:border-white/10"
                        :class="{ 'scorecard-sort-active-header': sortColumn === 'average' }"
                        @click="$emit('sort', 'average')">
                        Ø
                        <ChevronUpIcon v-if="sortColumn === 'average' && sortDirection === 'asc'"
                            class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                        <ChevronDownIcon v-else-if="sortColumn === 'average'"
                            class="inline w-3.5 h-3.5 ml-0.5 text-blue-500 dark:text-blue-300" />
                    </th>
                    <th class="scorecard-header-cell cursor-pointer w-20 text-center border-l border-white/30 dark:border-white/10 last:rounded-tr-2xl"
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
                <tr v-for="(player, index) in sortedPlayers" :key="player.id"
                    class="hover:bg-white/30 dark:hover:bg-gray-800/30 transition"
                    :class="rowClass(index)">
                    <!-- Rank with medal -->
                    <td class="scorecard-cell text-center" :class="rankCellClass(index)">
                        <span v-if="index < 3" class="text-lg leading-none">{{ medals[index] }}</span>
                        <span v-else class="text-gray-400 dark:text-gray-500 font-medium">{{ index + 1 }}</span>
                    </td>

                    <!-- Player name with color -->
                    <td class="scorecard-player-cell border-l-3"
                        :class="[
                            colorMap[player.id]?.border ?? '',
                            index === 0 ? 'font-bold text-base' : '',
                            index < 3 ? 'font-semibold' : '',
                            { 'scorecard-sort-active': sortColumn === 'name' }
                        ]">
                        <span class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full shrink-0"
                                :class="colorMap[player.id]?.dot ?? ''"></span>
                            {{ player.name }}
                        </span>
                    </td>

                    <!-- Average -->
                    <td class="scorecard-metric-cell text-center scorecard-metric-highlight"
                        :class="{ 'scorecard-sort-active': sortColumn === 'average' }">
                        {{ averageScore(player.id) }}
                    </td>

                    <!-- Total -->
                    <td class="scorecard-metric-cell text-center scorecard-metric-highlight"
                        :class="[
                            index === 0 ? 'font-bold text-xl' : index < 3 ? 'font-bold text-lg' : 'font-semibold text-base',
                            { 'scorecard-sort-active': sortColumn === 'total' }
                        ]">
                        {{ totalScore(player.id) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/16/solid'
import type { Player } from '@/services/api'
import { usePlayerColors } from '@/composables/usePlayerColors'

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

const medals = ['🥇', '🥈', '🥉']

const { colorMap } = usePlayerColors(computed(() => props.sortedPlayers))

function rowClass(index: number): string {
    if (index === 0) return 'ranking-row-gold'
    if (index === 1) return 'ranking-row-silver'
    if (index === 2) return 'ranking-row-bronze'
    return ''
}

function rankCellClass(index: number): string {
    if (index < 3) return 'py-3'
    return ''
}
</script>
