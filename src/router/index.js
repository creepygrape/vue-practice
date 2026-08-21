import NotFoundView from '@/views/NotFoundView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/WeatherHomeView.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
      props: true,
    },
    {
      path: '/basics',
      name: 'Basic',
      component: () => import('../views/PracticeView.vue'),
    },
    {
      path: '/components',
      name: 'Component',
      component: () => import('../views/ComponentView.vue'),
    },
    {
      path: '/libraries',
      name: 'Library',
      component: () => import('../views/LibraryView.vue'),
    },
    // Not Found
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

export default router
