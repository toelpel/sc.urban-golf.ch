import { ref } from 'vue';
import axios from 'axios';

const games = ref([]);
const playerMap = ref({});
const gameMeta = ref({});
const totalGames = ref(0);
const page = ref(1);
const hasMore = ref(true);

export function useGamesSummaryData() {
    async function loadGames({ perPage = 10, search = '' }) {
        const url = `/games/summary`;
        try {
            const { data } = await axios.get(url, {
                params: {
                    page: page.value,
                    per_page: perPage,
                    search,
                },
            });

            if (!Array.isArray(data.games)) {
                throw new Error('Antwort enthält keine gültige Spieleliste');
            }

            games.value.push(...data.games);

            for (const game of data.games) {
                playerMap.value[game.id] = (game.players || []).map((p) => p.name);
                gameMeta.value[game.id] = {
                    players: game.players,
                    holes: [
                        ...new Set(
                            (game.players || []).flatMap(p => (p.scores || []).map(s => s.hole))
                        )
                    ]
                };
            }

            totalGames.value = data.total || 0;
            page.value++;

            hasMore.value = games.value.length < totalGames.value;
        } catch (err) {
            console.error('⚠️ Fehler beim Laden der Spielezusammenfassung (Axios):', err.message);
        }
    }

    function reset() {
        games.value = [];
        playerMap.value = {};
        gameMeta.value = {};
        totalGames.value = 0;
        page.value = 1;
        hasMore.value = true;
    }

    return {
        games,
        playerMap,
        gameMeta,
        totalGames,
        page,
        hasMore,
        loadGames,
        reset
    };
}