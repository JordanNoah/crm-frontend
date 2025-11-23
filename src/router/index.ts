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
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/app/customer/index.vue'),
        redirect: { name: 'CustomersDashboard' },
        children: [
          {
            path: 'dashboard',
            name: 'CustomersDashboard',
            component: () => import('@/views/app/customer/dashboard.vue'),
          },
          {
            path: 'form/:uuid?',
            name: 'CreateCustomer',
            component: () => import('@/views/app/customer/form.vue'),
          }
        ]
      },
      {
        path: 'roles-permissions',
        name: 'RolesPermissions',
        component: () => import('@/views/app/rolesPermission/index.vue'),
        children: [
          {
            path: 'dashboard',
            name: 'RolesPermissionsDashboard',
            component: () => import('@/views/app/rolesPermission/dashboard.vue'),
          },
          {
            path: 'form/:uuid?',
            name: 'RolesPermissionsForm',
            component: () => import('@/views/app/rolesPermission/form.vue'),
          }
        ]
      },
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
      },
      {
        path: 'headquart',
        name: 'Headquart',
        component: () => import('@/views/app/headquart/index.vue'),
        children: [
          {
            path: 'dashboard',
            name: 'HeadquarterDashboard',
            component: () => import('@/views/app/headquart/dashboard.vue'),
          },
          {
            path: 'form/:uuid?',
            name: 'HeadquarterEdit',
            component: () => import('@/views/app/headquart/form.vue'),
            props: true,
          }
        ]
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/app/user/index.vue'),
        children: [
          {
            path: 'dashboard',
            name: 'UsersDashboard',
            component: () => import('@/views/app/user/dashboard.vue'),
          },
          {
            path: 'form/:uuid',
            name: 'UsersForm',
            component: () => import('@/views/app/user/form.vue'),
            props: true,
          }
        ]
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/app/product/index.vue'),
        children: [
          {
            path: 'dashboard',
            name: 'ProductDashboard',
            component: () => import('@/views/app/product/dashboard.vue'),
          },
          {
            path: 'form/:uuid',
            name: 'ProductForm',
            component: () => import('@/views/app/product/form.vue'),
          },
        ]
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/app/chat.vue')
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
