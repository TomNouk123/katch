import { PageName } from '@/utils/_Constants';
import { createRouter, createWebHistory } from 'vue-router';
import SplashScreen from '../views/SplashScreen.vue';
import SwipeGame from '../views/SwipeGame.vue';
import ResultsPage from '../views/ResultsPage.vue';

const routes = [
  {
    path: '/',
    name: PageName.HOME,
    component: SplashScreen,
  },
  {
    path: '/game',
    name: PageName.SWIPE_GAME,
    component: SwipeGame,
  },
  {
    path: '/results/:groupId',
    name: PageName.RESULTS,
    component: ResultsPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
