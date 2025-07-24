import { ref } from 'vue';
import axios from 'axios';

export function useGamesSummaryData() {
    const games = ref([]);
    const gameMeta = ref({});
    const playerMap = ref({});
    const totalGames = ref(0);

    async function loadGames({ page = 1, perPage = 10, search = '' } = {}) {
        const { data } = await axios.get('/games/summary', {
            params: { page, per_page: perPage, search }
        });

        for (const game of data.games) {
            playerMap.value[game.id] = game.players.map(p => p.name);
            gameMeta.value[game.id] = {
                players: game.players,
                holes: { length: game.holes_played }
            };
        }

        if (page === 1) {
            games.value = data.games;
        } else {
            games.value.push(...data.games);
        }
        totalGames.value = data.total;
    }

    function reset() {
        games.value = [];
        playerMap.value = {};
        gameMeta.value = {};
        totalGames.value = 0;
    }

    return {
        games,
        playerMap,
        gameMeta,
        totalGames,
        loadGames,
        reset
    };
}