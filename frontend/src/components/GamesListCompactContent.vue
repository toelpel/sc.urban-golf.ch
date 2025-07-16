<template>
    <div v-if="games.length === 0" class="text-center text-gray-500 dark:text-gray-400">
        {{ $t('ListGames-NoGamesFound') }}
    </div>

    <ul v-else class="space-y-2">
        <li v-for="game in games" :key="game.id"
            class="bg-white/80 dark:bg-gray-900/80 shadow-md rounded-2xl px-5 py-4 transition-transform transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
                <div class="flex flex-col min-w-0">
                    <div class="font-medium text-lg text-gray-800 dark:text-white truncate">{{ game.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
                        :title="playerMap[game.id]?.join(', ')">
                        {{ formatDate(game.created_at) }}
                        <span v-if="playerMap[game.id]"> – {{ getPlayerListShort(game.id) }}</span>
                    </div>
                </div>
                <div class="flex gap-3 items-center flex-shrink-0">
                    <router-link :to="`/games/${game.id}`" class="button-primary text-sm">📋</router-link>
                    <button @click="toggleDetails(game.id)"
                        class="text-xl text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        {{ expandedGameId === game.id ? '▾' : '▸' }}
                    </button>
                </div>
            </div>

            <transition name="fade">
                <div v-if="expandedGameId === game.id"
                    class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
                    <div class="mb-2">
                        🕳️ {{ $t('ListGames-HolesPlayed') }}: {{ gameMeta[game.id]?.holes?.length || 0 }}
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                        <div v-for="player in gameMeta[game.id]?.players || []" :key="player.id" class="truncate"
                            :title="player.name">
                            {{ player.name }} – Ø {{ player.avg.toFixed(2) }} – Σ {{ player.total }}
                        </div>
                    </div>
                </div>
            </transition>
        </li>
    </ul>

    <Pagination :current-page="currentPage" :total-pages="totalPages"
        @update:currentPage="$emit('update:currentPage', $event)" />
</template>

<script setup>
import { ref, computed, onServerPrefetch, watch, watchEffect } from 'vue';
import axios from 'axios';
import Pagination from './Pagination.vue';
import { useGameMetaData } from '@/composables/useGameMetaData';

const props = defineProps({
    searchTerm: String,
    currentPage: Number,
    perPage: Number
});

const emit = defineEmits(['update:currentPage']);

const games = ref([]);
const totalGames = ref(0);
const playerMap = ref({});
const gameMeta = ref({});
const expandedGameId = ref(null);

const totalPages = computed(() => Math.max(1, Math.ceil(totalGames.value / props.perPage)));

async function fetchGames() {
    const params = {
        page: props.currentPage,
        per_page: props.perPage,
        search: props.searchTerm.length >= 3 ? props.searchTerm : undefined
    };
    const { data } = await axios.get('/games', { params });
    games.value = data.games;
    totalGames.value = data.total;

    for (const game of data.games) {
        const { data: players } = await axios.get(`/games/${game.id}/players`);
        playerMap.value[game.id] = players.map(p => p.name);
        const meta = await useGameMetaData(game.id);
        gameMeta.value[game.id] = {
            holes: meta.holes,
            players: meta.players
        };
    }
}

watchEffect(fetchGames);

function formatDate(ts) {
    return new Date(ts).toLocaleString('de-CH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function getPlayerListShort(gameId) {
    const list = (playerMap.value[gameId] || []).join(', ');
    return list.length > 40 ? list.slice(0, 40) + '…' : list;
}

function toggleDetails(id) {
    expandedGameId.value = expandedGameId.value === id ? null : id;
}
</script>