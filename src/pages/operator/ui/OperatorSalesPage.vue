<script setup lang="ts">
import { ref, computed } from 'vue'
import AppShell from '@/shared/ui/layout/AppShell.vue'
import CardPreview from '@/features/sales/ui/CardPreview.vue'
import {
  cleanCardNumber,
  formatCardNumber,
  maskCardNumber,
  validateLuhn,
  validateExpirationDate,
} from '@/features/sales/lib/card-utils'
import { encryptPaymentData } from '@/features/sales/lib/crypto'
import { processSale } from '@/features/sales/api/sales.api'
import { useToastStore } from '@/shared/model/toast.store'
import { normalizeApiError } from '@/shared/api/api-error'
import { LoaderCircle, CheckCircle, CreditCard, User, Calendar, Lock } from 'lucide-vue-next'

const toastStore = useToastStore()

// State
const amount = ref<number | null>(null)
const customerName = ref('')
const cardNumberInput = ref('')
const expirationInput = ref('')
const cvvInput = ref('')

const isSubmitting = ref(false)
const showReceipt = ref(false)

// Receipt data
const receiptData = ref<{
  status: string
  amount: number
  customerName: string
  approvalNumber: string
  financialReference: string
  maskedCard: string
  dateTime: string
} | null>(null)

// Validation errors
const errors = ref({
  amount: '',
  customerName: '',
  cardNumber: '',
  expirationDate: '',
  cvv: '',
})

// Formatting card number as user types
function handleCardNumberInput(e: Event) {
  const target = e.target as HTMLInputElement
  const raw = target.value
  cardNumberInput.value = formatCardNumber(raw)
  errors.value.cardNumber = ''
}

// Formatting expiration date
function handleExpirationInput(e: Event) {
  const target = e.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  if (value.length > 2) {
    value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
  }
  expirationInput.value = value.slice(0, 5)
  errors.value.expirationDate = ''
}

function handleCvvInput(e: Event) {
  const target = e.target as HTMLInputElement
  cvvInput.value = target.value.replace(/\D/g, '').slice(0, 4)
  errors.value.cvv = ''
}

function validateForm(): boolean {
  let isValid = true
  errors.value = {
    amount: '',
    customerName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
  }

  // Amount
  if (amount.value === null || amount.value === undefined) {
    errors.value.amount = 'El importe es obligatorio'
    isValid = false
  } else if (amount.value <= 0) {
    errors.value.amount = 'El importe debe ser mayor a cero'
    isValid = false
  } else if (amount.value > 999999.99) {
    errors.value.amount = 'El importe máximo es 999,999.99'
    isValid = false
  }

  // Customer Name
  const trimmedName = customerName.value.trim()
  if (!trimmedName) {
    errors.value.customerName = 'El nombre es obligatorio'
    isValid = false
  } else if (trimmedName.length < 3 || trimmedName.length > 80) {
    errors.value.customerName = 'El nombre debe tener entre 3 y 80 caracteres'
    isValid = false
  }

  // Card Number
  const cleanedCard = cleanCardNumber(cardNumberInput.value)
  if (!cleanedCard) {
    errors.value.cardNumber = 'El número de tarjeta es obligatorio'
    isValid = false
  } else if (cleanedCard.length < 13 || cleanedCard.length > 19) {
    errors.value.cardNumber = 'La tarjeta debe tener entre 13 y 19 dígitos'
    isValid = false
  } else if (!validateLuhn(cleanedCard)) {
    errors.value.cardNumber = 'Número de tarjeta inválido (Luhn fallido)'
    isValid = false
  }

  // Expiration Date
  if (!expirationInput.value) {
    errors.value.expirationDate = 'La fecha de expiración es obligatoria'
    isValid = false
  } else if (!validateExpirationDate(expirationInput.value)) {
    errors.value.expirationDate = 'Formato MM/AA inválido o vencida'
    isValid = false
  }

  // CVV
  const cleanedCvv = cvvInput.value.trim()
  if (!cleanedCvv) {
    errors.value.cvv = 'El CVV es obligatorio'
    isValid = false
  } else if (cleanedCvv.length < 3 || cleanedCvv.length > 4) {
    errors.value.cvv = 'El CVV debe tener 3 o 4 dígitos'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (isSubmitting.value) return
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const aesKey = import.meta.env.VITE_AES_KEY_BASE64 || ''
    
    const encryptedData = await encryptPaymentData(
      {
        cardNumber: cleanCardNumber(cardNumberInput.value),
        expirationDate: expirationInput.value,
        cvv: cvvInput.value,
      },
      aesKey,
    )

    const response = await processSale({
      amount: amount.value!,
      customerName: customerName.value.trim(),
      maskedCard: maskCardNumber(cardNumberInput.value),
      paymentData: encryptedData,
    })

    toastStore.success(
      'Venta aprobada',
      'La operación fue procesada correctamente',
      200,
    )

    receiptData.value = {
      status: response.status,
      amount: amount.value!,
      customerName: customerName.value.trim(),
      approvalNumber: response.approvalNumber,
      financialReference: response.financialReference,
      maskedCard: response.maskedCard,
      dateTime: new Date().toLocaleString(),
    }

    cardNumberInput.value = ''
    expirationInput.value = ''
    cvvInput.value = ''
    amount.value = null
    customerName.value = ''
    
    showReceipt.value = true
  } catch (error: any) {
    const apiError = normalizeApiError(error)
    toastStore.error(
      'Venta rechazada',
      apiError.message || 'La operación no pudo ser procesada',
      apiError.status || 400,
    )
    
    cvvInput.value = ''
  } finally {
    isSubmitting.value = false
  }
}

