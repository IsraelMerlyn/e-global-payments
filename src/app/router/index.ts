import { createRouter, createWebHistory } from 'vue-router'

import { APP_CONFIG } from '@/shared/config/app'

const routes = [
    {
        path: '/',
        redirect: {
            name: 'login',
        },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/pages/auth/ui/LoginPage.vue'),
        meta: {
            title: 'Iniciar sesión',
            requiresAuth: false,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/pages/not-found/ui/NotFoundPage.vue'),
        meta: {
            title: 'Página no encontrada',
            requiresAuth: false,
        },
    },
]

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({
        top: 0,
    }),
})

router.afterEach((to) => {
    const pageTitle = to.meta.title

    document.title = pageTitle
        ? `${pageTitle} | ${APP_CONFIG.name}`
        : APP_CONFIG.defaultTitle
})