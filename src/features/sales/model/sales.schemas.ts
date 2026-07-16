import { z } from 'zod'

export const encryptedPaymentDataSchema = z.object({
  algorithm: z.literal('AES-GCM'),
  iv: z.string().min(1, 'El IV es obligatorio'),
  ciphertext: z.string().min(1, 'El texto cifrado es obligatorio'),
})

export const saleRequestSchema = z.object({
  amount: z
    .number({ message: 'El importe es obligatorio' })
    .positive('El importe debe ser mayor a cero')
    .max(999999.99, 'El importe máximo permitido es 999,999.99'),
  customerName: z
    .string({ message: 'El nombre es obligatorio' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre debe tener un máximo de 80 caracteres'),
  maskedCard: z.string().min(1, 'La tarjeta enmascarada es obligatoria'),
  paymentData: encryptedPaymentDataSchema,
})

export const saleResponseSchema = z.object({
  approvalNumber: z.string().min(1, 'El número de aprobación es obligatorio'),
  financialReference: z.string().min(1, 'La referencia financiera es obligatoria'),
  maskedCard: z.string().min(1, 'La tarjeta enmascarada es obligatoria'),
  status: z.string().min(1, 'El estado es obligatorio'),
})

export type SaleRequest = z.infer<typeof saleRequestSchema>
export type SaleResponse = z.infer<typeof saleResponseSchema>
