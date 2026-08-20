import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/WeatherView.vue'),
    },
    {
      path: '/basics',
      name: 'basic',
      component: () => import('../views/PracticeView.vue'),
    },
    {
      path: '/components',
      name: 'component',
      component: () => import('../views/Component.vue'),
    },
  ],
})

export default router