function handleRegisterAnother() {
  showReceipt.value = false
  receiptData.value = null
}

const formattedAmountMXN = computed(() => {
  if (receiptData.value?.amount === undefined) return ''
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(receiptData.value.amount)
})
</script>

<template>
  <AppShell
    title="Nueva Venta"
    description="Captura los datos del pago. La información de la tarjeta se cifrará con AES-GCM de extremo a extremo."
  >
    <div class="grid gap-8 lg:grid-cols-[1fr_340px]">
      <!-- Form or Receipt container -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <Transition name="page" mode="out-in">
          <!-- Receipt / Comprobante -->
          <div v-if="showReceipt && receiptData" class="space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-850 pb-5">
              <div class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle :size="24" aria-hidden="true" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white">Comprobante de Venta</h2>
                <p class="text-xs text-slate-500">Transacción completada exitosamente</p>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Estado</p>
                <span class="mt-1.5 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  {{ receiptData.status }}
                </span>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Importe</p>
                <p class="mt-1.5 text-lg font-bold text-white">{{ formattedAmountMXN }}</p>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Cliente</p>
                <p class="mt-1.5 text-sm font-semibold text-white">{{ receiptData.customerName }}</p>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Tarjeta enmascarada</p>
                <p class="mt-1.5 text-sm font-mono font-semibold text-white">{{ receiptData.maskedCard }}</p>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Número de Aprobación</p>
                <p class="mt-1.5 text-sm font-mono font-semibold text-white">{{ receiptData.approvalNumber }}</p>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Referencia Financiera</p>
                <p class="mt-1.5 text-sm font-mono font-semibold text-white">{{ receiptData.financialReference }}</p>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800/40 sm:col-span-2">
                <p class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Fecha y Hora Local</p>
                <p class="mt-1.5 text-sm font-semibold text-white">{{ receiptData.dateTime }}</p>
              </div>
            </div>

            <button
              type="button"
              class="w-full h-12 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
              @click="handleRegisterAnother"
            >
              Registrar otra venta
            </button>
          </div>

          <!-- Transaction Form -->
          <form v-else class="space-y-6" @submit.prevent="handleSubmit" novalidate>
            <!-- Amount -->
            <div>
              <label for="amount" class="mb-2 block text-sm font-medium text-slate-300">
                Importe (MXN)
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 font-semibold">
                  $
                </div>
                <input
                  id="amount"
                  v-model.number="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  required
                  :aria-invalid="errors.amount ? 'true' : 'false'"
                  aria-describedby="amount-error"
                  :disabled="isSubmitting"
                  class="h-13 w-full rounded-2xl border border-slate-800 bg-slate-950 pr-4 pl-9 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <p
                v-if="errors.amount"
                id="amount-error"
                class="mt-1.5 text-xs text-red-500"
                role="alert"
              >
                {{ errors.amount }}
              </p>
            </div>

            <!-- Customer Name -->
            <div>
              <label for="customerName" class="mb-2 block text-sm font-medium text-slate-300">
                Nombre del Cliente
              </label>
              <div class="relative">
                <User :size="18" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="customerName"
                  v-model="customerName"
                  type="text"
                  placeholder="Nombre de la persona"
                  required
                  :aria-invalid="errors.customerName ? 'true' : 'false'"
                  aria-describedby="customerName-error"
                  :disabled="isSubmitting"
                  class="h-13 w-full rounded-2xl border border-slate-800 bg-slate-950 pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <p
                v-if="errors.customerName"
                id="customerName-error"
                class="mt-1.5 text-xs text-red-500"
                role="alert"
              >
                {{ errors.customerName }}
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
                  :value="cardNumberInput"
                  type="text"
                  inputmode="numeric"
                  placeholder="0000 0000 0000 0000"
                  required
                  :aria-invalid="errors.cardNumber ? 'true' : 'false'"
                  aria-describedby="cardNumber-error"
                  :disabled="isSubmitting"
                  @input="handleCardNumberInput"
                />
              </div>
              <p
                v-if="errors.cardNumber"
                id="cardNumber-error"
                class="mt-1.5 text-xs text-red-500"
                role="alert"
              >
                {{ errors.cardNumber }}
              </p>
            </div>

            <!-- Expiration Date & CVV -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="expirationDate" class="mb-2 block text-sm font-medium text-slate-300">
                  Fecha de Expiración
                </label>
                <div class="relative">
                  <Calendar :size="18" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    id="expirationDate"
                    :value="expirationInput"
                    type="text"
                    placeholder="MM/AA"
                    required
                    :aria-invalid="errors.expirationDate ? 'true' : 'false'"
                    aria-describedby="expirationDate-error"
                    :disabled="isSubmitting"
                    @input="handleExpirationInput"
                    class="h-13 w-full rounded-2xl border border-slate-800 bg-slate-950 pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <p
                  v-if="errors.expirationDate"
                  id="expirationDate-error"
                  class="mt-1.5 text-xs text-red-500"
                  role="alert"
                >
                  {{ errors.expirationDate }}
                </p>
              </div>

              <div>
                <label for="cvv" class="mb-2 block text-sm font-medium text-slate-300">
                  CVV
                </label>
                <div class="relative">
                  <Lock :size="18" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    id="cvv"
                    :value="cvvInput"
                    type="text"
                    inputmode="numeric"
                    placeholder="CVV"
                    required
                    :aria-invalid="errors.cvv ? 'true' : 'false'"
                    aria-describedby="cvv-error"
                    :disabled="isSubmitting"
                    @input="handleCvvInput"
                    class="h-13 w-full rounded-2xl border border-slate-800 bg-slate-950 pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <p
                  v-if="errors.cvv"
                  id="cvv-error"
                  class="mt-1.5 text-xs text-red-500"
                  role="alert"
                >
                  {{ errors.cvv }}
                </p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full h-13 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-xl shadow-blue-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500 disabled:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LoaderCircle v-if="isSubmitting" :size="18" class="animate-spin" aria-hidden="true" />
              <span>{{ isSubmitting ? 'Procesando pago...' : 'Pagar ahora' }}</span>
            </button>
          </form>
        </Transition>
      </div>

      <!-- Card Preview sidebar -->
      <div class="flex flex-col items-center gap-4 lg:sticky lg:top-24">
        <h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase self-start lg:self-center">
          Vista previa del plástico
        </h3>
        <CardPreview
          :card-number="cardNumberInput"
          :customer-name="customerName"
          :expiration-date="expirationInput"
        />
      </div>
    </div>
  </AppShell>
</template>

<style>
/* For overriding standard Tailwind input styles if needed */
input#cardNumber {
  height: 3.25rem;
  width: 100%;
  border-radius: 1rem;
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(30 41 59 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(2 6 23 / var(--tw-bg-opacity));
  padding-right: 1rem;
  padding-left: 3rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(255 255 255);
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
input#cardNumber:hover {
  --tw-border-opacity: 1;
  border-color: rgb(51 65 85 / var(--tw-border-opacity));
}
input#cardNumber:focus {
  --tw-border-opacity: 1;
  border-color: rgb(37 99 235 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(2 6 23 / var(--tw-bg-opacity));
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
input#cardNumber:disabled {
  opacity: 0.5;
}
</style>
