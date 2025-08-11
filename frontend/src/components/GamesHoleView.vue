<template>
  <!-- Titelzeile mit Optionsmenü -->
  <div class="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
    <h1 class="maintitle mb-4 truncate max-w-[70vw]">
      {{ shortGameName }} – {{ $t('General.Hole') }} {{ hole }}
    </h1>

    <!-- Menü-Trigger (⋯) -->
    <div ref="optionsWrapper" class="relative">
      <button @click="isOptionsOpen = !isOptionsOpen" class="icon-button text-2xl leading-none">
        ...
      </button>

      <!-- Dropdown-Menü -->
      <transition name="fade-slide">
        <div v-if="isOptionsOpen"
          class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/10 text-sm dark:bg-gray-800 dark:text-white z-10">
          <router-link :to="`/games/new/${gameId}`" class="dropdown-item" @click="isOptionsOpen = false">
            {{ $t('Games.HoleView.EditGame') }}
          </router-link>
          <button class="dropdown-item" @click="toggleHoleOverview">
            {{ showHoleOverview ? $t('Games.HoleView.HideHoleOverview') : $t('Games.HoleView.ShowHoleOverview') }}
          </button>
        </div>
      </transition>
    </div>
  </div>

  <!-- Lochübersicht -->
  <div v-if="showHoleOverview"
    class="flex justify-center items-center flex-wrap gap-2 mb-2 text-sm text-gray-700 dark:text-gray-300">
    <router-link v-for="n in holes" :key="n" :to="`/games/${gameId}/${n}`" class="px-3 py-1 rounded border font-semibold 
             bg-gray-200 hover:bg-gray-300 text-gray-800 
             dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white" :class="{ 'ring-2 ring-green-500': n === hole }">
      {{ n }}
    </router-link>
  </div>

  <!-- Score-Editor -->
  <div v-for="player in players" :key="player.id" class="mb-2 border-t pt-2">
    <div class="flex items-center space-x-4">
      <div
        class="w-64 truncate self-center text-left text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight pr-2"
        :title="player.name">
        {{ player.name }}
      </div>

      <button @click="changeStrokes(player.id, -1)" class="button-primary w-10 h-10 flex items-center justify-center"
        aria-label="Weniger Schläge">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 -translate-y-[1px] -translate-x-[10px]" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="4" stroke-linecap="butt">
          <path d="M5 12h14" />
        </svg>
      </button>

      <select v-model="scores[player.id][hole]" @change="saveScore(player.id)" class="select-field w-12 text-center">
        <option v-for="n in range(-3, 15)" :key="n" :value="n">{{ n }}</option>
      </select>

      <button @click="changeStrokes(player.id, 1)" class="button-primary w-10 h-10 flex items-center justify-center"
        aria-label="Mehr Schläge">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 -translate-y-[1px] -translate-x-[10px]" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="4" stroke-linecap="butt">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Navigation -->
  <div class="flex flex-col items-stretch gap-3 mt-6">
    <div class="flex flex-row gap-3">
      <router-link :to="`/games/${gameId}/${hole - 1}`" v-if="hole > 1" class="button-primary flex-1 text-center">
        {{ $t('General.Back') }}
      </router-link>
      <router-link :to="`/games/${gameId}/${hole + 1}`" class="button-primary flex-1 text-center">
        {{ $t('General.Forward') }}
      </router-link>
    </div>
    <router-link :to="`/games/${gameId}`" class="button-primary w-full text-center">
      {{ $t('General.Scorecard') }}
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useGamesDetailData } from '@/composables/useGamesDetailData.js';
import axios from 'axios';

const route = useRoute();
const gameId = computed(() => route.params.gameId)
const hole = computed(() => parseInt(route.params.holeId));

const { players, scores, holes, gameName, load } = useGamesDetailData(gameId);

// Shorten gamename
const shortGameName = computed(() => {
  return gameName.value.length > 24
    ? gameName.value.slice(0, 21) + '…'
    : gameName.value;
});

const showHoleOverview = ref(true);
const isOptionsOpen = ref(false);
const optionsWrapper = ref(null);

onMounted(async () => {
  const saved = localStorage.getItem('showHoleOverview');
  showHoleOverview.value = saved !== 'false';

  await load();
  ensureScoreFieldsExist();

  document.addEventListener('click', handleClickOutsideOptions);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideOptions);
});

watch(showHoleOverview, (val) => {
  localStorage.setItem('showHoleOverview', val);
});

watch(() => hole.value, () => {
  ensureScoreFieldsExist();
});

function toggleHoleOverview() {
  showHoleOverview.value = !showHoleOverview.value;
  isOptionsOpen.value = false;
}

function handleClickOutsideOptions(event) {
  if (optionsWrapper.value && !optionsWrapper.value.contains(event.target)) {
    isOptionsOpen.value = false;
  }
}

function changeStrokes(playerId, delta) {
  const current = scores.value[playerId][hole.value] || 0;
  let updated = current + delta;
  if (updated < -3) updated = -3;
  if (updated > 15) updated = 15;
  scores.value[playerId][hole.value] = updated;
  saveScore(playerId);
}

async function saveScore(playerId) {
  await axios.post('/scores', {
    game_id: gameId.value,
    player_id: playerId,
    hole: hole.value,
    strokes: scores.value[playerId][hole.value],
  });
}

function ensureScoreFieldsExist() {
  for (const player of players.value) {
    if (!scores.value[player.id]) scores.value[player.id] = {};
    if (scores.value[player.id][hole.value] === undefined) {
      scores.value[player.id][hole.value] = '';
    }
  }
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>