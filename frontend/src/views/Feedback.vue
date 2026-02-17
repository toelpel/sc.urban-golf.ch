<template>
  <DefaultTemplate>
    <h1 class="maintitle">{{ $t('Feedback.Title') }}</h1>

    <!-- Danke-Message -->
    <div v-if="submitted" class="text-green-600 dark:text-green-400">
      {{ $t('Feedback.ThankYou') }}
    </div>

    <!-- Glass-Card Formular -->
    <form v-else @submit.prevent="handleSubmit" class="glass-card p-6 space-y-6 max-w-2xl mx-auto">
      <!-- Rating -->
      <div class="input-group">
        <label class="input-label">{{ $t('Feedback.RatingTitle') }}</label>
        <div class="flex gap-4 sm:gap-2">
          <button v-for="n in 5" :key="n" type="button" @click="rating = n"
            class="w-10 h-10 flex items-center justify-center text-2xl transition-transform hover:scale-110 focus:outline-none"
            :class="rating >= n ? 'text-yellow-400' : 'text-gray-400'" :aria-label="`${n} ${$t('Feedback.Stars')}`">
            ★
          </button>
        </div>
      </div>

      <!-- Message -->
      <div class="input-group">
        <label class="input-label" for="message">{{ $t('Feedback.Text') }}</label>
        <textarea id="message" v-model="message" class="textarea-field" required
          :placeholder="$t('Feedback.Text')"></textarea>
      </div>

      <!-- Name -->
      <div class="input-group">
        <label class="input-label" for="name">{{ $t('Feedback.Name') }}</label>
        <input id="name" v-model="name" class="input-field" :placeholder="$t('Feedback.Name')" />
      </div>

      <!-- Email -->
      <div class="input-group">
        <label class="input-label" for="email">{{ $t('Feedback.Email') }}</label>
        <input id="email" type="email" v-model="email" class="input-field"
          :placeholder="$t('Feedback.Email')" />
      </div>

      <!-- Submit -->
      <div class="pt-2">
        <button type="submit" class="button-primary w-full">
          {{ $t('General.Send') }}
        </button>
      </div>
    </form>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { submitFeedback } from '@/services/api'

const { error: showError } = useToast()

const rating = ref(0)
const message = ref('')
const name = ref('')
const email = ref('')
const submitted = ref(false)

const handleSubmit = async () => {
  if (rating.value < 1 || rating.value > 5) {
    showError('Please give a rating from 1 to 5 stars.')
    return
  }

  if (!message.value.trim()) {
    showError('Please enter feedback.')
    return
  }

  try {
    await submitFeedback({
      rating: rating.value,
      message: message.value,
      name: name.value,
      email: email.value
    })

    submitted.value = true
  } catch (err) {
    console.error('Error when sending:', err)
    showError('Sorry, your feedback could not be sent.')
  }
}
</script>
