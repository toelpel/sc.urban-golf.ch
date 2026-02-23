<template>
  <DefaultLayout>
    <h1 class="maintitle">
      {{ isEditing ? $t('Games.NewGame.TitleEdit') : $t('Games.NewGame.TitleNew') }}
    </h1>

    <div class="flex flex-col items-stretch gap-4 mt-6">
      <input type="text" v-model="gameName" :placeholder="$t('Games.NewGame.GameName')" maxlength="30"
        class="input-field w-full" />

      <div v-for="(player, index) in players" :key="player.id">
        <input type="text" v-model="player.name" :placeholder="`${$t('Games.NewGame.PlayerName')} ${index + 1}`"
          maxlength="30" class="input-field w-full" />
      </div>

      <button @click="addPlayer" :disabled="players.length >= 10" class="button-primary w-full">
        {{ $t('Games.NewGame.AddPlayer') }}
      </button>

      <button @click="saveGame" :disabled="isSaving" class="button-primary w-full">
        {{ isEditing ? $t('Games.NewGame.SaveChanges') : $t('Games.NewGame.StartGame') }}
      </button>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { ref, computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nanoid } from 'nanoid'
import { useToast } from '@/composables/useToast'
import { fetchGame, fetchGamePlayers, createOrUpdatePlayers, createOrUpdateGame } from '@/services/api'

const router = useRouter()
const route = useRoute()
const { error: showError } = useToast()
const gameId = computed(() => route.params.gameId as string | undefined)

const gameName = ref('')
const players = ref([{ id: nanoid(), name: '' }])
const isEditing = computed(() => !!gameId.value)
const isSaving = ref(false)

async function loadGame(id: string) {
  try {
    const game = await fetchGame(id)
    gameName.value = game?.name || ''

    const existing = await fetchGamePlayers(id)
    players.value = existing.map(p => ({ id: p.id, name: p.name }))
  } catch (err) {
    console.error('Failed to load game:', err)
    showError('Failed to load game data.')
  }
}

watchEffect(async () => {
  if (gameId.value) {
    await loadGame(gameId.value)
  }
})

function addPlayer() {
  if (players.value.length < 10) {
    players.value.push({ id: nanoid(), name: '' })
  }
}

async function saveGame() {
  if (isSaving.value) return
  isSaving.value = true

  const validPlayers = players.value
    .map(p => ({ ...p, name: p.name.trim() }))
    .filter(p => p.name)

  if (!gameName.value || validPlayers.length === 0) {
    showError('Please enter game name and at least one player.')
    isSaving.value = false
    return
  }

  try {
    await createOrUpdatePlayers(validPlayers.map(p => ({ id: p.id, name: p.name })))
    const playerIds = validPlayers.map(p => p.id)

    const idToUse = isEditing.value ? gameId.value! : nanoid()
    const game = await createOrUpdateGame({
      id: idToUse,
      name: gameName.value,
      players: playerIds,
    })

    if (!game?.id) {
      showError('Error when saving the game.')
      return
    }

    if (isEditing.value) {
      router.go(-1)
    } else {
      router.push(`/games/${game.id}/1`)
    }
  } catch (err) {
    console.error(err)
    showError('Error when saving: ' + (err instanceof Error ? err.message : 'Unknown error'))
  } finally {
    isSaving.value = false
  }
}
</script>
