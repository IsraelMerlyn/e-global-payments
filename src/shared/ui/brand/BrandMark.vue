<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'

import { APP_CONFIG } from '@/shared/config/app'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)
</script>

<template>
  <div class="inline-flex items-center gap-3">
    <div
      class="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-800 bg-blue-600 shadow-lg shadow-blue-950/30"
    >
      <ShieldCheck
        :size="23"
        :stroke-width="1.8"
        class="relative text-white"
        aria-hidden="true"
      />
    </div>

    <div v-if="!compact">
      <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-brand-300 uppercase">
        Secure Operations
      </p>

      <p class="mt-0.5 text-base font-semibold tracking-tight text-white">
        {{ APP_CONFIG.name }}
      </p>
    </div>
  </div>
</template>