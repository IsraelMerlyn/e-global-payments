import {
    createRouter,
    createWebHistory,
    type RouteRecordRaw,
} from 'vue-router'

import { useAuthStore } from '@/pages/auth/model/auth.store'
import { APP_CONFIG } from '@/shared/config/app'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: {
            name: 'login',
        },
    },
    {
        path: '/login',
        name: 'login',
        component: () =>
            import('@/pages/auth/ui/LoginPage.vue'),
        meta: {
            title: 'Iniciar sesión',
            requiresAuth: false,
        },
    },
    {
        path: '/operador',
        name: 'operator-home',
        component: () =>
            import(
                '@/pages/operator/ui/OperatorDashboardPage.vue'
            ),
        meta: {
            title: 'Panel del Operador',
            requiresAuth: true,
            roles: ['Operador'],
        },
    },
    {
        path: '/supervisor',
        name: 'supervisor-home',
        component: () =>
            import(
                '@/pages/supervisor/ui/SupervisorDashboardPage.vue'
            ),
        meta: {
            title: 'Panel del Supervisor',
            requiresAuth: true,
            roles: ['Supervisor'],
        },
    },
    {
        path: '/forbidden',
        name: 'forbidden',
        component: () =>
            import(
                '@/pages/forbidden/ui/ForbiddenPage.vue'
            ),
        meta: {
            title: 'Acceso no autorizado',
            requiresAuth: true,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () =>
            import(
                '@/pages/not-found/ui/NotFoundPage.vue'
            ),
        meta: {
            title: 'Página no encontrada',
            requiresAuth: false,
        },
    },
]

export const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL,
    ),
    routes,

    scrollBehavior: () => ({
        top: 0,
    }),
})

router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (
        to.name === 'login' &&
        authStore.isAuthenticated
    ) {
        return {
            name: authStore.homeRouteName,
        }
    }

    if (
        to.meta.requiresAuth &&
        !authStore.isAuthenticated
    ) {
        return {
            name: 'login',
            query: {
                redirect: to.fullPath,
            },
        }
    }

    if (
        to.meta.roles?.length &&
        authStore.user &&
        !to.meta.roles.includes(
            authStore.user.role,
        )
    ) {
        return {
            name: 'forbidden',
        }
    }

    return true
})

router.afterEach((to) => {
    document.title = to.meta.title
        ? `${to.meta.title} | ${APP_CONFIG.name}`
        : APP_CONFIG.defaultTitle
})