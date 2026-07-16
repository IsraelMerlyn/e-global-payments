import { httpClient } from '@/shared/api/http-client'
import { transactionsResponseSchema, type TransactionsResponse } from '../model/transactions.schemas'

export async function fetchTransactions(): Promise<TransactionsResponse> {
  const response = await httpClient.get<unknown>('/transactions')
  return transactionsResponseSchema.parse(response.data)
}
