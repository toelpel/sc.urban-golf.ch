import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/new/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/feedback',
      name: 'Feedback',
      component: () => import('./views/Feedback.vue'),
      meta: {
        title: 'Feedback',
        parent: 'Home'
      }
    },
    {
      path: '/games',
      name: 'GamesList',
      component: () => import('./views/Games.vue'),
      meta: {
        title: 'Spiele',
        parent: 'Home'
      }
    },
    {
      path: '/games/new',
      name: 'GamesNew',
      component: () => import('./views/GamesNew.vue'),
      meta: {
        title: 'Neues Spiel',
        parent: 'Home'
      }
    },
    {
      path: '/games/:gameId',
      name: 'GamesDetail',
      component: () => import('./views/Games.vue'),
      meta: {
        title: 'Scorecard',
        parent: 'GamesList'
      }
    },
    {
      path: '/Games/:gameId/:holeId',
      name: 'GamesHole',
      component: () => import('./views/Games.vue'),
      meta: {
        title: 'Loch',
        parent: 'GamesDetail'
      }
    }
  ]
})

export default router