import { createRouter, createWebHistory } from 'vue-router';

// Automatischer Import aller Views
const staticRoutes = Object.entries(import.meta.glob('./views/*.vue', { eager: true }))
  .map(([path, component]) => {
    const name = path
      .split('/')
      .pop()
      .replace('.vue', '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    // Home.vue → /
    const routePath = name === 'home' ? '/' : `/${name}`;

    return {
      path: routePath,
      component: component.default
    };
  });

// Manuell ergänzte, dynamische Routen
const dynamicRoutes = [
  {
    path: '/scorecard/:id',
    component: () => import('./views/Scorecard.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/new/'),
  routes: [...staticRoutes, ...dynamicRoutes]
});

export default router;