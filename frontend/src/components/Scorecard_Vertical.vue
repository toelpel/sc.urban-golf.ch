<template>
    <div
        class="rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 overflow-y-auto max-h-[calc(100dvh-11rem)] md:max-h-[calc(100dvh-13rem)]">
        <table class="scorecard-table w-full">
            <thead class="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                <tr>
                    <th class="scorecard-header-cell text-left sticky left-0 z-10 w-20 bg-white/90 dark:bg-gray-900/90">
                        {{ $t('Hole') }}
                    </th>
                    <th v-for="player in sortedPlayers" :key="player.id"
                        class="scorecard-header-cell text-center max-w-[10rem] truncate" :title="player.name">
                        {{ player.name }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- Loch-Zeilen -->
                <tr v-for="hole in holes" :key="hole" class="scorecard-hover-row">
                    <td class="scorecard-cell text-left font-semibold sticky left-0 bg-white/90 dark:bg-gray-900/90">
                        <router-link :to="`/hole/${gameId}/${hole}`"
                            class="text-blue-600 dark:text-blue-400 hover:underline">
                            {{ hole }}
                        </router-link>
                    </td>
                    <td v-for="player in sortedPlayers" :key="player.id" class="scorecard-cell max-w-[10rem] truncate">
                        {{ scores[player.id]?.[hole] ?? '–' }}
                    </td>
                </tr>

                <!-- Durchschnitt -->
                <tr class="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700"
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
                <tr class="bg-gray-200 dark:bg-gray-900 font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-800"
                    @click="$emit('sort', 'total')">
                    <td class="scorecard-cell text-left sticky left-0 z-10 bg-gray-200 dark:bg-gray-900">
                        {{ $t('Total') }}
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
defineProps({
    players: Array,
    holes: Array,
    scores: Object,
    gameId: [String, Number],
    sortColumn: String,
    sortDirection: String,
    sortedPlayers: Array,
    averageScore: Function,
    totalScore: Function
});
defineEmits(['sort']);
</script>