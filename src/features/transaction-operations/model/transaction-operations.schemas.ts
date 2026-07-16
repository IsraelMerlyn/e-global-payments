import { z } from 'zod'

export const operationRequestSchema = z.object({
  financialReference: z
    .string({ message: 'La referencia financiera es obligatoria' })
    .length(8, 'La referencia financiera debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'La referencia financiera debe contener únicamente dígitos'),
  cardNumber: z
    .string({ message: 'El número de tarjeta es obligatorio' })
    .min(13, 'La tarjeta debe tener al menos 13 dígitos')
    .max(19, 'La tarjeta debe tener un máximo de 19 dígitos')
    .regex(/^\d+$/, 'La tarjeta debe contener únicamente dígitos'),
})

export const operationResponseSchema = z.object({
  approvalNumber: z.string().min(1, 'El número de aprobación es obligatorio'),
  financialReference: z.string().min(1, 'La referencia financiera es obligatoria'),
  maskedCard: z.string().min(1, 'La tarjeta enmascarada es obligatoria'),
  status: z.string().min(1, 'El estado es obligatorio'),
})

export type OperationRequest = z.infer<typeof operationRequestSchema>
export type OperationResponse = z.infer<typeof operationResponseSchema>
