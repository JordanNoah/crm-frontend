import { useSessionStore } from '@/stores/session';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/auth',
    name: 'Auth',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/register.vue')
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/auth/forgot.vue')
      }
    ]
  },
  {
    path: '/app',
    name: 'App',
    component: () => import('@/views/app/index.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'plugins',
        name: 'Plugins',
        component: () => import('@/views/app/plugin.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/app/profile.vue')
      },
      {
        path: 'phone-plugin',
        name: 'PhonePlugin',
        component: () => import('@/views/app/phone-plugin.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: { name: 'App' }
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {  
  const isAuthenticated = useSessionStore().isAuthenticated;
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    next({ name: 'App' });
    return;
  }
  if (to.name !== 'Login' && to.name !== 'Register' && !isAuthenticated) {
    next({ name: 'Login' });
    return;
  }
  next()
})

export default router
