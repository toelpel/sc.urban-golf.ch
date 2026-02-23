<template>
    <div class="max-h-[calc(100dvh-11rem)] overflow-y-auto overflow-x-auto">
        <div class="glass-card p-0 overflow-hidden inline-block min-w-full">
            <table class="scorecard-table w-full min-w-max border-collapse">
                <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                    <tr>
                        <th class="scorecard-header-cell text-left first:rounded-tl-2xl">
                            {{ $t('General.Hole') }}
                        </th>

                        <th v-for="player in sortedPlayers" :key="player.id" class="scorecard-header-cell text-center max-w-[10rem] truncate
                     first:border-l-0 border-l border-white/30 dark:border-white/10
                     last:rounded-tr-2xl" :title="player.name">
                            {{ player.name }}
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
                            class="scorecard-cell max-w-[10rem] truncate">
                            {{ scores[player.id]?.[hole] ?? '–' }}
                        </td>
                    </tr>

                    <tr class="font-semibold cursor-pointer hover:bg-white/30 dark:hover:bg-gray-800/30 transition"
                        @click="$emit('sort', 'average')">
                        <td class="scorecard-cell text-left">
                            Ø
                            <span v-if="sortColumn === 'average'">
                                {{ sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                        </td>
                        <td v-for="player in sortedPlayers" :key="player.id" class="scorecard-cell">
                            {{ averageScore(player.id) }}
                        </td>
                    </tr>

                    <tr class="font-semibold cursor-pointer hover:bg-white/40 dark:hover:bg-gray-800/40 transition"
                        @click="$emit('sort', 'total')">
                        <td class="scorecard-cell text-left">
                            {{ $t('General.Total') }}
                            <span v-if="sortColumn === 'total'">
                                {{ sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                        </td>
                        <td v-for="player in sortedPlayers" :key="player.id" class="scorecard-cell">
                            {{ totalScore(player.id) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Player } from '@/services/api'
import type { ScoreMap } from '@/types'

defineProps<{
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
</script>
