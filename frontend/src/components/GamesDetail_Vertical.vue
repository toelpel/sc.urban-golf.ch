<template>
    <!-- Outer container: vertikal + horizontal scroll -->
    <div class="max-h-[calc(100dvh-11rem)] overflow-y-auto overflow-x-auto">
        <!-- Glass-Card Wrapper -->
        <div class="glass-card p-0 overflow-hidden inline-block min-w-full">
            <table class="scorecard-table w-full min-w-max border-collapse">
                <thead class="backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
                    <tr>
                        <th class="scorecard-header-cell text-left first:rounded-tl-2xl">
                            {{ $t('General.Hole') }}
                        </th>

                        <th v-for="(player, idx) in sortedPlayers" :key="player.id" class="scorecard-header-cell text-center max-w-[10rem] truncate
                     first:border-l-0 border-l border-white/30 dark:border-white/10
                     last:rounded-tr-2xl" :title="player.name">
                            {{ player.name }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <!-- Loch-Zeilen -->
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

                    <!-- Durchschnitt -->
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

                    <!-- Total -->
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