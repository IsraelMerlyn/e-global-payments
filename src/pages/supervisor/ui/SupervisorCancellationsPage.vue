<script setup lang="ts">
import AppShell from '@/shared/ui/layout/AppShell.vue'
import TransactionOperationForm from '@/features/transaction-operations/ui/TransactionOperationForm.vue'
</script>

<template>
  <AppShell
    title="Cancelaciones"
    description="Aplica la cancelación de una transacción capturando su referencia y tarjeta."
  >
    <div class="py-4">
      <TransactionOperationForm operation="cancellation" />
    </div>
  </AppShell>
</template>
