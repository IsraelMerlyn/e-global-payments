import { z } from 'zod'

export const transactionItemSchema = z.object({
  id: z.string().min(1, 'El ID es obligatorio'),
  approvalNumber: z.string().min(1, 'El número de aprobación es obligatorio'),
  financialReference: z.string().min(1, 'La referencia financiera es obligatoria'),
  maskedCard: z.string().min(1, 'La tarjeta enmascarada es obligatoria'),
  customerName: z.string().min(1, 'El nombre del cliente es obligatorio'),
  amount: z.number({ message: 'El importe es obligatorio' }),
  date: z.string().min(1, 'La fecha es obligatoria'),
  status: z.enum(['APPROVED', 'CANCELLED', 'REFUNDED'], {
    message: 'El estado es obligatorio',
  }),
})

export const transactionsResponseSchema = z.object({
  items: z.array(transactionItemSchema),
  total: z.number(),
})

export type TransactionItem = z.infer<typeof transactionItemSchema>
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>
