import { ref, watch } from 'vue';

export function useViewMode(players, holes) {
    const viewMode = ref('horizontal');

    function loadPreference() {
        const saved = localStorage.getItem('GamesDetailView');
        if (saved === 'horizontal' || saved === 'vertical') {
            viewMode.value = saved;
        } else {
            viewMode.value = (players.value.length > 4 && holes.value.length <= 4)
                ? 'horizontal'
                : 'vertical';
        }
    }

    function toggleView() {
        viewMode.value = viewMode.value === 'horizontal' ? 'vertical' : 'horizontal';
    }

    watch(viewMode, val => {
        localStorage.setItem('GamesDetailView', val);
    });

    return { viewMode, toggleView, loadPreference };
}