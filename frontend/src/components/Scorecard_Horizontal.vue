<template>
    <div class="relative w-full overflow-x-auto max-w-6xl mx-auto">
        <div class="relative w-full max-w-6xl mx-auto min-w-[42rem] w-full">
            <table class="scorecard-table">
                <thead class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                    <tr>
                        <th class="scorecard-header-cell sticky left-0 top-0 bg-gray-100 cursor-pointer z-10"
                            @click="$emit('sort', 'name')">
                            {{ $t('Player') }}
                            <span v-if="props.sortColumn === 'name'">{{ sortDirectionSymbol }}</span>
                        </th>
                        <th v-for="hole in holes" :key="hole" class="scorecard-header-cell top-0 bg-gray-100">
                            <router-link :to="`/hole/${gameId}/${hole}`"
                                class="hover:underline text-blue-600 dark:text-blue-400">
                                {{ hole }}
                            </router-link>
                        </th>
                        <th class="scorecard-header-cell sticky right-12 top-0 bg-gray-100 cursor-pointer z-10"
                            @click="$emit('sort', 'average')">
                            Ø <span v-if="props.sortColumn === 'average'">{{ sortDirectionSymbol }}</span>
                        </th>
                        <th class="scorecard-header-cell sticky right-0 top-0 bg-gray-100 cursor-pointer z-10"
                            @click="$emit('sort', 'total')">
                            {{ $t('Total') }} <span v-if="props.sortColumn === 'total'">{{ sortDirectionSymbol }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="player in sortedPlayers" :key="player.id" class="scorecard-hover-row">
                        <td class="scorecard-player-cell sticky left-0">{{ player.name }}</td>
                        <td v-for="hole in holes" :key="hole" class="scorecard-cell">
                            {{ scores[player.id]?.[hole] ?? '–' }}
                        </td>
                        <td class="scorecard-metric-cell sticky right-12">
                            {{ averageScore(player.id) }}
                        </td>
                        <td class="scorecard-metric-cell sticky right-0">
                            {{ totalScore(player.id) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
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

const sortDirectionSymbol = computed(() =>
    props.sortDirection === 'asc' ? '↑' : '↓'
);
</script>