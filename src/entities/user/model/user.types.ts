export const USER_ROLES = ['Operador', 'Supervisor'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface AuthUser {
    id: string
    username: string
    name: string
    role: UserRole
}

export function isUserRole(value: unknown): value is UserRole {
    return (
        typeof value === 'string' &&
        USER_ROLES.some((role) => role === value)
    )
}