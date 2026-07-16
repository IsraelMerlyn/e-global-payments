<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  cleanCardNumber,
  formatCardNumber,
  maskCardNumber,
  validateLuhn,
} from '@/features/sales/lib/card-utils'
import {
  processCancellation,
  processRefund,
} from '../api/transaction-operations.api'
import { useToastStore } from '@/shared/model/toast.store'
import { normalizeApiError } from '@/shared/api/api-error'
import { LoaderCircle, CheckCircle, ShieldAlert, CreditCard, Key } from 'lucide-vue-next'

const props = defineProps<{
  operation: 'cancellation' | 'refund'
}>()

const toastStore = useToastStore()

const isCancellation = computed(() => props.operation === 'cancellation')
const title = computed(() => (isCancellation.value ? 'Nueva Cancelación' : 'Nueva Devolución'))
const operationName = computed(() => (isCancellation.value ? 'Cancelación' : 'Devolución'))

// Form State
const financialReference = ref('')
const rawCardNumber = ref('')
const isCardFocused = ref(false)

const isSubmitting = ref(false)
const showConfirmModal = ref(false)
const showReceipt = ref(false)

// Receipt Data
const receiptData = ref<{
  approvalNumber: string
  financialReference: string
  maskedCard: string
  status: string
  dateTime: string
} | null>(null)

// Errors
const errors = ref({
  financialReference: '',
  cardNumber: '',
})

// Visual card getter/setter for masking on blur
const displayCardValue = computed({
  get() {
    if (isCardFocused.value) {
      return rawCardNumber.value
    } else {
      return maskCardNumber(rawCardNumber.value)
    }
  },
  set(val) {
    rawCardNumber.value = cleanCardNumber(val)
  },
})

function handleReferenceInput(e: Event) {
  const target = e.target as HTMLInputElement
  financialReference.value = target.value.replace(/\D/g, '').slice(0, 8)
  errors.value.financialReference = ''
}

function handleCardInput(e: Event) {
  const target = e.target as HTMLInputElement
  displayCardValue.value = target.value
  errors.value.cardNumber = ''
}

function validateForm(): boolean {
  let isValid = true
  errors.value = {
    financialReference: '',
    cardNumber: '',
  }

  // Financial Reference
  const refVal = financialReference.value.trim()
  if (!refVal) {
    errors.value.financialReference = 'La referencia financiera es obligatoria'
    isValid = false
  } else if (refVal.length !== 8) {
    errors.value.financialReference = 'La referencia financiera debe tener exactamente 8 dígitos'
    isValid = false
  }

  // Card Number
  const cardVal = rawCardNumber.value.trim()
  if (!cardVal) {
    errors.value.cardNumber = 'El número de tarjeta es obligatorio'
    isValid = false
  } else if (cardVal.length < 13 || cardVal.length > 19) {
    errors.value.cardNumber = 'La tarjeta debe tener entre 13 y 19 dígitos'
    isValid = false
  } else if (!validateLuhn(cardVal)) {
    errors.value.cardNumber = 'Número de tarjeta inválido (Luhn fallido)'
    isValid = false
  }

  return isValid
}

function handleFormSubmit() {
  if (!validateForm()) return
  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
}

async function confirmSubmit() {
  closeConfirmModal()
  if (isSubmitting.value) return
  isSubmitting.value = true

  const payload = {
    financialReference: financialReference.value,
    cardNumber: rawCardNumber.value,
  }

  try {
    let response
    if (isCancellation.value) {
      response = await processCancellation(payload)
    } else {
      response = await processRefund(payload)
    }

    toastStore.success(
      `${operationName.value} aprobada`,
      'La operación fue procesada correctamente',
      200,
    )

    receiptData.value = {
      approvalNumber: response.approvalNumber,
      financialReference: response.financialReference,
      maskedCard: response.maskedCard,
      status: response.status,
      dateTime: new Date().toLocaleString(),
    }

    financialReference.value = ''
    rawCardNumber.value = ''
    showReceipt.value = true
  } catch (error: any) {
    const apiError = normalizeApiError(error)
    toastStore.error(
      `${operationName.value} rechazada`,
      apiError.message || 'La operación no pudo ser procesada',
      apiError.status || 400,
    )
  } finally {
    isSubmitting.value = false
  }
}

function handleReset() {
  showReceipt.value = false
  receiptData.value = null
}

