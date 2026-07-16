import axios from 'axios'

import { STORAGE_KEYS } from '@/shared/config/storage'

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10_000,

    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
})

httpClient.interceptors.request.use((config) => {
    const accessToken = sessionStorage.getItem(
        STORAGE_KEYS.accessToken,
    )

    if (accessToken) {
        config.headers.Authorization =
            `Bearer ${accessToken}`
    }

    return config
})