<script setup lang="ts">
import { demoAccounts } from '#shared/demo-accounts'

const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const signInEmail = useSignIn('email')
const signInAnonymous = useSignIn('anonymous')
const signInSocial = useSignIn('social')
const signUpEmail = useSignUp('email')

const tabs = [{
  slot: 'signin',
  label: 'Sign in',
  icon: 'i-lucide-user',
}, {
  slot: 'signup',
  label: 'Sign up',
  icon: 'i-lucide-user-plus',
}]

const email = ref('')
const password = ref('')
const name = ref('')
const quickLogin = ref<'anonymous' | 'user' | 'admin' | null>(null)
const isPending = computed(() => [signInEmail, signInAnonymous, signInSocial, signUpEmail].some(action => action.status.value === 'pending'))

function showError(message?: string) {
  toast.add({
    title: message || 'Authentication failed',
    color: 'error',
  })
}

async function loginAsAnonymous() {
  if (isPending.value) return
  quickLogin.value = 'anonymous'
  await signInAnonymous.execute()
  quickLogin.value = null
  if (signInAnonymous.error.value) showError(signInAnonymous.error.value.message)
}

async function loginAsDemo(kind: 'user' | 'admin') {
  if (!runtimeConfig.public.demoAccountsEnabled || isPending.value) return
  quickLogin.value = kind
  const { email, password } = demoAccounts[kind]
  await signInEmail.execute({ email, password })
  quickLogin.value = null
  if (signInEmail.error.value) showError(signInEmail.error.value.message)
}

async function signIn() {
  if (isPending.value) return
  await signInEmail.execute({ email: email.value, password: password.value })
  if (signInEmail.error.value) showError(signInEmail.error.value.message)
}

async function signUp() {
  if (isPending.value) return
  await signUpEmail.execute({ email: email.value, password: password.value, name: name.value })
  if (signUpEmail.error.value) showError(signUpEmail.error.value.message)
}

async function signInWithGitHub() {
  if (!runtimeConfig.public.githubAuthEnabled || isPending.value) return
  await signInSocial.execute({ provider: 'github' })
  if (signInSocial.error.value) showError(signInSocial.error.value.message)
}
</script>

<template>
  <UPageBody class="md:mt-0 md:pb-0">
    <div class="mx-auto max-w-3xl py-8 md:py-7">
      <div class="text-center">
        <UBadge
          icon="i-simple-icons-nuxtdotjs"
          variant="soft"
          class="rounded-full px-3 py-1"
          label="Nuxt 4 · NuxtHub"
        />
        <h1 class="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Nuxt Better Auth template
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-muted">
          A Nuxt 4 authentication template using Better Auth and NuxtHub.
        </p>
      </div>

      <div class="mt-7 flex flex-wrap items-center justify-center gap-1.5">
        <span v-if="runtimeConfig.public.demoAccountsEnabled" class="mr-1 text-sm font-medium text-muted">Try as</span>
        <UButton
          size="sm"
          variant="soft"
          icon="i-lucide-ghost"
          class="rounded-full transition-transform duration-150 active:scale-[.97]"
          :loading="quickLogin === 'anonymous'"
          :disabled="isPending"
          @click="loginAsAnonymous"
        >
          {{ runtimeConfig.public.demoAccountsEnabled ? 'Guest' : 'Continue anonymously' }}
        </UButton>
        <UButton
          v-if="runtimeConfig.public.demoAccountsEnabled"
          size="sm"
          variant="soft"
          icon="i-lucide-user-round"
          class="rounded-full transition-transform duration-150 active:scale-[.97]"
          :loading="quickLogin === 'user'"
          :disabled="isPending"
          @click="loginAsDemo('user')"
        >
          User
        </UButton>
        <UButton
          v-if="runtimeConfig.public.demoAccountsEnabled"
          size="sm"
          variant="soft"
          icon="i-lucide-shield-check"
          class="rounded-full transition-transform duration-150 active:scale-[.97]"
          :loading="quickLogin === 'admin'"
          :disabled="isPending"
          @click="loginAsDemo('admin')"
        >
          Admin
        </UButton>
      </div>

      <USeparator label="or use email" class="my-8" />

      <UTabs :items="tabs" class="mx-auto max-w-md">
        <template #signin>
          <form class="flex flex-col gap-4 pt-4" @submit.prevent="signIn">
            <UFormField label="Email" required>
              <UInput
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="you@example.com"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Password" required>
              <UInput
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                placeholder="At least 8 characters"
                class="w-full"
              />
            </UFormField>
            <UButton
              type="submit"
              block
              :loading="signInEmail.status.value === 'pending'"
              :disabled="isPending || !email || !password"
            >
              Sign in
            </UButton>
            <UButton
              v-if="runtimeConfig.public.githubAuthEnabled"
              icon="i-simple-icons-github"
              type="button"
              color="neutral"
              variant="outline"
              block
              :loading="signInSocial.status.value === 'pending'"
              :disabled="isPending"
              @click="signInWithGitHub"
            >
              Sign in with GitHub
            </UButton>
          </form>
        </template>
        <template #signup>
          <form class="flex flex-col gap-4 pt-4" @submit.prevent="signUp">
            <UFormField label="Name" required>
              <UInput
                v-model="name"
                autocomplete="name"
                required
                placeholder="Your name"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Email" required>
              <UInput
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="you@example.com"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Password" required>
              <UInput
                v-model="password"
                type="password"
                autocomplete="new-password"
                required
                :minlength="8"
                placeholder="At least 8 characters"
                class="w-full"
              />
            </UFormField>
            <UButton
              type="submit"
              block
              :loading="signUpEmail.status.value === 'pending'"
              :disabled="isPending || !name || !email || password.length < 8"
            >
              Create account
            </UButton>
          </form>
        </template>
      </UTabs>
    </div>
  </UPageBody>
</template>
