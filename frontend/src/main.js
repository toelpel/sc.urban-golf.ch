import { createApp } from 'vue';
import { watch } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/global.css';
import axios from 'axios';
import { createI18n } from 'vue-i18n';
import { registerSW } from 'virtual:pwa-register';
import { usePWAUpdate } from './composables/usePWAUpdate';
import { useToast } from './composables/useToast';

// Sprachdateien importieren
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';

// Axios konfigurieren
axios.defaults.baseURL = import.meta.env.VITE_API_BASEURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Axios Response Interceptor: Retry + globales Error-Handling
axios.interceptors.response.use(
  response => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // 4xx: kein Retry, Toast zeigen (ausser 401)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      if (error.response.status !== 401) {
        const { error: showError } = useToast();
        showError(`Fehler ${error.response.status}: ${error.response.data?.error || 'Anfrage fehlgeschlagen'}`);
      }
      return Promise.reject(error);
    }

    // Netzwerkfehler / 5xx: bis zu 2 Retries mit Exponential Backoff
    config._retryCount = (config._retryCount || 0) + 1;
    if (config._retryCount > 2) {
      const { error: showError } = useToast();
      showError('Netzwerkfehler. Bitte Verbindung prüfen.');
      return Promise.reject(error);
    }
    await new Promise(r => setTimeout(r, 500 * Math.pow(2, config._retryCount)));
    return axios(config);
  }
);

// i18n initialisieren
const i18n = createI18n({
  legacy: false,
  locale: navigator.language.startsWith('de') ? 'de' :
          navigator.language.startsWith('fr') ? 'fr' :
          navigator.language.startsWith('nl') ? 'nl' : 'en',
  fallbackLocale: 'en',
  messages: { de, en, fr, nl },
});

createApp(App)
  .use(router)
  .use(i18n)
  .use(createPinia())
  .mount('#app');

// Sync i18n locale to HTML lang attribute
watch(
  () => i18n.global.locale.value,
  (lang) => document.documentElement.setAttribute('lang', lang),
  { immediate: true }
);

// PWA Service Worker registrieren
const { onNeedRefresh } = usePWAUpdate();

const updateSW = registerSW({
  onNeedRefresh() {
    onNeedRefresh(updateSW);
  },
  onOfflineReady() {
    // App ist bereit für Offline-Nutzung
  },
});
