<template>
  <DefaultTemplate>
    <h1 class="maintitle">
      {{ isEditing ? $t('NewGame-TitleEdit') : $t('NewGame-TitleNew') }}
    </h1>

    <div class="flex flex-col items-stretch gap-4 mt-6">
      <input type="text" v-model="gameName" :placeholder="$t('NewGame-GameName')" maxlength="30"
        class="input-field w-full" />

      <div v-for="(player, index) in players" :key="player.id">
        <input type="text" v-model="player.name" :placeholder="`${$t('NewGame-PlayerName')} ${index + 1}`"
          maxlength="30" class="input-field w-full" />
      </div>

      <button @click="addPlayer" :disabled="players.length >= 10" class="button-primary w-full">
        {{ $t('NewGame-AddPlayer') }}
      </button>

      <button @click="saveGame" :disabled="isSaving" class="button-primary w-full">
        {{ isEditing ? $t('NewGame-SaveChanges') : $t('NewGame-StartGame') }}
      </button>
    </div>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nanoid } from 'nanoid'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const gameId = route.query.gameId

const gameName = ref('')
const players = ref([{ id: nanoid(), name: '' }])
const isEditing = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  if (gameId) {
    isEditing.value = true

    const { data: games } = await axios.get('/games')
    const match = games.find(g => g.id === gameId)
    if (match) {
      gameName.value = match.name || ''
    }

    const { data: existing } = await axios.get(`/games/${gameId}/players`)
    players.value = existing.map(p => ({ id: p.id, name: p.name }))
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
    alert('Please enter game name and at least one player.')
    isSaving.value = false
    return
  }

  try {
    const playerIds = []

    for (const player of validPlayers) {
      player.name = player.name.trim()
      await axios.post('/players', { id: player.id, name: player.name })
      playerIds.push(player.id)
    }

    // Upsert-Logik: Immer POST /games, egal ob neu oder bestehend
    const idToUse = isEditing.value ? gameId : nanoid()
    const { data: game } = await axios.post('/games', {
      id: idToUse,
      name: gameName.value,
      players: playerIds,
    })

    if (!game?.id) {
      alert('Error when saving the game.')
      return
    }

    if (isEditing.value) {
      await axios.post(`/games/${idToUse}/players`, { players: playerIds })
      router.go(-1)
    } else {
      router.push(`/games/${game.id}/1`)
    }
  } catch (err) {
    console.error(err)
    alert('Error when saving: ' + err.message)
  } finally {
    isSaving.value = false
  }
}
</script>