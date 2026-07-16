<script setup lang="ts">
import {
  LogOut,
  ShieldCheck,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore} from '@/pages/auth/model/auth.store'
import BrandMark from '@/shared/ui/brand/BrandMark.vue'

defineProps<{
  title: string
  description: string
}>()

const router = useRouter()
const authStore = useAuthStore()

const roleClass = computed(() => {
  return authStore.user?.role === 'Supervisor'
    ? 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
})

async function handleLogout(): Promise<void> {
  authStore.logout()

  await router.replace({
    name: 'login',
  })
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header
      class="sticky top-0 z-30 border-b border-white/8 bg-slate-950/85 backdrop-blur-xl"
    >
      <div
        class="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <BrandMark />

        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-medium text-white">
              {{ authStore.user?.name }}
            </p>

            <p class="mt-0.5 text-xs text-slate-500">
              {{ authStore.user?.username }}
            </p>
          </div>

          <div
            :class="roleClass"
            class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold"
          >
            <ShieldCheck
              :size="15"
              aria-hidden="true"
            />

            {{ authStore.user?.role }}
          </div>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-xl border border-white/8 bg-white/5 text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
            aria-label="Cerrar sesión"
            @click="handleLogout"
          >
            <LogOut
              :size="18"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <header class="mb-9">
        <p
          class="text-xs font-semibold tracking-[0.2em] text-brand-300 uppercase"
        >
          Portal transaccional
        </p>

        <h1
          class="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
        >
          {{ title }}
        </h1>

        <p class="mt-3 max-w-2xl leading-7 text-slate-400">
          {{ description }}
        </p>
      </header>

      <slot />
    </main>
  </div>
</template>