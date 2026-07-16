import 'vue-router'
import type { UserRole } from '@/entities/user/model/user.types'

export { }

declare module 'vue-router' {
    interface RouteMeta {
        title: string
        requiresAuth?: boolean
        roles?: UserRole[]
    }
}