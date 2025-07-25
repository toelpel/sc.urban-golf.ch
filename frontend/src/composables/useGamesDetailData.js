import { ref } from 'vue';
import axios from 'axios';

export function useGamesDetailData(gameId) {
    const players = ref([]);
    const scores = ref({});
    const holes = ref([]);
    const gameName = ref('');

    async function load() {
        const { data: game } = await axios.get(`/games/${gameId.value}`);
        gameName.value = game.name || `Game #${gameId.value}`;

        const { data: playerList } = await axios.get(`/games/${gameId.value}/players`);
        players.value = playerList;

        for (const player of players.value) {
            scores.value[player.id] = {};
        }

        const { data: scoreData } = await axios.get('/scores', {
            params: { game_id: gameId.value }
        });

        for (const entry of scoreData) {
            const { player_id, hole, strokes } = entry;
            if (!scores.value[player_id]) scores.value[player_id] = {};
            scores.value[player_id][hole] = strokes;
        }

        holes.value = Array.from(new Set(scoreData.map(e => e.hole))).sort((a, b) => a - b);
        if (holes.value.length === 0) holes.value.push(1);
    }

    return { players, scores, holes, gameName, load };
}