<template>
    <h1 class="maintitle">{{ $t('About.Roadmap.Title') }}</h1>
    <div>
        <!-- Feature-Boxen -->
        <div class="relative">
            <svg class="absolute top-0 bottom-0 w-[3px] h-full z-0" viewBox="0 0 1 1000" preserveAspectRatio="none">
                <path d="M0.5 0 V1000" fill="none" stroke="#9ca3af" stroke-width="2" :style="{
                    strokeDasharray: '1000',
                    strokeDashoffset: animateLine ? '0' : '1000',
                    transition: 'stroke-dashoffset 2s ease-out'
                }" />
            </svg>

            <div>
                <div v-for="feature in displayedFeatures" :key="feature.key"
                    v-intersect="(isVisible) => (visibleByKey[feature.key] = isVisible)"
                    class="mb-8 relative pl-10 appear-container"
                    :class="visibleByKey[feature.key] ? 'appear-visible' : 'appear-hidden'">
                    <div class="absolute left-[-15px] top-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-bold"
                        :class="feature.done
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 text-gray-400'">
                        <span v-if="feature.done">✓</span>
                    </div>

                    <div @click="toggleExpanded(feature.key)"
                        class="glass-card glass-card--interactive will-change-backdrop mb-3 isolate">
                        <h3 class="card-title">
                            <component :is="feature.icon" class="card-icon" />
                            {{ $t(`About.Roadmap.Features.${feature.key}.Label`) }}
                        </h3>

                        <transition name="fade">
                            <p v-if="expandedByKey[feature.key]" class="card-desc">
                                {{ $t(`About.Roadmap.Features.${feature.key}.Desc`) }}
                            </p>
                        </transition>
                    </div>
                </div>
            </div>
        </div>

        <!-- Feedback-Box -->
        <div class="mt-8 border-l-4 border-blue-500 pl-6 py-4 bg-blue-100 dark:bg-blue-800/80 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                {{ $t('About.Roadmap.CallToAction.Title') }}
            </h3>
            <p class="text-sm text-indigo-600 dark:text-indigo-200">
                {{ $t('About.Roadmap.CallToAction.Text') }}
                <RouterLink to="/feedback" class="underline hover:text-indigo-800 dark:hover:text-white">
                    {{ $t('About.Roadmap.CallToAction.Link') }}
                </RouterLink>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useScrollToTopButton } from '@/composables/useScrollToTopButton'
import {
    ArrowUpIcon,
    BeakerIcon,
    BookOpenIcon,
    RocketLaunchIcon,
    GlobeAltIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    AdjustmentsHorizontalIcon,
    UsersIcon,
    ComputerDesktopIcon,
    TrophyIcon,
    MapIcon
} from '@heroicons/vue/24/solid'

/**
 * Hinweis:
 * - visible: false blendet ein Feature aus.
 * - Wenn visible nicht gesetzt ist, wird es als true behandelt.
 */
const features = [
    { key: 'TestProd', icon: BeakerIcon, done: true, visible: true },
    { key: 'Documentation', icon: BookOpenIcon, done: true, visible: true },
    { key: 'InitialRelease', icon: RocketLaunchIcon, done: true, visible: true },
    { key: 'OpenSource', icon: GlobeAltIcon, done: false, visible: true },
    { key: 'UserManagement', icon: UserIcon, done: false, visible: true },
    { key: 'CourseManagement', icon: ClipboardDocumentListIcon, done: false, visible: true },
    { key: 'Stats', icon: ChartBarIcon, done: false, visible: true },
    { key: 'DesignImprovements', icon: AdjustmentsHorizontalIcon, done: false, visible: true },
    { key: 'ClubManagement', icon: UsersIcon, done: false, visible: true },
    { key: 'Desktop', icon: ComputerDesktopIcon, done: false, visible: true },
    { key: 'TournamentManagement', icon: TrophyIcon, done: false, visible: false },
    { key: 'TourManagement', icon: MapIcon, done: false, visible: false }
]

// Sichtbare Liste (Default: visible !== false)
const displayedFeatures = computed(() => features.filter(f => f.visible !== false))

// State key-basiert, damit Indizes egal sind
const expandedByKey = reactive({})
const visibleByKey = reactive({})

for (const f of features) {
    expandedByKey[f.key] = false
    visibleByKey[f.key] = false
}

function toggleExpanded(key) {
    expandedByKey[key] = !expandedByKey[key]
}

const animateLine = ref(false)
const { showScrollToTop, scrollToTop } = useScrollToTopButton()

onMounted(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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