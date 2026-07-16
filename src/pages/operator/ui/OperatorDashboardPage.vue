<script setup lang="ts">
import {
  ArrowRight,
  CreditCard,
  ListChecks,
} from 'lucide-vue-next'

import AppShell from '@/shared/ui/layout/AppShell.vue'

const modules = [
  {
    title: 'Nueva venta',
    description:
      'Captura una operación y protege los datos sensibles mediante AES.',
    status: 'Fase 3',
    icon: CreditCard,
  },
  {
    title: 'Consulta de transacciones',
    description:
      'Visualiza, filtra y consulta las operaciones aprobadas.',
    status: 'Fase 4',
    icon: ListChecks,
  },
] as const
</script>

<template>
  <AppShell
    title="Panel del Operador"
    description="Administra ventas y consulta las transacciones permitidas para tu perfil."
  >
    <section class="grid gap-5 md:grid-cols-2">
      <article
        v-for="moduleItem in modules"
        :key="moduleItem.title"
        class="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-400/25 hover:bg-white/[0.055]"
      >
        <div
          class="grid size-12 place-items-center rounded-2xl border border-brand-400/15 bg-brand-400/10 text-brand-300"
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
            class="mt-1 text-slate-600 transition group-hover:translate-x-1 group-hover:text-brand-300"
            aria-hidden="true"
          />
        </div>

        <div
          class="mt-7 inline-flex rounded-full border border-white/8 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-500"
        >
          Disponible en {{ moduleItem.status }}
        </div>
      </article>
    </section>
  </AppShell>
</template>