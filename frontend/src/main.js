import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style.css';
import './assets/global.css';
import axios from 'axios';
import { createI18n } from 'vue-i18n';

// Sprachdateien importieren
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';

// Axios konfigurieren
axios.defaults.baseURL = 'https://api.sc.urban-golf.ch/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// i18n initialisieren
const i18n = createI18n({
  legacy: false, // Composition API
  locale: navigator.language.startsWith('de') ? 'de' : 'en',
  fallbackLocale: 'en',
  messages: { de, en, fr, nl },
});

createApp(App)
  .use(router)
  .use(i18n)
  .mount('#app');