import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import RegisterView from '@/views/authentication/RegisterView.vue'
import LoginView from '@/views/authentication/LoginView.vue'
import ForgotPassword from '@/views/authentication/ForgotPassword.vue'
import Home from '@/views/app/Home.vue'
import { getAuth } from 'firebase/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
      meta: { requiresGuest: true }
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    }
  ],
  
})

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const user = auth.currentUser

  // Si intenta entrar a login/register estando logueado
  if (to.meta.requiresGuest && user) {
    return next('/home')   // O admin según tu lógica
  }

  // Si intenta entrar a home sin estar logueado
  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  next()
})


export default router
