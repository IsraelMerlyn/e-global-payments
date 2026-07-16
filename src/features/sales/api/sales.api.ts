import { httpClient } from '@/shared/api/http-client'
import { saleResponseSchema, type SaleRequest, type SaleResponse } from '../model/sales.schemas'

export async function processSale(request: SaleRequest): Promise<SaleResponse> {
  const response = await httpClient.post<unknown>('/sales', request)
  return saleResponseSchema.parse(response.data)
}
