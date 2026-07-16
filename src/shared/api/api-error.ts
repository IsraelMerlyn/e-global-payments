import axios from 'axios'

interface ApiErrorResponse {
    code?: unknown
    message?: unknown
}

export class ApiError extends Error {
    readonly status: number
    readonly code: string

    constructor(
        status: number,
        message: string,
        code = 'UNKNOWN_ERROR',
    ) {
        super(message)

        this.name = 'ApiError'
        this.status = status
        this.code = code
    }
}

export function normalizeApiError(
    error: unknown,
): ApiError {
    if (error instanceof ApiError) {
        return error
    }

    if (axios.isAxiosError(error)) {
        const responseData = error.response
            ?.data as ApiErrorResponse | undefined

        const status = error.response?.status ?? 0

        const message =
            typeof responseData?.message === 'string'
                ? responseData.message
                : status === 0
                    ? 'No fue posible conectar con el servidor'
                    : 'No fue posible completar la operación'

        const code =
            typeof responseData?.code === 'string'
                ? responseData.code
                : 'HTTP_ERROR'

        return new ApiError(status, message, code)
    }

    if (error instanceof Error) {
        return new ApiError(
            0,
            error.message,
            'APPLICATION_ERROR',
        )
    }

    return new ApiError(
        0,
        'Ocurrió un error inesperado',
    )
}