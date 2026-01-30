import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import AlgoPlayground from '../pages/AlgoPlayground.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/playground', name: 'playground', component: AlgoPlayground },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
