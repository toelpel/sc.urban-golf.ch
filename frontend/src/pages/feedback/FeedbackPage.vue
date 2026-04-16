<template>
  <DefaultLayout>
    <div class="container-app feedback">
      <header class="feedback__header">
        <h1 class="t-headline">{{ $t('Feedback.Title') }}</h1>
        <p class="t-muted">{{ $t('Feedback.Subtitle') }}</p>
      </header>

      <div v-if="submitted" class="feedback__success card card--padded">
        <div class="feedback__success-icon">
          <CheckCircleIcon class="w-8 h-8" />
        </div>
        <p class="t-subtitle">{{ $t('Feedback.ThankYou') }}</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="feedback__form">
        <section class="card card--padded feedback__section">
          <label class="label-strong">{{ $t('Feedback.RatingTitle') }}</label>
          <div class="feedback__stars" role="radiogroup" :aria-label="$t('Feedback.RatingTitle')">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              role="radio"
              :aria-checked="rating === n"
              :aria-label="$t(`Feedback.RatingLabels.${n}`)"
              @click="selectRating(n)"
              @pointerenter="onStarHover(n, $event)"
              @pointerleave="onStarLeave($event)"
              @focus="hoverRating = n"
              @blur="hoverRating = 0"
              class="feedback__star"
              :class="{ 'is-active': (hoverRating || rating) >= n }"
            >
              <StarIconSolid v-if="(hoverRating || rating) >= n" class="w-8 h-8" />
              <StarIconOutline v-else class="w-8 h-8" />
            </button>
          </div>
          <p class="feedback__rating-hint" aria-live="polite">
            <span v-if="hoverRating || rating">
              {{ $t(`Feedback.RatingLabels.${hoverRating || rating}`) }}
            </span>
            <span v-else class="feedback__rating-hint--fallback">
              {{ $t('Feedback.RatingHint') }}
            </span>
          </p>
        </section>

        <section class="card card--padded feedback__section">
          <label class="label-strong" for="message">{{ $t('Feedback.Text') }}</label>
          <textarea
            id="message"
            v-model="message"
            class="field"
            rows="5"
            required
            :placeholder="$t('Feedback.Text')"
          ></textarea>

          <div class="feedback__row">
            <div class="feedback__col">
              <label class="label-strong" for="name">{{ $t('Feedback.Name') }}</label>
              <input id="name" v-model="name" class="field" :placeholder="$t('Feedback.Name')" />
            </div>
            <div class="feedback__col">
              <label class="label-strong" for="email">{{ $t('Feedback.Email') }}</label>
              <input id="email" type="email" v-model="email" class="field" :placeholder="$t('Feedback.Email')" />
            </div>
          </div>
        </section>

        <AppButton
          variant="accent"
          size="xl"
          pill
          block
          type="submit"
        >
          <template #icon-left>
            <PaperAirplaneIcon class="w-5 h-5" />
          </template>
          {{ $t('General.Send') }}
        </AppButton>
      </form>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { submitFeedback } from '@/services/api'
import { StarIcon as StarIconSolid, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/vue/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const { error: showError } = useToast()

const rating = ref(0)
const hoverRating = ref(0)
const message = ref('')
const name = ref('')
const email = ref('')
const submitted = ref(false)

/**
 * iOS/Android feuern beim ersten Tap auf ein Element mit hover-States nur
 * `mouseenter` — erst der zweite Tap triggert `click`. Resultat: User musste
 * doppelt tappen um ein höheres Rating zu setzen.
 * Fix: Hover nur für echte Mäuse (pointerType === 'mouse'). Touch-Taps
 * setzen `hoverRating` NICHT, der `click` greift direkt.
 */
function onStarHover(n: number, e: PointerEvent) {
  if (e.pointerType === 'mouse') hoverRating.value = n
}

function onStarLeave(e: PointerEvent) {
  if (e.pointerType === 'mouse') hoverRating.value = 0
}

function selectRating(n: number) {
  rating.value = n
  // Hover-State auf 0, damit die is-active-Logik unmittelbar das neue
  // rating reflektiert (sonst klammert (hoverRating || rating) sich noch am
  // alten Hover-Wert fest, der auf Touch-Devices ggf. stehen bleibt).
  hoverRating.value = 0
}

async function handleSubmit() {
  if (rating.value < 1 || rating.value > 5) {
    showError(t('Feedback.Errors.RatingRequired'))
    return
  }
  if (!message.value.trim()) {
    showError(t('Feedback.Errors.MessageRequired'))
    return
  }
  try {
    await submitFeedback({
      rating: rating.value,
      message: message.value,
      name: name.value,
      email: email.value,
    })
    submitted.value = true
  } catch (err) {
    console.error('Error when sending:', err)
    showError(t('Feedback.Errors.SendFailed'))
  }
}
</script>

<style scoped>
.feedback {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-block: 1.25rem 2rem;
}

.feedback__header > * + * { margin-top: 0.35rem; }

.feedback__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feedback__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feedback__stars {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
}

.feedback__rating-hint {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-default);
  min-height: 1.25rem;
  font-weight: 500;
  /* Näher an den Sternen — wirkt direkt als Rating-Label statt als Nebentext */
  margin-top: -0.25rem;
}

.feedback__rating-hint--fallback {
  color: var(--text-muted);
  font-weight: 400;
  font-size: var(--text-xs);
}

.feedback__star {
  /* Die runde Soft-Fläche rundherum signalisiert "hier kann man tappen",
     auch wenn der User nicht das Stern-Icon exakt trifft.
     Alle Sterne haben konstant den neutralen BG — auch inaktive bei
     aktivem Rating, damit die Tap-Fläche nicht "verschwindet". */
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 0;
  background: color-mix(in oklab, var(--text-default) 5%, transparent);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 180ms, transform 150ms var(--ease-spring), background 150ms;
}

.feedback__star:active { transform: scale(0.9); }
.feedback__star:hover,
.feedback__star:focus-visible {
  background: color-mix(in oklab, var(--color-warning-500) 20%, transparent);
  color: var(--color-warning-600);
}
.feedback__star.is-active {
  /* Aktive Sterne bekommen nur die Farbe, BG bleibt neutral */
  color: var(--color-warning-500);
}

.feedback__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

.feedback__col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

@media (min-width: 560px) {
  .feedback__row { grid-template-columns: 1fr 1fr; }
}

.feedback__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  text-align: center;
}

.feedback__success-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-success-500) 18%, transparent);
  color: var(--color-success-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
