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
  label: 'Sign In',
}, {
  slot: 'signup',
  label: 'Sign Up',
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
  <UPage>
    <UPageHero
      title="Nuxt Better Auth Template"
      description="A Nuxt 4 authentication template using Better Auth and NuxtHub."
      :ui="{ container: 'py-12 sm:py-16 lg:py-20' }"
    >
      <template #links>
        <span v-if="runtimeConfig.public.demoAccountsEnabled" class="text-sm text-muted">Try as</span>
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-ghost"
          :loading="quickLogin === 'anonymous'"
          :disabled="isPending"
          @click="loginAsAnonymous"
        >
          {{ runtimeConfig.public.demoAccountsEnabled ? 'Guest' : 'Continue Anonymously' }}
        </UButton>
        <UButton
          v-if="runtimeConfig.public.demoAccountsEnabled"
          color="neutral"
          variant="subtle"
          icon="i-lucide-user-round"
          :loading="quickLogin === 'user'"
          :disabled="isPending"
          @click="loginAsDemo('user')"
        >
          User
        </UButton>
        <UButton
          v-if="runtimeConfig.public.demoAccountsEnabled"
          color="neutral"
          variant="subtle"
          icon="i-lucide-shield-check"
          :loading="quickLogin === 'admin'"
          :disabled="isPending"
          @click="loginAsDemo('admin')"
        >
          Admin
        </UButton>
      </template>
    </UPageHero>

    <UPageBody class="mt-0">
      <UContainer class="max-w-md">
        <USeparator label="or use email" class="mb-8" />
        <UTabs :items="tabs">
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
                Sign In
              </UButton>
              <UButton
                v-if="runtimeConfig.public.githubAuthEnabled"
                icon="i-simple-icons-github"
                type="button"
                color="neutral"
                variant="subtle"
                block
                :loading="signInSocial.status.value === 'pending'"
                :disabled="isPending"
                @click="signInWithGitHub"
              >
                Sign In with GitHub
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
                Create Account
              </UButton>
            </form>
          </template>
        </UTabs>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
