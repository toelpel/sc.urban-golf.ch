import { ref, computed } from 'vue';

export function useSortedPlayers(players, scores) {
    const sortColumn = ref('name');
    const sortDirection = ref('asc');

    const totalScore = playerId => {
        const s = scores.value[playerId] || {};
        return Object.values(s).map(n => parseInt(n) || 0).reduce((a, b) => a + b, 0);
    };

    const averageScore = playerId => {
        const s = scores.value[playerId] || {};
        const values = Object.values(s).map(n => parseInt(n)).filter(n => !isNaN(n));
        return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '–';
    };

    const sortedPlayers = computed(() => {
        return [...players.value].sort((a, b) => {
            let aVal, bVal;
            if (sortColumn.value === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else if (sortColumn.value === 'total') {
                aVal = totalScore(a.id);
                bVal = totalScore(b.id);
            } else if (sortColumn.value === 'average') {
                aVal = averageScore(a.id);
                bVal = averageScore(b.id);
            }
            if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });
    });

    return { sortColumn, sortDirection, sortedPlayers, totalScore, averageScore };
}