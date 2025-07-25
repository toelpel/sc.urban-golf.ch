<template>
    <DefaultTemplate>
        <h1 class="maintitle mb-6">{{ $t('General.Roadmap') }}</h1>

        <div class="max-w-3xl mx-auto px-3 pb-20 relative">
            <!-- ZENTRIERTE SVG-Linie -->
            <svg class="absolute left-[15px] top-0 bottom-0 w-[3px] z-0" viewBox="0 0 1 100" preserveAspectRatio="none">
                <path d="M0.5 0 V100" fill="none" stroke="#9ca3af" stroke-width="2" :style="{
                    strokeDasharray: '1000',
                    strokeDashoffset: animateLine ? '0' : '1000',
                    transition: 'stroke-dashoffset 2s ease-out'
                }" />
            </svg>

            <!-- Feature-Boxen -->
            <div>
                <div v-for="(feature, index) in features" :key="index"
                    v-intersect="(isVisible) => (visible[index] = isVisible)"
                    class="mb-8 relative pl-14 transition-all duration-700 transform"
                    :class="visible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
                    <!-- GROßER Kreis -->
                    <div class="absolute left-[-15px] top-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-bold"
                        :class="feature.done
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 text-gray-400'">
                        <span v-if="feature.done">✓</span>
                    </div>

                    <!-- Card -->
                    <div
                        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-sm hover:scale-[1.015] hover:shadow-md transition">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="text-xl">{{ feature.emoji }}</span>
                            {{ feature.label }}
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                            {{ feature.desc }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Feedback-Box -->
            <div
                class="mt-16 border-l-4 border-blue-500 pl-6 py-6 bg-blue-100 dark:bg-blue-800/80 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                    ✨ Hier könnte dein Feature stehen!
                </h3>
                <p class="text-sm text-indigo-600 dark:text-indigo-200">
                    Hast du eine Idee, was noch fehlt? Teile sie mit uns –
                    <RouterLink to="/feedback" class="underline hover:text-indigo-800 dark:hover:text-white">
                        zum Feedback-Formular
                    </RouterLink>
                    📝
                </p>
            </div>
        </div>

        <!-- Scroll to Top Button -->
        <transition name="fade">
            <button v-if="showScrollToTop" @click="scrollToTop"
                class="fixed bottom-6 right-6 z-50 p-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition">
                <ArrowUpIcon class="h-5 w-5" />
            </button>
        </transition>
    </DefaultTemplate>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
import { useScrollToTopButton } from '@/composables/useScrollToTopButton'
import { ArrowUpIcon } from '@heroicons/vue/24/solid'

const features = [
    {
        emoji: '🧪',
        label: 'Saubere Test/Prod Umgebung',
        desc: 'Getrennte Deployments und Konfiguration',
        done: 1
    },
    {
        emoji: '📖',
        label: 'Dokumentation & Readme',
        desc: 'Setup, Contribution Guide, Techstack',
        done: 1
    },
    {
        emoji: '🚀',
        label: 'Initial Release',
        desc: 'ScoreCard MVP veröffentlicht',
        done: 1
    },
    {
        emoji: '🌍',
        label: 'Open Source',
        desc: 'Code wird öffentlich auf GitHub verfügbar.\nKollaboration sehr erwünscht 🤩',
        done: 0
    },
    {
        emoji: '👤',
        label: 'User-Verwaltung',
        desc: "Registrierung und Login, Implementation von 'Meine Spiele'",
        done: 0
    },
    {
        emoji: '📊',
        label: 'Spieler Statistiken',
        desc: 'Rudimentäre Score-Auswertungen, Rankings und Visualisierungen',
        done: 0
    },
    {
        emoji: '🏌️‍♂️',
        label: 'Club Management',
        desc: 'Erfassung eines Clubs, Hinzufügen von Spielern, Berechtigungsvergabe',
        done: 0
    },
    {
        emoji: '🖥️',
        label: 'Optimierung für Desktop-Clients',
        desc: 'Optimierungen für grössere Screens, Öffentliche Ansicht optimieren',
        done: 0
    },
    {
        emoji: '🏆',
        label: 'Turnier Management',
        desc: 'Erfassung eines Turniers, Anmeldung, Turnier-Leaderboards',
        done: 0
    },
    {
        emoji: '🎯',
        label: 'Tournament Management',
        desc: 'Erfassung einer Tour, Hinterlegen von Tour-Wertungen, Anmeldung zur Tour',
        done: 0
    }
]

const firstTodoIndex = features.findIndex((f) => f.done === 0)
const visible = ref(features.map(() => false))
const animateLine = ref(false)
const { showScrollToTop, scrollToTop } = useScrollToTopButton()

onMounted(() => {
    nextTick(() => {
        animateLine.value = true
    })
})
</script>

<script>
export default {
    directives: {
        intersect: {
            mounted(el, binding) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        binding.value(entry.isIntersecting)
                    },
                    { threshold: 0.1 }
                )
                observer.observe(el)
            }
        }
    }
}
</script>