<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppShell from '@/shared/ui/layout/AppShell.vue'
import { fetchTransactions } from '@/features/transactions/api/transactions.api'
import type { TransactionItem } from '@/features/transactions/model/transactions.schemas'
import { useToastStore } from '@/shared/model/toast.store'
import { normalizeApiError } from '@/shared/api/api-error'
import {
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'

const toastStore = useToastStore()

// State
const rawTransactions = ref<TransactionItem[]>([])
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const errorStatus = ref<number | undefined>(undefined)

// Filters
const filterCustomer = ref('')
const filterReference = ref('')
const filterStatus = ref('')

// Sorting
const sortBy = ref<'date' | 'amount'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

async function loadTransactions() {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''
  errorStatus.value = undefined
  
  try {
    const data = await fetchTransactions()
    rawTransactions.value = data.items
    toastStore.success(
      'Consulta exitosa',
      'Las transacciones fueron obtenidas correctamente',
      200,
    )
  } catch (err: any) {
    hasError.value = true
    const apiError = normalizeApiError(err)
    errorMessage.value = apiError.message
    errorStatus.value = apiError.status
    
    toastStore.error(
      'Error de consulta',
      apiError.message || 'No fue posible obtener el listado',
      apiError.status || 400,
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadTransactions()
})

const filteredTransactions = computed(() => {
  return rawTransactions.value
    .filter((tx) => {
      const matchCustomer = tx.customerName
        .toLowerCase()
        .includes(filterCustomer.value.toLowerCase().trim())
      const matchRef = tx.financialReference
        .toLowerCase()
        .includes(filterReference.value.toLowerCase().trim())
      const matchStatus =
        !filterStatus.value || tx.status === filterStatus.value

      return matchCustomer && matchRef && matchStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy.value === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy.value === 'amount') {
        comparison = a.amount - b.amount
      }
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
})

function toggleSort(field: 'date' | 'amount') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val)
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return dateStr
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-400 border border-red-500/20'
    case 'REFUNDED':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'Aprobada'
    case 'CANCELLED':
      return 'Cancelada'
    case 'REFUNDED':
      return 'Devuelta'
    default:
      return status
  }
}
</script>

