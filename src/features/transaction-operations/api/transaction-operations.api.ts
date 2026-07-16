import { httpClient } from '@/shared/api/http-client'
import { operationResponseSchema, type OperationRequest, type OperationResponse } from '../model/transaction-operations.schemas'

export async function processCancellation(request: OperationRequest): Promise<OperationResponse> {
  const response = await httpClient.patch<unknown>('/transactions/cancellation', request)
  return operationResponseSchema.parse(response.data)
}

export async function processRefund(request: OperationRequest): Promise<OperationResponse> {
  const response = await httpClient.patch<unknown>('/transactions/refund', request)
  return operationResponseSchema.parse(response.data)
}
