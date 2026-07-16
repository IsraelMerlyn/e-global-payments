import { z } from 'zod'

export const loginCredentialsSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Ingresa un usuario válido')
        .max(40, 'El usuario es demasiado largo'),

    password: z
        .string()
        .min(8, 'La contraseña debe contener al menos 8 caracteres')
        .max(80, 'La contraseña es demasiado larga'),
})

export const loginResponseSchema = z.object({
    accessToken: z.string().min(1),
    tokenType: z.string().default('Bearer'),
})

export type LoginCredentials = z.infer<
    typeof loginCredentialsSchema
>

export type LoginResponse = z.infer<
    typeof loginResponseSchema
>