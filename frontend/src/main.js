import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/global.css';
import axios from 'axios';
import { createI18n } from 'vue-i18n';

// Sprachdateien importieren
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';

// Axios konfigurieren
axios.defaults.baseURL = import.meta.env.VITE_API_BASEURL;
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

import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    showUpdateToast();
  },
  onOfflineReady() {
    console.log('App ready for offline usage.');
  }
});

function showUpdateToast() {
  const toast = document.createElement('div');
  toast.className = `
    fixed bottom-4 left-1/2 transform -translate-x-1/2
    bg-gray-800 text-white px-4 py-3 rounded-2xl shadow-lg z-50
    flex items-center space-x-4 animate-fade-in
  `;
  toast.innerHTML = `
    <span class="text-sm">🔄 Neue Version verfügbar.</span>
    <button class="ml-auto text-sm underline hover:text-gray-300">Neu laden</button>
  `;

  const button = toast.querySelector('button');
  button.addEventListener('click', () => {
    updateSW(true); // aktiviert neuen Service Worker & lädt neu
  });

  document.body.appendChild(toast);

  // Optional: nach 20 Sekunden automatisch entfernen
  setTimeout(() => {
    toast.remove();
  }, 20000);
}