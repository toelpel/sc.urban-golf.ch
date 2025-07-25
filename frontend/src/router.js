import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        title: 'General.Home'
      }
    },
    {
      path: '/feedback',
      name: 'Feedback',
      component: () => import('./views/Feedback.vue'),
      meta: {
        title: 'General.Feedback',
        parent: 'Home'
      }
    },
    {
      path: '/roadmap',
      name: 'Roadmap',
      component: () => import('./views/Roadmap.vue'),
      meta: {
        title: 'General.Roadmap',
        parent: 'Home'
      }
    },
    {
      path: '/games',
      name: 'GamesList',
      component: () => import('./views/Games.vue'),
      meta: {
        title: 'General.Games',
        parent: 'Home'
      }
    },
    {
      path: '/games/new/:gameId?',
      name: 'GamesNew',
      component: () => import('./views/GamesNew.vue'),
      meta: {
        title: 'General.NewGame',
        parent: 'Home'
      }
    },
    {
      path: '/games/:gameId',
      name: 'GamesDetail',
      component: () => import('./views/Games.vue'),
      meta: {
        title: 'General.Scorecard',
        parent: 'GamesList'
      }
    },
    {
      path: '/Games/:gameId/:holeId',
      name: 'GamesHole',
      component: () => import('./views/Games.vue'),
      meta: {
        title: 'General.Hole',
        parent: 'GamesDetail'
      }
    }
  ]
})

export default router