import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import RegisterView from '@/views/authentication/RegisterView.vue'
import LoginView from '@/views/authentication/LoginView.vue'
import ForgotPassword from '@/views/authentication/ForgotPassword.vue'
import MainLayout from '@/views/app/MainLayout.vue'
import ClientView from '@/views/users/ClientView.vue'
import Home from '@/views/app/Home.vue'
import ConfiguracionView from '@/views/configuration/ConfiguracionView.vue'
import SimulacionesView from '@/views/simulaciones/SimulacionesView.vue'
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
      path: '/app', // Un prefijo para todas las rutas autenticadas
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'home', // La ruta será /app/home
          name: 'home',
          component: Home,
        },
        {
          path: 'clients', // La ruta será /app/clients
          name: 'clients',
          component: ClientView,
        },
        {
        path: "unidades",
        name: "Unidades",
        component: () => import("../views/unidades/UnidadesView.vue"),
        },
        {
          path: "simulador",
          name: "Simulador",
          component: SimulacionesView
        },
        {
          path: "simulador/nueva",
          name: "SimuladorNueva",
          component: () => import("../views/simulaciones/SimulacionNuevaView.vue"),
        },
        {
          path: "simulador/:id",
          name: "SimuladorDetalle",
          component: () => import("../views/simulaciones/SimulacionDetalleView.vue"),
        },
        {
          path: "simulador/:id/indicadores",
          name: "SimuladorIndicadores",
          component: () => import("../views/simulaciones/IndicadoresView.vue"),
        },
        {
          path: "configuracion",
          name: "Configuracion",
          component: ConfiguracionView,      
        }
    
      ]
    }
  ],
  
})

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const user = auth.currentUser

  if (to.meta.requiresGuest && user) {
    return next('/app/home')   // Redirigir a la nueva ruta de home
  }

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  next()
})


export default router
