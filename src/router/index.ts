import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import clipboard from '../views/clipboard.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'clipboard',
    component: clipboard,
  },
  {
    path: '/template',
    name: 'template',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "template" */ '../views/template.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
