<template>
    <!-- Top-Navigation: Desktop -->
    <div class="hidden md:flex items-center gap-3">
        <router-link to="/games/new" class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === '/games/new' }">
            🆕 {{ $t('General.NewGame') }}
        </router-link>
        <router-link to="/games" class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === '/games' }">
            📋 {{ $t('General.Games') }}
        </router-link>
        <router-link to="/feedback" class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === '/feedback' }">
            💬 {{ $t('General.Feedback') }}
        </router-link>

        <div class="flex items-center gap-2 ml-2">
            <button @click="setLanguage('de')" :class="langButtonClass('de')">🇩🇪</button>
            <button @click="setLanguage('en')" :class="langButtonClass('en')">🇬🇧</button>
            <button @click="setLanguage('fr')" :class="langButtonClass('fr')">🇫🇷</button>
            <button @click="setLanguage('nl')" :class="langButtonClass('nl')">🇳🇱</button>
        </div>

        <button @click="toggleDark" class="text-2xl ml-3 hover:scale-110 transition">
            {{ isDark ? '☀️' : '🌙' }}
        </button>
    </div>

    <!-- Mobile Menus: Language + Burger grouped -->
    <div class="md:hidden flex items-center gap-0.5 relative">
        <!-- Language Menu -->
        <div ref="langMenuWrapper" class="relative">
            <button @click="isLangOpen = !isLangOpen" class="icon-button">🌐</button>
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
            <button @click="isOpen = !isOpen" class="icon-button">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <transition name="fade-slide">
                <div v-if="isOpen"
                    class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/10 text-sm dark:bg-gray-800 dark:text-white">
                    <router-link to="/games/new" class="dropdown-item"
                        :class="{ 'dropdown-item--active': $route.path === '/games/new' }" @click="isOpen = false">
                        🆕 {{ $t('General.NewGame') }}
                    </router-link>
                    <router-link to="/games" class="dropdown-item"
                        :class="{ 'dropdown-item--active': $route.path === '/games' }" @click="isOpen = false">
                        📋 {{ $t('General.Games') }}
                    </router-link>
                    <router-link to="/feedback" class="dropdown-item"
                        :class="{ 'dropdown-item--active': $route.path === '/feedback' }" @click="isOpen = false">
                        💬 {{ $t('General.Feedback') }}
                    </router-link>
                    <button class="dropdown-item" @click="toggleDark">
                        {{ isDark ? '☀️ Lightmode' : '🌙 Darkmode' }}
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

// Refs für Menü
const isOpen = ref(false)
const isLangOpen = ref(false)
const isDark = ref(false)
const menuWrapper = ref(null)
const langMenuWrapper = ref(null)

const languages = {
    de: { label: 'Deutsch', flag: '🇩🇪' },
    en: { label: 'English', flag: '🇬🇧' },
    fr: { label: 'Français', flag: '🇫🇷' },
    nl: { label: 'Nederlands', flag: '🇳🇱' },
}

function langButtonClass(code) {
    return `text-xl transition-opacity ${locale.value === code ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`
}

function setLanguage(lang) {
    locale.value = lang
    localStorage.setItem('language', lang)
}

function toggleDark() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function handleClickOutside(event) {
    if (menuWrapper.value && !menuWrapper.value.contains(event.target)) isOpen.value = false
    if (langMenuWrapper.value && !langMenuWrapper.value.contains(event.target)) isLangOpen.value = false
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)

    // Theme initialisieren
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
    document.documentElement.classList.toggle('dark', isDark.value)

    // Sprache initialisieren
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