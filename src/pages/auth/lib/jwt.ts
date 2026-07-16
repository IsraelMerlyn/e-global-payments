import {
    jwtDecode,
    type JwtPayload,
} from 'jwt-decode'

import {
    isUserRole,
    type AuthUser,
} from '@/entities/user/model/user.types'

interface AppJwtPayload extends JwtPayload {
    username?: string
    name?: string
    Role?: string
    role?: string
}

export class InvalidSessionTokenError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InvalidSessionTokenError'
    }
}

export function decodeAccessToken(token: string): AuthUser {
    let payload: AppJwtPayload

    try {
        payload = jwtDecode<AppJwtPayload>(token)
    } catch {
        throw new InvalidSessionTokenError(
            'El servidor devolvió un token inválido',
        )
    }

    const role = payload.Role ?? payload.role

    if (!isUserRole(role)) {
        throw new InvalidSessionTokenError(
            'El token no contiene un rol autorizado',
        )
    }

    if (
        typeof payload.exp === 'number' &&
        payload.exp * 1000 <= Date.now()
    ) {
        throw new InvalidSessionTokenError(
            'La sesión ha expirado',
        )
    }

    const username =
        payload.username ??
        payload.sub ??
        role.toLowerCase()

    return {
        id: payload.sub ?? username,
        username,
        name: payload.name ?? username,
        role,
    }
}