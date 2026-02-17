import { ref } from 'vue';
import { useGamesDetailData } from './useGamesDetailData.js';

// Module-level cache is intentional — avoids redundant API calls for already-fetched game metadata.
// This cache persists for the lifetime of the app session.
const metaCache = new Map();

export async function useGameMetaData(gameId) {
    if (metaCache.has(gameId)) return metaCache.get(gameId);

    const { players, scores, holes, gameName, load } = useGamesDetailData(ref(gameId));
    await load();

    const metaPlayers = players.value.map(player => {
        const playerScores = scores.value[player.id] || {};
        const strokeValues = Object.values(playerScores);
        const total = strokeValues.reduce((sum, s) => sum + s, 0);
        const avg = strokeValues.length ? total / strokeValues.length : 0;
        return { id: player.id, name: player.name, total, avg };
    });

    const meta = {
        gameName: gameName.value,
        holes: holes.value,
        players: metaPlayers
    };

    metaCache.set(gameId, meta);
    return meta;
}
