<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-vue-next'
import { computed } from 'vue'

import { useToastStore } from '@/shared/model/toast.store'

const toastStore = useToastStore()

const toasts = computed(() => toastStore.toasts)

function getIcon(variant: string) {
  switch (variant) {
    case 'success':
      return CheckCircle2
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
    default:
      return Info
  }
}

function getIconClass(variant: string) {
  switch (variant) {
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-amber-500'
    default:
      return 'text-blue-500'
  }
}
</script>

<template>
  <div
    class="fixed top-6 right-6 z-50 flex w-full max-w-md flex-col gap-3 px-4 sm:px-0"
    role="region"
    aria-live="polite"
    aria-label="Notificaciones"
  >
    <TransitionGroup
      name="toast"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-active-class="transition duration-300 ease-out"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-from-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl backdrop-blur-md"
      >
        <div class="flex items-start gap-3 w-full">
          <div class="mt-0.5 shrink-0">
            <component
              :is="getIcon(toast.variant)"
              :class="getIconClass(toast.variant)"
              :size="20"
              aria-hidden="true"
            />
          </div>

          <div class="flex-1">
            <h3 class="text-sm font-semibold text-white leading-5">
              {{ toast.title }}
            </h3>

            <p
              v-if="toast.status"
              class="mt-1 text-xs font-semibold text-slate-500"
            >
              HTTP {{ toast.status }}
            </p>

            <p class="mt-1 text-sm text-slate-400 leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <button
            type="button"
            class="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-700"
            :aria-label="'Cerrar notificación ' + toast.title"
            @click="toastStore.dismiss(toast.id)"
          >
            <X :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-move {
  transition: transform 0.3s ease;
}
</style>
