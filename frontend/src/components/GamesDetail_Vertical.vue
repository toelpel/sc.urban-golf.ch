<template>
    <div
        class="relative rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 overflow-y-auto max-h-[calc(100dvh-11rem)] md:max-h-[calc(100dvh-13rem)]">
        <table class="scorecard-table w-full">
            <thead class="bg-white/80 dark:bg-gray-900/80">
                <tr>
                    <th
                        class="scorecard-header-cell text-left left-0 sticky top-0 z-10 w-20 bg-white/90 dark:bg-gray-900/90">
                        {{ $t('General.Hole') }}
                    </th>
                    <th v-for="player in sortedPlayers" :key="player.id"
                        class="scorecard-header-cell text-center sticky top-0 z-10 max-w-[10rem] truncate"
                        :title="player.name">
                        {{ player.name }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- Loch-Zeilen -->
                <tr v-for="hole in holes" :key="hole" class="scorecard-hover-row">
                    <td class="scorecard-cell text-left font-semibold left-0 bg-white/80 dark:bg-gray-900/80">
                        <router-link :to="`/games/${gameId}/${hole}`"
                            class="text-blue-600 dark:text-blue-400 hover:underline">
                            {{ hole }}
                        </router-link>
                    </td>
                    <td v-for="player in sortedPlayers" :key="player.id"
                        class="scorecard-cell bg-white/80 dark:bg-gray-900/80 max-w-[10rem] truncate">
                        {{ scores[player.id]?.[hole] ?? '–' }}
                    </td>
                </tr>

                <!-- Durchschnitt -->
                <tr class="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    @click="$emit('sort', 'average')">
                    <td class="scorecard-cell text-left sticky left-0 z-10 bg-gray-100 dark:bg-gray-800">
                        Ø
                        <span v-if="sortColumn === 'average'">
                            {{ sortDirection === 'asc' ? '↑' : '↓' }}
                        </span>
                    </td>
                    <td v-for="player in sortedPlayers" :key="player.id" class="scorecard-cell">
                        {{ averageScore(player.id) }}
                    </td>
                </tr>

                <!-- Total -->
                <tr class="bg-gray-200 dark:bg-gray-900 font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors"
                    @click="$emit('sort', 'total')">
                    <td class="scorecard-cell text-left sticky left-0 z-10 bg-gray-200 dark:bg-gray-900">
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
</template>

<script setup>
const {
    players,
    holes,
    scores,
    gameId,
    sortColumn,
    sortDirection,
    sortedPlayers,
    averageScore,
    totalScore
} = defineProps({
    players: Array,
    holes: Array,
    scores: Object,
    gameId: [String, Number],
    sortColumn: String,
    sortDirection: String,
    sortedPlayers: Array,
    averageScore: Function,
    totalScore: Function
})

defineEmits(['sort'])
</script>