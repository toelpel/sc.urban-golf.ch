<template>
    <h2 class="maintitle mb-4">{{ $t('ListGames-AllGames') }}</h2>
    <div class="relative mb-4">
        <input type="text" v-model="searchTerm" :placeholder="`🔍 ${$t('ListGames-SearchText')}`"
            class="input-field w-full pr-10" />
        <button v-if="searchTerm" @click="searchTerm = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
    </div>

    <div v-if="paginatedGames.length === 0" class="text-center text-gray-500 dark:text-gray-400">
        {{ $t('ListGames-NoGamesFound') }}
    </div>
    <ul v-else class="space-y-2">
        <li v-for="game in paginatedGames" :key="game.id"
            class="bg-white/80 dark:bg-gray-900/80 shadow-md rounded-2xl px-5 py-4 transition-transform transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
                <!-- LINKSBLOCK -->
                <div class="flex flex-col min-w-0">
                    <div class="font-medium text-lg text-gray-800 dark:text-white truncate">
                        {{ game.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
                        :title="playerMap[game.id]?.join(', ')">
                        {{ formatDate(game.created_at) }}
                        <span v-if="playerMap[game.id]"> – {{ getPlayerListShort(game.id) }}</span>
                    </div>
                </div>
                <!-- RECHTSBLOCK -->
                <div class="flex gap-3 items-center flex-shrink-0">
                    <router-link :to="`/games/${game.id}`" class="button-primary text-sm">📋</router-link>
                    <button @click="toggleDetails(game.id)"
                        class="text-xl text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        {{ expandedGameId === game.id ? '▾' : '▸' }}
                    </button>
                </div>
            </div>

            <!-- DETAILBEREICH -->
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useGameMetaData } from '@/composables/useGameMetaData.js';

const games = ref([]);
const playerMap = ref({});
const gameMeta = ref({});
const searchTerm = ref('');
const currentPage = ref(1);
const perPage = 5;
const expandedGameId = ref(null);

onMounted(async () => {
    try {
        const { data } = await axios.get('/games');
        games.value = data;

        for (const game of data) {
            const { data: players } = await axios.get(`/games/${game.id}/players`);
            playerMap.value[game.id] = players.map(p => p.name);

            const meta = await useGameMetaData(game.id);
            gameMeta.value[game.id] = {
                holes: meta.holes,
                players: meta.players
            };
        }
    } catch (err) {
        console.error('Fehler beim Laden:', err);
    }
});

const filteredGames = computed(() => {
    if (searchTerm.value.length < 3) return games.value;
    return games.value.filter(game => {
        const name = game.name.toLowerCase();
        const players = (playerMap.value[game.id] || []).join(' ').toLowerCase();
        const term = searchTerm.value.toLowerCase();
        return name.includes(term) || players.includes(term);
    });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGames.value.length / perPage)));

watch(filteredGames, (filtered) => {
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage.value > pages) currentPage.value = pages;
});

const paginatedGames = computed(() => {
    const start = (currentPage.value - 1) * perPage;
    return filteredGames.value.slice(start, start + perPage);
});

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('de-CH', {
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