<script setup lang="ts">
import { computed } from 'vue'
import { detectCardBrand } from '../lib/card-utils'
import { CreditCard } from 'lucide-vue-next'

const props = defineProps<{
  cardNumber: string
  customerName: string
  expirationDate: string
}>()

const brand = computed(() => detectCardBrand(props.cardNumber))

const displayCardNumber = computed(() => {
  const clean = props.cardNumber.replace(/\D/g, '')
  if (!clean) return '•••• •••• •••• ••••'
  
  let result = ''
  for (let i = 0; i < 16; i++) {
    if (i < clean.length) {
      if (i >= 4 && i < 12) {
        result += '•'
      } else {
        result += clean[i]
      }
    } else {
      result += '•'
    }
  }
  const matches = result.match(/.{1,4}/g)
  return matches ? matches.join(' ') : result
})

const displayExpiration = computed(() => {
  return props.expirationDate || 'MM/AA'
})

const displayName = computed(() => {
  return props.customerName.toUpperCase() || 'NOMBRE DEL TITULAR'
})
</script>

<template>
  <div class="relative w-full max-w-[340px] aspect-[1.586/1] rounded-2xl border border-blue-500/25 bg-blue-600 p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden">
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-3">
        <div class="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-500/30" />
        <CreditCard :size="24" class="text-white/60" />
      </div>
      
      <span class="text-sm font-semibold tracking-wider text-white/90">
        {{ brand }}
      </span>
    </div>

    <div class="mt-4">
      <p class="text-lg font-mono tracking-[0.15em] text-white">
        {{ displayCardNumber }}
      </p>
    </div>

    <div class="flex items-end justify-between">
      <div class="max-w-[200px] truncate">
        <p class="text-[0.6rem] font-semibold text-blue-200 tracking-wider uppercase">
          Titular de la tarjeta
        </p>
        <p class="text-sm font-semibold tracking-wide truncate mt-0.5">
          {{ displayName }}
        </p>
      </div>

      <div class="shrink-0 text-right">
        <p class="text-[0.6rem] font-semibold text-blue-200 tracking-wider uppercase">
          Expira
        </p>
        <p class="text-sm font-mono font-semibold tracking-wider mt-0.5">
          {{ displayExpiration }}
        </p>
      </div>
    </div>
  </div>
</template>
