import { PageName } from '@/utils/_Constants';
import { createRouter, createWebHistory } from 'vue-router';
import SplashScreen from '../views/SplashScreen.vue';

const routes = [
  {
    path: '/',
    name: PageName.HOME,
    component: SplashScreen,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
