import { httpClient } from '@/shared/api/http-client'

import {
    loginResponseSchema,
    type LoginCredentials,
    type LoginResponse,
} from '../model/auth.schemas'

export async function loginRequest(
    credentials: LoginCredentials,
): Promise<LoginResponse> {
    const response = await httpClient.post<unknown>(
        '/auth/login',
        credentials,
    )

    return loginResponseSchema.parse(response.data)
}