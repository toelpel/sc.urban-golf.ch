import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    parent?: string
    hideFromBreadcrumb?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/home/HomePage.vue'),
    meta: {
      title: 'General.Home'
    }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/pages/feedback/FeedbackPage.vue'),
    meta: {
      title: 'General.Feedback',
      parent: 'Home'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/about/AboutPage.vue'),
    meta: {
      title: 'About.Title',
      parent: 'Home',
      hideFromBreadcrumb: true
    },
    children: [
      {
        path: '',
        name: 'AboutHome',
        component: () => import('@/components/about/AboutHome.vue'),
        meta: {
          title: 'About.Title',
          parent: 'About'
        }
      },
      {
        path: 'roadmap',
        name: 'Roadmap',
        component: () => import('@/components/about/Roadmap.vue'),
        meta: {
          title: 'About.Roadmap.Title',
          parent: 'AboutHome'
        }
      },
      {
        path: 'changelog',
        name: 'ChangeLog',
        component: () => import('@/components/about/ChangeLog.vue'),
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
    component: () => import('@/pages/games/GamesPage.vue'),
    meta: {
      title: 'General.Games',
      parent: 'Home'
    }
  },
  {
    path: '/games/new/:gameId?',
    name: 'GamesNew',
    component: () => import('@/pages/games/GamesNewPage.vue'),
    meta: {
      title: 'General.NewGame',
      parent: 'Home'
    }
  },
  {
    path: '/games/:gameId',
    name: 'GamesDetail',
    component: () => import('@/pages/games/GamesPage.vue'),
    meta: {
      title: 'General.Scorecard',
      parent: 'GamesList'
    }
  },
  {
    path: '/games/:gameId/:holeId',
    name: 'GamesHole',
    component: () => import('@/pages/games/GamesPage.vue'),
    meta: {
      title: 'General.Hole',
      parent: 'GamesDetail'
    }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
