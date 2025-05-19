import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import NewGame from './views/NewGame.vue';
import Scorecard from './views/Scorecard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/new-game', component: NewGame },
  { path: '/scorecard/:id', component: Scorecard },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});