<script setup lang="ts">
import {
  ArrowRight,
  XCircle,
  RotateCcw,
} from 'lucide-vue-next'

import AppShell from '@/shared/ui/layout/AppShell.vue'

const modules = [
  {
    title: 'Cancelaciones',
    description:
      'Cancela una transacción mediante su referencia financiera y tarjeta.',
    routeName: 'supervisor-cancellations',
    icon: XCircle,
  },
  {
    title: 'Devoluciones',
    description:
      'Aplica la devolución de una operación financiera previamente aprobada.',
    routeName: 'supervisor-refunds',
    icon: RotateCcw,
  },
] as const
</script>

<template>
  <AppShell
    title="Panel del Supervisor"
    description="Gestiona cancelaciones y devoluciones autorizadas para tu perfil."
  >
    <section class="grid gap-5 md:grid-cols-2">
      <router-link
        v-for="moduleItem in modules"
        :key="moduleItem.title"
        :to="{ name: moduleItem.routeName }"
        class="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-500/25 hover:bg-slate-850 block"
      >
        <div
          class="grid size-12 place-items-center rounded-2xl border border-violet-550/15 bg-violet-550/10 text-violet-500"
        >
          <component
            :is="moduleItem.icon"
            :size="22"
            :stroke-width="1.8"
            aria-hidden="true"
          />
        </div>

        <div class="mt-7 flex items-start justify-between gap-5">
          <div>
            <p class="text-xl font-semibold text-white">
              {{ moduleItem.title }}
            </p>

            <p class="mt-3 max-w-md leading-6 text-slate-455">
              {{ moduleItem.description }}
            </p>
          </div>

          <ArrowRight
            :size="20"
            class="mt-1 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-500"
            aria-hidden="true"
          />
        </div>

        <div
          class="mt-7 inline-flex rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400"
        >
          Ingresar al módulo
        </div>
      </router-link>
    </section>
  </AppShell>
</template>