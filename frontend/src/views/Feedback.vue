<template>
  <div class="px-4 mx-auto">
    <h1 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">{{ $t('Feedback-Title') }}</h1>
    
    <div v-if="submitted" class="text-green-600 dark:text-green-400">
      {{ $t('Feedback-ThankYou') }}

      <div class="flex w-full mt-6">
      <button @click="goBack" class="button-primary flex-1">⏪ {{ $t('Back') }}</button>
    </div>

    </div>
    
    <form v-else @submit.prevent="submitFeedback" class="space-y-4">
      <label class="label">{{ $t('Feedback-RatingTitle') }}</label>
      <div class="flex space-x-2">
        <button v-for="n in 5" :key="n" type="button" @click="rating = n" class="text-2xl"
                :class="rating >= n ? 'text-yellow-400' : 'text-gray-300'">
          ★
        </button>
      </div>

      <div>
        <label class="label" for="message">{{ $t('Feedback-Text') }}</label>
        <textarea id="message" v-model="message" class="textarea-field" required></textarea>
      </div>

      <div>
        <label class="label" for="name">{{ $t('Feedback-Name') }}</label>
        <input id="name" v-model="name" class="input-field" />
      </div>

      <div>
        <label class="label" for="email">{{ $t('Feedback-Email') }}</label>
        <input id="email" type="email" v-model="email" class="input-field" />
      </div>

      <div class="flex w-full gap-4 mt-6">
        <button @click="goBack" type="button" class="button-primary flex-1">⏪ {{ $t('Back') }}</button>
        <button type="submit" class="button-primary flex-1">📤 {{ $t('Send') }}</button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const rating = ref(0)
const message = ref('')
const name = ref('')
const email = ref('')
const captcha = ref('')
const submitted = ref(false)

const submitFeedback = async () => {
  if (rating.value < 1 || rating.value > 5) {
    alert('Bitte eine Bewertung von 1 bis 5 Sternen vergeben.');
    return;
  }

  if (!message.value.trim()) {
    alert('Bitte ein Feedback eingeben.');
    return;
  }

  try {
    await axios.post('/feedback', {
      rating: rating.value,
      message: message.value,
      name: name.value,
      email: email.value
    });

    submitted.value = true;
  } catch (err) {
    console.error('Fehler beim Absenden:', err);
    alert('Dein Feedback konnte leider nicht gesendet werden.');
  }
};

const goBack = () => {
  router.back()
}

</script>
