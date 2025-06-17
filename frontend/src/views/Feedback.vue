<template>
  <div class="p-4 max-w-xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Feedback zur Scorecard</h1>
    
    <div v-if="submitted" class="text-green-600 dark:text-green-400">
      Vielen Dank für dein Feedback! 🍀
    </div>
    
    <form v-else @submit.prevent="submitFeedback" class="space-y-4">
      <label class="label">Bewertung</label>
      <div class="flex space-x-2">
        <button v-for="n in 5" :key="n" type="button" @click="rating = n" class="text-2xl"
                :class="rating >= n ? 'text-yellow-400' : 'text-gray-300'">
          ★
        </button>
      </div>

      <div>
        <label class="label" for="message">Feedback</label>
        <textarea id="message" v-model="message" class="textarea-field" required></textarea>
      </div>

      <div>
        <label class="label" for="name">Name (optional)</label>
        <input id="name" v-model="name" class="input-field" />
      </div>

      <div>
        <label class="label" for="email">E-Mail (optional)</label>
        <input id="email" type="email" v-model="email" class="input-field" />
      </div>

      <button type="submit" class="button-primary">Absenden</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const rating = ref(0)
const message = ref('')
const name = ref('')
const email = ref('')
const captcha = ref('')
const submitted = ref(false)

const submitFeedback = async () => {

  await axios.post('/feedback', {
    rating: rating.value,
    message: message.value,
    name: name.value,
    email: email.value
  })

  submitted.value = true
}
</script>
