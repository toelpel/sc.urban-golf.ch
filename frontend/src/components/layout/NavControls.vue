<template>
    <!-- Top-Navigation: Desktop -->
    <div class="hidden md:flex items-center gap-3">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === item.to }">
            {{ item.icon }} {{ $t(item.label) }}
        </router-link>

        <div class="flex items-center gap-2 ml-2">
            <button v-for="(lang, code) in languages" :key="code"
                @click="setLanguage(code)" :class="langButtonClass(code)" :aria-label="lang.label">
                {{ lang.flag }}
            </button>
        </div>

        <button @click="toggleDark" class="text-2xl ml-3 hover:scale-110 transition" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            {{ isDark ? '☀️' : '🌙' }}
        </button>
    </div>

    <!-- Mobile Menus: Language + Burger grouped -->
    <div class="md:hidden flex items-center gap-0.5 relative">
        <!-- Language Menu -->
        <div ref="langMenuWrapper" class="relative">
            <button @click="isLangOpen = !isLangOpen" class="icon-button" aria-label="Change language">🌐</button>
            <transition name="fade-slide">
                <div v-if="isLangOpen"
                    class="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-lg ring-1 ring-black/10 text-sm dark:bg-gray-800 dark:text-white">
                    <button v-for="(lang, code) in languages" :key="code"
                        @click="() => { setLanguage(code); isLangOpen = false }" class="dropdown-item"
                        :class="{ 'dropdown-item--active': locale === code }">
                        {{ lang.flag }} {{ lang.label }}
                    </button>
                </div>
            </transition>
        </div>

        <!-- Burger Menu -->
        <div ref="menuWrapper" class="relative">
            <button @click="isOpen = !isOpen" class="icon-button" aria-label="Open menu">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <transition name="fade-slide">
                <div v-if="isOpen"
                    class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/10 text-sm dark:bg-gray-800 dark:text-white">
                    <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="dropdown-item"
                        :class="{ 'dropdown-item--active': $route.path === item.to }" @click="isOpen = false">
                        {{ item.icon }} {{ $t(item.label) }}
                    </router-link>
                    <button class="dropdown-item" @click="toggleDark">
                        {{ isDark ? '☀️ Lightmode' : '🌙 Darkmode' }}
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

const navItems = [
    { to: '/games/new', icon: '🆕', label: 'General.NewGame' },
    { to: '/games', icon: '📋', label: 'General.Games' },
    { to: '/feedback', icon: '💬', label: 'General.Feedback' },
    { to: '/about', icon: '👥', label: 'About.Title' },
]

const isOpen = ref(false)
const isLangOpen = ref(false)
const isDark = ref(false)
const menuWrapper = ref<HTMLElement | null>(null)
const langMenuWrapper = ref<HTMLElement | null>(null)

const languages: Record<string, { label: string; flag: string }> = {
    de: { label: 'Deutsch', flag: '🇩🇪' },
    en: { label: 'English', flag: '🇬🇧' },
    fr: { label: 'Français', flag: '🇫🇷' },
    nl: { label: 'Nederlands', flag: '🇳🇱' },
}

function langButtonClass(code: string) {
    return `text-xl transition-opacity ${locale.value === code ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`
}

function setLanguage(lang: string) {
    locale.value = lang
    localStorage.setItem('language', lang)
}

function toggleDark() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function handleClickOutside(event: MouseEvent) {
    if (menuWrapper.value && !menuWrapper.value.contains(event.target as Node)) isOpen.value = false
    if (langMenuWrapper.value && !langMenuWrapper.value.contains(event.target as Node)) isLangOpen.value = false
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)

    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
    document.documentElement.classList.toggle('dark', isDark.value)

    const savedLang = localStorage.getItem('language')
    if (savedLang) locale.value = savedLang
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
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
