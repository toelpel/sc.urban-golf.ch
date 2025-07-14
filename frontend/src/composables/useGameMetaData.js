import { ref } from 'vue';
import { useGamesDetailData } from './useGamesDetailData.js';

export async function useGameMetaData(gameId) {
    const { players, scores, holes, gameName, load } = useGamesDetailData(ref(gameId));
    await load();

    const metaPlayers = players.value.map((player) => {
        const strokes = scores.value[player.id] || {};
        const strokeValues = Object.values(strokes);
        const total = strokeValues.reduce((sum, s) => sum + s, 0);
        const avg = strokeValues.length ? total / strokeValues.length : 0;

        return {
            id: player.id,
            name: player.name,
            total,
            avg,
        };
    });

    return {
        gameName: gameName.value,
        holes: holes.value,
        players: metaPlayers,
    };
}