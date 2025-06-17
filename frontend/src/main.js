import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style.css';
import './assets/global.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://api.sc.urban-golf.ch/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

createApp(App).use(router).mount('#app');