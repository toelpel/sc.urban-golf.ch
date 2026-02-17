import { ref } from 'vue';
import { fetchGame, fetchGamePlayers, fetchScores } from '@/services/api';

export function useGamesDetailData(gameId) {
    const players = ref([]);
    const scores = ref({});
    const holes = ref([]);
    const gameName = ref('');
    const error = ref(null);

    async function load() {
        error.value = null;
        try {
            const game = await fetchGame(gameId.value);
            gameName.value = game.name || `Game #${gameId.value}`;

            const playerList = await fetchGamePlayers(gameId.value);
            players.value = playerList;

            for (const player of players.value) {
                scores.value[player.id] = {};
            }

            const scoreData = await fetchScores(gameId.value);

            for (const entry of scoreData) {
                const { player_id, hole, strokes } = entry;
                if (!scores.value[player_id]) scores.value[player_id] = {};
                scores.value[player_id][hole] = strokes;
            }

            holes.value = Array.from(new Set(scoreData.map(e => e.hole))).sort((a, b) => a - b);
            if (holes.value.length === 0) holes.value.push(1);
        } catch (err) {
            error.value = err.message || 'Failed to load game data';
            console.error('Error loading game detail data:', err);
        }
    }

    return { players, scores, holes, gameName, error, load };
}
