<template>
  <div class="min-h-screen text-gray-800 dark:text-white bg-white/40 dark:bg-gray-800/60">
    <BackgroundImage />
    <nav class="sticky top-0 bg-white border-b p-4 shadow-sm z-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 backdrop-blur-md bg-opacity-50 dark:bg-opacity-50">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <router-link to="/" class="font-bold text-xl text-green-700 dark:text-green-300">
          Urban-Golf.ch - ScoreCard
        </router-link>

        <!-- Top-Navigation: Desktop -->
        <div class="hidden md:flex items-center gap-3">
          <router-link
            to="/newgame"
            class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === '/newgame' }"
          >
            🆕 {{ $t('NewGame') }}
          </router-link>
          <router-link
            to="/listgames"
            class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === '/listgames' }"
          >
            📋 {{ $t('Games') }}
          </router-link>
          <router-link
            to="/feedback"
            class="material-nav-link"
            :class="{ 'material-nav-link--active': $route.path === '/feedback' }"
          >
            💬 {{ $t('Feedback') }}
          </router-link>

          <div class="flex items-center gap-2 ml-2">
            <button @click="setLanguage('de')" :class="langButtonClass('de')">🇩🇪</button>
            <button @click="setLanguage('en')" :class="langButtonClass('en')">🇬🇧</button>
            <button @click="setLanguage('fr')" :class="langButtonClass('fr')">🇫🇷</button>
            <button @click="setLanguage('nl')" :class="langButtonClass('nl')">🇳🇱</button>
          </div>

          <button @click="toggleDark" class="text-2xl ml-3 hover:scale-110 transition">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>

        <!-- Mobile Menus: Language + Burger grouped -->
        <div class="md:hidden flex items-center gap-0.5 relative">
          <!-- Language Menu -->
          <div ref="langMenuWrapper" class="relative">
            <button @click="isLangOpen = !isLangOpen" class="icon-button">🌐</button>
            <transition name="fade-slide">
              <div
                v-if="isLangOpen"
                class="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-lg ring-1 ring-black/10 text-sm dark:bg-gray-800 dark:text-white"
              >
                <button
                  v-for="(lang, code) in languages"
                  :key="code"
                  @click="() => { setLanguage(code); isLangOpen = false; }"
                  class="dropdown-item"
                  :class="{ 'dropdown-item--active': locale === code }"
                >
                  {{ lang.flag }} {{ lang.label }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Burger Menu -->
          <div ref="menuWrapper" class="relative">
            <button @click="isOpen = !isOpen" class="icon-button">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <transition name="fade-slide">
              <div
                v-if="isOpen"
                class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/10 text-sm dark:bg-gray-800 dark:text-white"
              >
                <router-link
                  to="/newgame"
                  class="dropdown-item"
                  :class="{ 'dropdown-item--active': $route.path === '/newgame' }"
                  @click="isOpen = false"
                >
                  🆕 {{ $t('NewGame') }}
                </router-link>
                <router-link
                  to="/listgames"
                  class="dropdown-item"
                  :class="{ 'dropdown-item--active': $route.path === '/listgames' }"
                  @click="isOpen = false"
                >
                  📋 {{ $t('Games') }}
                </router-link>
                <router-link
                  to="/feedback"
                  class="dropdown-item"
                  :class="{ 'dropdown-item--active': $route.path === '/feedback' }"
                  @click="isOpen = false"
                >
                  💬 {{ $t('Feedback') }}
                </router-link>
                <button
                  class="dropdown-item"
                  @click="toggleDark"
                >
                  {{ isDark ? '🌙 Darkmode' : '☀️ Lightmode' }}
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-4xl mx-auto px-4 py-3">
      <router-view class="mt-4" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();
import BackgroundImage from './components/BackgroundImage.vue'

function setLanguage(lang) {
  locale.value = lang;
  localStorage.setItem('language', lang); // Sprache merken
}

const isOpen = ref(false);
const isLangOpen = ref(false); // Für Sprachmenü
const isDark = ref(false);

const menuWrapper = ref(null);
const langMenuWrapper = ref(null); // Referenz für Sprachmenü

const languages = {
  de: { label: 'Deutsch', flag: '🇩🇪' },
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  nl: { label: 'Nederlands', flag: '🇳🇱' },
};

function langButtonClass(code) {
  return `text-xl transition-opacity ${locale.value === code ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`;
}

function toggleDark() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}

function handleClickOutside(event) {
  if (menuWrapper.value && !menuWrapper.value.contains(event.target)) {
    isOpen.value = false;
  }
  if (langMenuWrapper.value && !langMenuWrapper.value.contains(event.target)) {
    isLangOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Darkmode-Ladeverhalten
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // 🌐 Sprache laden
  const savedLang = localStorage.getItem('language');
  if (savedLang) {
    locale.value = savedLang;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
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