<template>
  <AppShell
    title="Consulta de Transacciones"
    description="Filtra y revisa las operaciones registradas en el sistema financiero."
  >
    <!-- Filter panel -->
    <div class="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div class="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <Filter :size="14" />
        Filtros de búsqueda
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <!-- Customer filter -->
        <div>
          <label for="filterCustomer" class="mb-1.5 block text-xs font-medium text-slate-400">
            Cliente
          </label>
          <div class="relative">
            <Search :size="16" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="filterCustomer"
              v-model="filterCustomer"
              type="text"
              placeholder="Buscar por cliente"
              class="h-10 w-full rounded-xl border border-slate-800 bg-slate-950 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Reference filter -->
        <div>
          <label for="filterReference" class="mb-1.5 block text-xs font-medium text-slate-400">
            Referencia Financiera
          </label>
          <div class="relative">
            <Search :size="16" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="filterReference"
              v-model="filterReference"
              type="text"
              placeholder="Buscar por referencia"
              class="h-10 w-full rounded-xl border border-slate-800 bg-slate-950 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Status filter -->
        <div>
          <label for="filterStatus" class="mb-1.5 block text-xs font-medium text-slate-400">
            Estado
          </label>
          <select
            id="filterStatus"
            v-model="filterStatus"
            class="h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition hover:border-slate-700 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
          >
            <option value="">Todos los estados</option>
            <option value="APPROVED">Aprobada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="REFUNDED">Devuelta</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Sorting controls (visible on mobile / desktop simplified) -->
    <div class="flex items-center justify-between mb-4">
      <div class="text-xs font-medium text-slate-500">
        Mostrando {{ filteredTransactions.length }} transacciones
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-850"
          @click="loadTransactions"
          :disabled="isLoading"
          aria-label="Recargar transacciones"
        >
          <RefreshCw :size="13" :class="{ 'animate-spin': isLoading }" />
          Recargar
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="hasError"
      class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
      role="status"
    >
      <p class="text-sm font-semibold text-red-400">
        No fue posible cargar el historial de transacciones
      </p>
      <p v-if="errorMessage" class="mt-1 text-xs text-slate-500">
        {{ errorMessage }}
      </p>
      <button
        type="button"
        class="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-500"
        @click="loadTransactions"
      >
        <RefreshCw :size="13" />
        Reintentar
      </button>
    </div>

    <!-- Skeleton Loading -->
    <div v-else-if="isLoading" class="space-y-3">
      <div
        v-for="i in 5"
        :key="i"
        class="h-16 w-full animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredTransactions.length === 0"
      class="rounded-2xl border border-slate-800 bg-slate-900/50 py-12 text-center"
    >
      <p class="text-sm font-semibold text-slate-400">No se encontraron transacciones</p>
      <p class="mt-1 text-xs text-slate-600">Intenta modificando los criterios de búsqueda o registra una venta.</p>
    </div>

    <!-- Data Presentation -->
    <div v-else>
      <!-- Desktop Table (hidden on mobile, block on md) -->
      <div class="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table class="w-full border-collapse text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th scope="col" class="py-4 px-6">ID</th>
              <th scope="col" class="py-4 px-6 cursor-pointer select-none hover:text-white" @click="toggleSort('date')">
                <div class="flex items-center gap-1">
                  Fecha
                  <ChevronDown v-if="sortBy === 'date' && sortOrder === 'desc'" :size="14" />
                  <ChevronUp v-else-if="sortBy === 'date' && sortOrder === 'asc'" :size="14" />
                </div>
              </th>
              <th scope="col" class="py-4 px-6">Cliente</th>
              <th scope="col" class="py-4 px-6">Referencia</th>
              <th scope="col" class="py-4 px-6">Tarjeta</th>
              <th scope="col" class="py-4 px-6 cursor-pointer select-none hover:text-white" @click="toggleSort('amount')">
                <div class="flex items-center gap-1">
                  Importe
                  <ChevronDown v-if="sortBy === 'amount' && sortOrder === 'desc'" :size="14" />
                  <ChevronUp v-else-if="sortBy === 'amount' && sortOrder === 'asc'" :size="14" />
                </div>
              </th>
              <th scope="col" class="py-4 px-6">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-850">
            <tr
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="hover:bg-slate-950/40 transition"
            >
              <td class="py-4 px-6 font-mono text-xs text-slate-500 font-semibold">{{ tx.id }}</td>
              <td class="py-4 px-6 text-slate-400 font-medium">{{ formatDate(tx.date) }}</td>
              <td class="py-4 px-6 font-semibold text-white">{{ tx.customerName }}</td>
              <td class="py-4 px-6 font-mono text-slate-400 font-medium">{{ tx.financialReference }}</td>
              <td class="py-4 px-6 font-mono text-slate-400">{{ tx.maskedCard }}</td>
              <td class="py-4 px-6 font-bold text-white">{{ formatCurrency(tx.amount) }}</td>
              <td class="py-4 px-6">
                <span
                  :class="getStatusBadgeClass(tx.status)"
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {{ getStatusLabel(tx.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card List (hidden on desktop, block on mobile) -->
      <div class="md:hidden space-y-3">
        <div
          v-for="tx in filteredTransactions"
          :key="tx.id"
          class="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3"
        >
          <div class="flex items-start justify-between border-b border-slate-850 pb-2">
            <div>
              <p class="text-xs text-slate-500 font-mono font-semibold">{{ tx.id }}</p>
              <p class="text-xs text-slate-400 font-medium mt-0.5">{{ formatDate(tx.date) }}</p>
            </div>
            <span
              :class="getStatusBadgeClass(tx.status)"
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              {{ getStatusLabel(tx.status) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p class="text-slate-500">Cliente</p>
              <p class="font-semibold text-white mt-0.5">{{ tx.customerName }}</p>
            </div>
            <div>
              <p class="text-slate-500">Importe</p>
              <p class="font-bold text-white mt-0.5">{{ formatCurrency(tx.amount) }}</p>
            </div>
            <div>
              <p class="text-slate-500">Referencia</p>
              <p class="font-mono text-white mt-0.5">{{ tx.financialReference }}</p>
            </div>
            <div>
              <p class="text-slate-500">Tarjeta</p>
              <p class="font-mono text-white mt-0.5">{{ tx.maskedCard }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
