<template>
  <!-- Titelzeile mit Optionsmenü -->
  <div class="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
    <h1 class="maintitle mb-4 truncate max-w-[70vw]">
      {{ shortGameName }} – {{ $t('General.Hole') }} {{ hole }}
    </h1>

    <!-- Menü-Trigger -->
    <div ref="optionsWrapper" class="relative">
      <button @click="isOptionsOpen = !isOptionsOpen"
        class="icon-button w-10 h-10 text-2xl hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Options" type="button">
        <!-- Heroicon: Ellipsis Vertical (inline) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 6.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      </button>

      <!-- Dropdown -->
      <transition name="fade-slide">
        <div v-if="isOptionsOpen" class="absolute right-0 mt-2 w-56 rounded-xl bg-white/85 dark:bg-gray-800/85
             backdrop-blur-md ring-1 ring-black/10 shadow-lg text-sm z-10 overflow-hidden">
          <router-link :to="`/games/new/${gameId}`" class="dropdown-item" @click="isOptionsOpen = false">
            {{ $t('Games.HoleView.EditGame') }}
          </router-link>
          <button class="dropdown-item w-full text-left" @click="toggleHoleOverview">
            {{ showHoleOverview ? $t('Games.HoleView.HideHoleOverview') : $t('Games.HoleView.ShowHoleOverview') }}
          </button>
        </div>
      </transition>
    </div>
  </div>

  <!-- Lochübersicht: Glass-Chips -->
  <div v-if="showHoleOverview" class="flex justify-center items-center flex-wrap gap-2 mb-3 text-sm">
    <router-link v-for="n in holes" :key="n" :to="'/games/' + gameId + '/' + n"
      class="px-3 py-1 rounded-full backdrop-blur-md transition text-gray-800 dark:text-gray-200 hover:bg-white/60"
      :class="n === hole ? 'ring-2 ring-green-500 bg-white/60 dark:bg-gray-900/60 text-gray-900 dark:text-white' : 'ring-1 ring-white/50 bg-white/40 dark:bg-gray-900/40'">
      {{ n }}
    </router-link>
  </div>

  <!-- Spieler-Liste als Glass-Card mit Divider -->
  <div class="glass-list mt-2">
    <div class="card-inner">
      <div v-for="player in players" :key="player.id" class="flex items-center justify-between px-4 py-3 gap-3">
        <!-- Name -->
        <div class="min-w-0 flex-1 truncate text-left text-base font-semibold
                 text-gray-900 dark:text-gray-100" :title="player.name">
          {{ player.name }}
        </div>

        <!-- Stepper: - [select] +  -->
        <div class="flex items-center gap-2 shrink-0">
          <button @click="changeStrokes(player.id, -1)" class="chevron-btn w-10 h-10" aria-label="Weniger Schläge"
            type="button">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" d="M6 12h12" />
            </svg>
          </button>

          <select v-model="scores[player.id][hole]" @change="saveScore(player.id)" class="select-field w-16 text-center px-2 py-2
                   bg-white/50 dark:bg-gray-900/50 backdrop-blur-md
                   border-white/50 dark:border-white/30">
            <option v-for="n in range(-3, 15)" :key="n" :value="n">{{ n }}</option>
          </select>

          <button @click="changeStrokes(player.id, 1)" class="chevron-btn w-10 h-10" aria-label="Mehr Schläge"
            type="button">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" d="M12 6v12M6 12h12" />
            </svg>
          </button>
        </div>
      </div>
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
import { saveScore as apiSaveScore } from '@/services/api';

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
  await apiSaveScore({
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