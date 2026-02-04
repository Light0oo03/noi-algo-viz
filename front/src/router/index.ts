import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import AlgoPlayground from '../pages/AlgoPlayground.vue';
import LinkedListPlayground from '../pages/LinkedListPlayground.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/playground', name: 'playground', component: AlgoPlayground },
    { path: '/linked-list', name: 'linked-list', component: LinkedListPlayground },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
