<script setup lang="ts">
import { ArrowLeft, FileQuestion } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/pages/auth/model/auth.store'

const authStore = useAuthStore()

const homeRoute = computed(() => {
  if (authStore.isAuthenticated) {
    return { name: authStore.homeRouteName }
  }
  return { name: 'login' }
})
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100"
  >
    <section class="max-w-lg text-center">
      <div
        class="mx-auto grid size-18 place-items-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-400"
      >
        <FileQuestion
          :size="30"
          :stroke-width="1.6"
          aria-hidden="true"
        />
      </div>

      <p
        class="mt-8 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase"
      >
        HTTP 404
      </p>

      <h1 class="mt-3 text-4xl font-semibold tracking-tight text-white">
        Página no encontrada
      </h1>

      <p class="mt-4 leading-7 text-slate-400">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>

      <RouterLink
        :to="homeRoute"
        class="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <ArrowLeft :size="17" />
        Regresar al inicio
      </RouterLink>
    </section>
  </main>
</template>
