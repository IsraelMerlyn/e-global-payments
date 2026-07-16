<script setup lang="ts">
import {
  LayoutDashboard,
  CreditCard,
  History,
  XCircle,
  RotateCcw,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useAuthStore } from '@/pages/auth/model/auth.store'
import BrandMark from '@/shared/ui/brand/BrandMark.vue'

defineProps<{
  title: string
  description: string
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)

const roleClass = computed(() => {
  return authStore.user?.role === 'Supervisor'
    ? 'border-violet-500/20 bg-violet-500/10 text-violet-400'
    : 'border-blue-600/20 bg-blue-600/10 text-blue-400'
})

const isSupervisor = computed(() => authStore.user?.role === 'Supervisor')

const activeClass = computed(() => {
  return isSupervisor.value
    ? 'bg-violet-500/10 text-violet-400 border-l-2 border-violet-500 font-semibold'
    : 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-600 font-semibold'
})

const menuItems = computed(() => {
  if (isSupervisor.value) {
    return [
      { name: 'Inicio', routeName: 'supervisor-home', icon: LayoutDashboard },
      { name: 'Cancelaciones', routeName: 'supervisor-cancellations', icon: XCircle },
      { name: 'Devoluciones', routeName: 'supervisor-refunds', icon: RotateCcw },
    ]
  }
  return [
    { name: 'Inicio', routeName: 'operator-home', icon: LayoutDashboard },
    { name: 'Nueva Venta', routeName: 'operator-sales', icon: CreditCard },
    { name: 'Transacciones', routeName: 'operator-transactions', icon: History },
  ]
})

function isRouteActive(routeName: string): boolean {
  return route.name === routeName
}

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-800 bg-slate-900 z-40">
      <div class="flex h-20 items-center px-6 border-b border-slate-800">
        <BrandMark />
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 space-y-1 px-4 py-6" aria-label="Navegación principal">
        <router-link
          v-for="item in menuItems"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition"
          :class="isRouteActive(item.routeName) ? activeClass : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'"
        >
          <component :is="item.icon" :size="18" aria-hidden="true" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- User footer inside sidebar -->
      <div class="border-t border-slate-800 p-4 space-y-4">
        <div class="flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-slate-500 truncate">
              {{ authStore.user?.username }}
            </p>
          </div>
          <div
            :class="roleClass"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold"
          >
            {{ authStore.user?.role }}
          </div>
        </div>

        <button
          type="button"
          class="w-full flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 text-sm font-semibold text-slate-400 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 transition"
          @click="handleLogout"
        >
          <LogOut :size="16" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4">
      <BrandMark />

      <button
        type="button"
        class="grid size-10 place-items-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition"
        :aria-label="isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <X v-if="isMobileMenuOpen" :size="20" aria-hidden="true" />
        <Menu v-else :size="20" aria-hidden="true" />
      </button>
    </header>

    <!-- Mobile Drawer Overlay -->
    <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm" @click="isMobileMenuOpen = false" />

    <!-- Mobile Drawer Menu -->
    <Transition
      enter-from-class="-translate-x-full"
      enter-active-class="transition duration-300 ease-out"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-active-class="transition duration-250 ease-in"
      leave-to-class="-translate-x-full"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 border-r border-slate-800 p-6 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-5">
          <BrandMark />
          <button
            type="button"
            class="grid size-9 place-items-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            @click="isMobileMenuOpen = false"
          >
            <X :size="18" />
          </button>
        </div>

        <nav class="flex-1 space-y-1.5 py-6">
          <router-link
            v-for="item in menuItems"
            :key="item.routeName"
            :to="{ name: item.routeName }"
            class="flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition"
            :class="isRouteActive(item.routeName) ? activeClass : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'"
            @click="isMobileMenuOpen = false"
          >
            <component :is="item.icon" :size="18" aria-hidden="true" />
            {{ item.name }}
          </router-link>
        </nav>

        <div class="border-t border-slate-800 pt-5 space-y-4">
          <div>
            <p class="text-sm font-semibold text-white">{{ authStore.user?.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ authStore.user?.username }}</p>
            <span :class="roleClass" class="inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold mt-2">
              {{ authStore.user?.role }}
            </span>
          </div>

          <button
            type="button"
            class="w-full flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 text-sm font-semibold text-slate-400 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 transition"
            @click="handleLogout"
          >
            <LogOut :size="16" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </Transition>

    <!-- Content Area -->
    <div class="flex-1 flex flex-col md:pl-64 min-w-0">
      <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto">
        <header class="mb-8 border-b border-slate-850 pb-5">
          <p class="text-xs font-semibold tracking-[0.2em] text-slate-550 uppercase">
            Portal transaccional
          </p>

          <h1 class="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
            {{ title }}
          </h1>

          <p class="mt-2 text-sm text-slate-400 leading-relaxed max-w-3xl">
            {{ description }}
          </p>
        </header>

        <slot />
      </main>
    </div>
  </div>
</template>