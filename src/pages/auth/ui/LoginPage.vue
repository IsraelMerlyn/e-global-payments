<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'
import { ref } from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  loginCredentialsSchema,
} from '@/pages/auth/model/auth.schemas'
import { useAuthStore } from '@/pages/auth/model/auth.store'
import BrandMark from '@/shared/ui/brand/BrandMark.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')

function fillOperatorCredentials(): void {
  username.value = 'operador'
  password.value = 'Operador123'
  formError.value = ''
}

function fillSupervisorCredentials(): void {
  username.value = 'supervisor'
  password.value = 'Supervisor123'
  formError.value = ''
}

async function handleSubmit(): Promise<void> {
  if (authStore.isLoading) {
    return
  }

  formError.value = ''

  const validation = loginCredentialsSchema.safeParse({
    username: username.value,
    password: password.value,
  })

  if (!validation.success) {
    formError.value =
      validation.error.issues[0]?.message ??
      'Revisa los datos capturados'

    return
  }

  try {
    const authenticatedUser = await authStore.login(
      validation.data,
    )

    const requestedRedirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : null

    if (requestedRedirect) {
      await router.replace(requestedRedirect)
      return
    }

    await router.replace({
      name:
        authenticatedUser.role === 'Supervisor'
          ? 'supervisor-home'
          : 'operator-home',
    })
  } catch {
    formError.value =
      authStore.errorMessage ||
      'No fue posible iniciar sesión'
  }
}
</script>

<template >
  <main class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div
      class="pointer-events-none absolute -top-48 -left-40 size-[34rem] rounded-full bg-brand-600/20 blur-[120px]"
    />

    <div
      class="pointer-events-none absolute -right-52 -bottom-60 size-[38rem] rounded-full bg-cyan-400/10 blur-[140px]"
    />

    <div
      class="pointer-events-none absolute inset-0 opacity-[0.16]"
      style="
        background-image:
          linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
        background-size: 44px 44px;
      "
    />

    <section class="relative grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <aside
        class="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/8 px-12 py-10 lg:flex xl:px-18 xl:py-14"
      >
        <BrandMark />

        <div class="max-w-2xl">
          <div
            class="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-300/20 bg-brand-300/8 px-3.5 py-2 text-xs font-medium text-brand-200 backdrop-blur-xl"
          >
            <span class="relative flex size-2">
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60"
              />
              <span class="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>

            Plataforma operativa disponible
          </div>

          <h1
            class="max-w-xl text-5xl leading-[1.05] font-semibold tracking-[-0.045em] text-white xl:text-6xl"
          >
            Operaciones financieras
            <span
              class="bg-linear-to-r from-brand-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent"
            >
              controladas y seguras.
            </span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-7 text-slate-400 xl:text-lg">
            Procesa ventas, consultas, cancelaciones y devoluciones desde una experiencia
            diseñada para cada perfil operativo.
          </p>

          <div class="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <article
              class="rounded-2xl border border-white/8 bg-white/[0.045] p-4 backdrop-blur-xl"
            >
              <Activity
                :size="19"
                :stroke-width="1.8"
                class="mb-5 text-brand-300"
                aria-hidden="true"
              />

              <p class="text-lg font-semibold text-white">HTTP</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">Respuesta observable</p>
            </article>

            <article
              class="rounded-2xl border border-white/8 bg-white/[0.045] p-4 backdrop-blur-xl"
            >
              <ShieldCheck
                :size="19"
                :stroke-width="1.8"
                class="mb-5 text-emerald-300"
                aria-hidden="true"
              />

              <p class="text-lg font-semibold text-white">AES-GCM</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">Datos protegidos</p>
            </article>

            <article
              class="rounded-2xl border border-white/8 bg-white/[0.045] p-4 backdrop-blur-xl"
            >
              <CreditCard
                :size="19"
                :stroke-width="1.8"
                class="mb-5 text-cyan-300"
                aria-hidden="true"
              />

              <p class="text-lg font-semibold text-white">2 roles</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">Acceso segmentado</p>
            </article>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-500">
          <CheckCircle2 :size="16" class="text-emerald-400" aria-hidden="true" />
          Comunicación mediante contratos JSON tipados
        </div>
      </aside>

      <section
        class="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-18"
      >
        <div class="w-full max-w-md">
          <div class="mb-10 lg:hidden">
            <BrandMark />
          </div>

          <div>
            <div
              class="mb-6 inline-flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-brand-300 shadow-xl shadow-black/20"
            >
              <LockKeyhole :size="22" :stroke-width="1.8" aria-hidden="true" />
            </div>

            <p class="text-sm font-medium text-brand-300">Portal transaccional</p>

            <h2 class="mt-2 text-3xl font-semibold tracking-[-0.035em] text-white">
              Inicia sesión
            </h2>

            <p class="mt-3 text-sm leading-6 text-slate-400">
              Utiliza las credenciales asignadas a tu perfil operativo.
            </p>
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
            <div>
              <label for="username" class="mb-2 block text-sm font-medium text-slate-300">
                Usuario
              </label>

              <div class="relative">
                <UserRound
                  :size="18"
                  :stroke-width="1.8"
                  class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />

                <input
                  id="username"
                  v-model.trim="username"
                  name="username"
                  type="text"
                  autocomplete="username"
                  placeholder="Ingresa tu usuario"
                  required
                  class="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.045] pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-brand-400/70 focus:bg-white/[0.065] focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-slate-300">
                  Contraseña
                </label>

                <span class="text-xs text-slate-600">Acceso protegido</span>
              </div>

              <div class="relative">
                <LockKeyhole
                  :size="18"
                  :stroke-width="1.8"
                  class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />

                <input
                  id="password"
                  v-model="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  required
                  class="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.045] pr-12 pl-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-brand-400/70 focus:bg-white/[0.065] focus:ring-4 focus:ring-brand-500/10"
                />

                <button
                  type="button"
                  class="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="18" aria-hidden="true" />
                  <Eye v-else :size="18" aria-hidden="true" />
                </button>
              </div>
            </div>
