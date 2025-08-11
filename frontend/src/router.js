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
      path: '/about',
      name: 'About',
      component: () => import('./views/About.vue'),
      meta: {
        title: 'About.Title',
        parent: 'Home',
        hideFromBreadcrumb: true
      },
      children: [
        {
          path: '',
          name: 'AboutHome',
          component: () => import('./components/AboutHome.vue'),
          meta: {
            title: 'About.Title',
            parent: 'About'
          }
        },
        {
          path: 'roadmap',
          name: 'Roadmap',
          component: () => import('./components/Roadmap.vue'),
          meta: {
            title: 'About.Roadmap.Title',
            parent: 'AboutHome'
          }
        },
        {
          path: 'changelog',
          name: 'ChangeLog',
          component: () => import('./components/ChangeLog.vue'),
          meta: {
            title: 'About.ChangeLog.Title',
            parent: 'AboutHome'
          }
        }
      ]
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