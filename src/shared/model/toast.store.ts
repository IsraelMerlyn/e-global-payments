import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    title: string
    message: string
    status?: number
    variant: ToastVariant
    duration?: number
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])

    function show(toast: Omit<Toast, 'id'>): string {
        const id = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9)
        const newToast: Toast = {
            id,
            duration: 5000,
            ...toast,
        }

        toasts.value.push(newToast)

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                dismiss(id)
            }, newToast.duration)
        }

        return id
    }

    function success(title: string, message: string, status?: number): string {
        return show({ title, message, status, variant: 'success' })
    }

    function error(title: string, message: string, status?: number): string {
        return show({ title, message, status, variant: 'error' })
    }

    function warning(title: string, message: string, status?: number): string {
        return show({ title, message, status, variant: 'warning' })
    }

    function info(title: string, message: string, status?: number): string {
        return show({ title, message, status, variant: 'info' })
    }

    function dismiss(id: string): void {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    return {
        toasts,
        show,
        success,
        error,
        warning,
        info,
        dismiss,
    }
})