<button
  type="submit"
  :disabled="authStore.isLoading"
  class="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-xl shadow-brand-950/40 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-brand-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
>
  <template v-if="authStore.isLoading">
    <LoaderCircle
      :size="18"
      class="animate-spin"
      aria-hidden="true"
    />

    Iniciando sesión...
  </template>

  <template v-else>
    Iniciar sesión

    <ArrowRight
      :size="18"
      :stroke-width="2"
      class="transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  </template>
</button>
            <div
              v-if="formError"
              class="rounded-2xl border border-brand-400/20 bg-brand-400/8 p-4 text-sm leading-6 text-brand-100"
              role="status"
              aria-live="polite"
            >
              {{ formError }}
            </div>
          </form>

          <div class="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Usuarios de demostración
            </p>

            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <div class="rounded-xl border border-white/6 bg-slate-950/50 px-3 py-2.5">
              <button
  type="button"
  class="rounded-xl border border-white/6 bg-slate-950/50 px-3 py-2.5 text-left transition hover:border-brand-400/20 hover:bg-brand-400/5"
  @click="fillOperatorCredentials"
>
  <p class="text-xs font-medium text-slate-300">
    Operador
  </p>

  <p class="mt-1 text-[0.7rem] text-slate-600">
    Ventas y consultas
  </p>
</button>
                <p class="mt-1 text-[0.7rem] text-slate-600">Ventas y consultas</p>
              </div>

              <div class="rounded-xl border border-white/6 bg-slate-950/50 px-3 py-2.5">
                <button
  type="button"
  class="rounded-xl border border-white/6 bg-slate-950/50 px-3 py-2.5 text-left transition hover:border-violet-400/20 hover:bg-violet-400/5"
  @click="fillSupervisorCredentials"
>
  <p class="text-xs font-medium text-slate-300">
    Supervisor
  </p>

  <p class="mt-1 text-[0.7rem] text-slate-600">
    Cancelaciones y devoluciones
  </p>
</button>
              </div>
            </div>
          </div>

          <p class="mt-8 text-center text-xs leading-5 text-slate-600">
            El acceso y las operaciones son exclusivamente para usuarios autorizados.
          </p>
        </div>
      </section>
    </section>
  </main>
</template>