import { ref } from 'vue';
import { fetchGamesSummary } from '@/services/api';

export function useGamesSummaryData() {
    const games = ref([]);
    const playerMap = ref({});
    const gameMeta = ref({});
    const totalGames = ref(0);
    const page = ref(1);
    const hasMore = ref(true);
    const error = ref(null);

    async function loadGames({ perPage = 10, search = '' }) {
        error.value = null;
        try {
            const data = await fetchGamesSummary({
                page: page.value,
                per_page: perPage,
                search,
            });

            if (!Array.isArray(data.games)) {
                throw new Error('Antwort enthält keine gültige Spieleliste');
            }

            games.value.push(...data.games);

            for (const game of data.games) {
                playerMap.value[game.id] = (game.players || []).map((p) => p.name);
                gameMeta.value[game.id] = {
                    players: game.players,
                    holes: game.holes || [],
                };
            }

            page.value++;
            hasMore.value = data.games.length === perPage;

        } catch (err) {
            error.value = err.message || 'Failed to load games';
            console.error('Error loading games summary:', err.message);
        }
    }

    function reset() {
        games.value = [];
        playerMap.value = {};
        gameMeta.value = {};
        totalGames.value = 0;
        page.value = 1;
        hasMore.value = true;
        error.value = null;
    }

    return {
        games,
        playerMap,
        gameMeta,
        totalGames,
        page,
        hasMore,
        error,
        loadGames,
        reset
    };
}
