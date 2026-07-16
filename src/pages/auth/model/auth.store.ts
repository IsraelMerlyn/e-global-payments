import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { AuthUser } from '@/entities/user/model/user.types'
import { normalizeApiError } from '@/shared/api/api-error'
import { STORAGE_KEYS } from '@/shared/config/storage'

import { loginRequest } from '../api/auth.api'
import { decodeAccessToken } from '../lib/jwt'
import type { LoginCredentials } from './auth.schemas'

export const useAuthStore = defineStore(
    'auth',
    () => {
        const accessToken = ref<string | null>(null)
        const user = ref<AuthUser | null>(null)
        const isLoading = ref(false)
        const errorMessage = ref('')

        const isAuthenticated = computed(
            () =>
                Boolean(accessToken.value) &&
                Boolean(user.value),
        )

        const homeRouteName = computed(() => {
            if (user.value?.role === 'Supervisor') {
                return 'supervisor-home'
            }

            return 'operator-home'
        })

        function persistSession(
            token: string,
            authenticatedUser: AuthUser,
        ): void {
            accessToken.value = token
            user.value = authenticatedUser

            sessionStorage.setItem(
                STORAGE_KEYS.accessToken,
                token,
            )
        }

        function clearSession(): void {
            accessToken.value = null
            user.value = null
            errorMessage.value = ''

            sessionStorage.removeItem(
                STORAGE_KEYS.accessToken,
            )
        }

        function restoreSession(): void {
            const storedToken = sessionStorage.getItem(
                STORAGE_KEYS.accessToken,
            )

            if (!storedToken) {
                return
            }

            try {
                const authenticatedUser =
                    decodeAccessToken(storedToken)

                accessToken.value = storedToken
                user.value = authenticatedUser
            } catch {
                clearSession()
            }
        }

        async function login(
            credentials: LoginCredentials,
        ): Promise<AuthUser> {
            if (isLoading.value) {
                throw new Error('Ya existe una solicitud de inicio de sesión')
            }

            isLoading.value = true
            errorMessage.value = ''

            try {
                const response = await loginRequest(credentials)

                const authenticatedUser = decodeAccessToken(
                    response.accessToken,
                )

                persistSession(
                    response.accessToken,
                    authenticatedUser,
                )

                return authenticatedUser
            } catch (error) {
                const apiError = normalizeApiError(error)

                errorMessage.value =
                    apiError.status > 0
                        ? `HTTP ${apiError.status} · ${apiError.message}`
                        : apiError.message

                throw apiError
            } finally {
                isLoading.value = false
            }
        }

        function logout(): void {
            clearSession()
        }

        restoreSession()

        return {
            accessToken,
            user,
            isLoading,
            errorMessage,
            isAuthenticated,
            homeRouteName,
            login,
            logout,
            restoreSession,
        }
    },
)