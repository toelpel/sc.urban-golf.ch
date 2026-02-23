<template>
  <div class="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
    <h1 class="maintitle mb-4 truncate max-w-[70vw]">
      {{ displayName }} – {{ $t('General.Hole') }} {{ hole }}
    </h1>

    <div ref="optionsWrapper" class="relative">
      <button @click="isOptionsOpen = !isOptionsOpen"
        class="icon-button w-10 h-10 text-2xl hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Options" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 6.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      </button>

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

  <div v-if="showHoleOverview" class="flex justify-center items-center flex-wrap gap-2 mb-3 text-sm">
    <router-link v-for="n in holes" :key="n" :to="'/games/' + gameId + '/' + n"
      class="px-3 py-1 rounded-full backdrop-blur-md transition text-gray-800 dark:text-gray-200 hover:bg-white/60"
      :class="n === hole ? 'ring-2 ring-green-500 bg-white/60 dark:bg-gray-900/60 text-gray-900 dark:text-white' : 'ring-1 ring-white/50 bg-white/40 dark:bg-gray-900/40'">
      {{ n }}
    </router-link>
  </div>

  <div v-if="players.length === 0" class="shrink-0 text-gray-500 text-center dark:text-gray-300">
    {{ $t('Scorecard.Loading') }}
  </div>

  <div v-else class="glass-list mt-2">
    <div class="card-inner">
      <div v-for="player in players" :key="player.id" class="flex items-center justify-between px-4 py-3 gap-3">
        <div class="min-w-0 flex-1 truncate text-left text-base font-semibold
                 text-gray-900 dark:text-gray-100" :title="player.name">
          {{ player.name }}
        </div>

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
            <option v-for="n in strokeRange" :key="n" :value="n">{{ n }}</option>
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

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useOfflineSync } from '@/composables/useOfflineSync'
import { gamesDetailKey } from '@/types'
import { shortGameName } from '@/utils/format'
import { VALIDATION } from '@/constants'

const route = useRoute()
const gameId = computed(() => route.params.gameId as string)
const hole = computed(() => parseInt(route.params.holeId as string))

const context = inject(gamesDetailKey)!
const { players, scores, holes, gameName } = context
const { saveScore: saveScoreOffline } = useOfflineSync()

const displayName = computed(() => shortGameName(gameName.value))

const strokeRange = computed(() => {
  const min = VALIDATION.STROKES_MIN
  const max = VALIDATION.STROKES_MAX
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})

const showHoleOverview = ref(true)
const isOptionsOpen = ref(false)
const optionsWrapper = ref<HTMLElement | null>(null)

onMounted(() => {
  const saved = localStorage.getItem('showHoleOverview')
  showHoleOverview.value = saved !== 'false'

  ensureScoreFieldsExist()

  document.addEventListener('click', handleClickOutsideOptions)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideOptions)
})

watch(showHoleOverview, (val) => {
  localStorage.setItem('showHoleOverview', String(val))
})

watch([() => hole.value, () => players.value.length], () => {
  ensureScoreFieldsExist()
})

function toggleHoleOverview() {
  showHoleOverview.value = !showHoleOverview.value
  isOptionsOpen.value = false
}

function handleClickOutsideOptions(event: MouseEvent) {
  if (optionsWrapper.value && !optionsWrapper.value.contains(event.target as Node)) {
    isOptionsOpen.value = false
  }
}

function changeStrokes(playerId: string, delta: number) {
  const current = Number(scores.value[playerId][hole.value]) || 0
  let updated = current + delta
  if (updated < VALIDATION.STROKES_MIN) updated = VALIDATION.STROKES_MIN
  if (updated > VALIDATION.STROKES_MAX) updated = VALIDATION.STROKES_MAX
  scores.value[playerId][hole.value] = updated
  saveScore(playerId)
}

async function saveScore(playerId: string) {
  await saveScoreOffline({
    game_id: gameId.value,
    player_id: playerId,
    hole: hole.value,
    strokes: Number(scores.value[playerId][hole.value]),
  })
}

function ensureScoreFieldsExist() {
  for (const player of players.value) {
    if (!scores.value[player.id]) scores.value[player.id] = {}
    if (scores.value[player.id][hole.value] === undefined) {
      scores.value[player.id][hole.value] = ''
    }
  }
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
