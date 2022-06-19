import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import clipboard from '../views/clipboard.vue';
import template from '../views/template/index.vue';
import templateEdit from '../views/template/edit.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'clipboard',
    component: clipboard,
  },
  {
    path: '/template',
    name: 'template',
    component: template,
  },
  {
    path: '/template/:index',
    props: true,
    name: 'template-edit',
    component: templateEdit,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