const maskedCardForConfirm = computed(() => {
  return maskCardNumber(rawCardNumber.value)
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
    <Transition name="page" mode="out-in">
      <!-- Receipt / Comprobante -->
      <div v-if="showReceipt && receiptData" class="space-y-6">
        <div class="flex items-center gap-3 border-b border-slate-850 pb-5">
          <div class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle :size="24" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-xl font-semibold text-white">Comprobante de {{ operationName }}</h2>
            <p class="text-xs text-slate-500">Operación autorizada exitosamente</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
            <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Estado</p>
            <span class="mt-1.5 inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
              {{ receiptData.status }}
            </span>
          </div>

          <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
            <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Número de Aprobación</p>
            <p class="mt-1.5 text-sm font-mono font-semibold text-white">{{ receiptData.approvalNumber }}</p>
          </div>

          <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
            <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Referencia Financiera</p>
            <p class="mt-1.5 text-sm font-mono font-semibold text-white">{{ receiptData.financialReference }}</p>
          </div>

          <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
            <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Tarjeta enmascarada</p>
            <p class="mt-1.5 text-sm font-mono font-semibold text-white">{{ receiptData.maskedCard }}</p>
          </div>

          <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40 sm:col-span-2">
            <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Fecha y Hora Local</p>
            <p class="mt-1.5 text-sm font-semibold text-white">{{ receiptData.dateTime }}</p>
          </div>
        </div>

        <button
          type="button"
          class="w-full h-12 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
          @click="handleReset"
        >
          Realizar otra operación
        </button>
      </div>

      <!-- Operation Form -->
      <form v-else class="space-y-6" @submit.prevent="handleFormSubmit" novalidate>
        <h2 class="text-lg font-semibold text-white border-b border-slate-850 pb-3 flex items-center gap-2">
          <Key class="text-violet-500" :size="18" />
          {{ title }}
        </h2>

        <!-- Financial Reference -->
        <div>
          <label for="financialReference" class="mb-2 block text-sm font-medium text-slate-300">
            Referencia Financiera (8 dígitos)
          </label>
          <input
            id="financialReference"
            :value="financialReference"
            type="text"
            inputmode="numeric"
            placeholder="Ingresa los 8 dígitos"
            required
            :aria-invalid="errors.financialReference ? 'true' : 'false'"
            aria-describedby="ref-error"
            :disabled="isSubmitting"
            @input="handleReferenceInput"
            class="h-13 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
          <p
            v-if="errors.financialReference"
            id="ref-error"
            class="mt-1.5 text-xs text-red-500"
            role="alert"
          >
            {{ errors.financialReference }}
          </p>
        </div>

        <!-- Card Number -->
        <div>
          <label for="cardNumber" class="mb-2 block text-sm font-medium text-slate-300">
            Número de Tarjeta
          </label>
          <div class="relative">
            <CreditCard :size="18" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="cardNumber"
              :value="displayCardValue"
              type="text"
              inputmode="numeric"
              placeholder="0000 0000 0000 0000"
              required
              :aria-invalid="errors.cardNumber ? 'true' : 'false'"
              aria-describedby="card-error"
              :disabled="isSubmitting"
              @focus="isCardFocused = true"
              @blur="isCardFocused = false"
              @input="handleCardInput"
              class="h-13 w-full rounded-2xl border border-slate-800 bg-slate-950 pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />
          </div>
          <p
            v-if="errors.cardNumber"
            id="card-error"
            class="mt-1.5 text-xs text-red-500"
            role="alert"
          >
            {{ errors.cardNumber }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full h-13 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500 disabled:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <LoaderCircle v-if="isSubmitting" :size="18" class="animate-spin" aria-hidden="true" />
          <span>{{ isSubmitting ? 'Procesando...' : 'Aplicar ' + operationName }}</span>
        </button>
      </form>
    </Transition>

    <!-- Confirmation Modal / Dialog -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3 border-b border-slate-850 pb-3 text-violet-400">
          <ShieldAlert :size="24" />
          <h3 id="confirm-modal-title" class="text-lg font-semibold text-white">
            Confirmar {{ operationName }}
          </h3>
        </div>

        <p class="text-sm text-slate-450 leading-relaxed">
          ¿Estás seguro de aplicar la {{ operationName.toLowerCase() }} transaccional para los siguientes datos?
        </p>

        <div class="rounded-xl bg-slate-950 p-4 border border-slate-800/40 text-sm space-y-2.5">
          <div class="flex justify-between">
            <span class="text-slate-500">Operación:</span>
            <span class="text-white font-semibold">{{ operationName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Referencia Financiera:</span>
            <span class="font-mono text-white font-semibold">{{ financialReference }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Tarjeta enmascarada:</span>
            <span class="font-mono text-white font-semibold">{{ maskedCardForConfirm }}</span>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            class="flex-1 h-11 rounded-xl border border-slate-800 bg-slate-950 text-sm font-semibold text-slate-400 hover:bg-slate-900 transition"
            @click="closeConfirmModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="flex-1 h-11 rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-950/40"
            @click="confirmSubmit"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
