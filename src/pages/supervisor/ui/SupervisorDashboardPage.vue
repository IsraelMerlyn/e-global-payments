<script setup lang="ts">
import {
  ArrowRight,
  RotateCcw,
  Undo2,
} from 'lucide-vue-next'

import AppShell from '@/shared/ui/layout/AppShell.vue'

const modules = [
  {
    title: 'Cancelaciones',
    description:
      'Cancela una transacción mediante su referencia financiera y tarjeta.',
    icon: RotateCcw,
  },
  {
    title: 'Devoluciones',
    description:
      'Aplica la devolución de una operación financiera previamente aprobada.',
    icon: Undo2,
  },
] as const
</script>

<template>
  <AppShell
    title="Panel del Supervisor"
    description="Gestiona cancelaciones y devoluciones autorizadas para tu perfil."
  >
    <section class="grid gap-5 md:grid-cols-2">
      <article
        v-for="moduleItem in modules"
        :key="moduleItem.title"
        class="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.055]"
      >
        <div
          class="grid size-12 place-items-center rounded-2xl border border-violet-400/15 bg-violet-400/10 text-violet-300"
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

            <p class="mt-3 max-w-md leading-6 text-slate-400">
              {{ moduleItem.description }}
            </p>
          </div>

          <ArrowRight
            :size="20"
            class="mt-1 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-300"
            aria-hidden="true"
          />
        </div>

        <div
          class="mt-7 inline-flex rounded-full border border-white/8 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-500"
        >
          Disponible en Fase 5
        </div>
      </article>
    </section>
  </AppShell>
</template>