import { createRouter, createWebHistory } from 'vue-router';

// Automatischer Import aller Views
const staticRoutes = Object.entries(import.meta.glob('./views/*.vue', { eager: true }))
  .map(([path, component]) => {
    const fileName = path.split('/').pop().replace('.vue', '');
    const name = fileName;

    const routePath = fileName === 'Home' ? '/' : `/${fileName.toLowerCase()}`;

    return {
      path: routePath,
      name, // <--- hier wird der Name hinzugefügt!
      component: component.default
    };
  });

// Manuell ergänzte, dynamische Routen
const dynamicRoutes = [
  {
    path: '/scorecard/:id',
    component: () => import('./views/Scorecard.vue')
  },
  {
    path: '/hole/:gameId/:hole',
    component: () => import('./views/HoleView.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/new/'),
  routes: [...staticRoutes, ...dynamicRoutes]
});

export default router;