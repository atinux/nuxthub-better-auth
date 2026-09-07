<script setup lang="ts">
import type { Account } from 'better-auth'

const { user, session } = useUserSession()
const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const linkGitHub = useAuthClientAction(client => client.linkSocial)

const isAnonymous = computed(() => Boolean(user.value?.isAnonymous))
const isAdmin = computed(() => user.value?.role === 'admin')
const showGitHubAccount = computed(() => runtimeConfig.public.githubAuthEnabled && !!user.value && !isAnonymous.value)

const { data: accounts, status: accountsStatus, error: accountsError, refresh: refreshAccounts } = await useFetch<Pick<Account, 'providerId'>[]>('/api/auth/list-accounts', {
  key: computed(() => `accounts:${user.value?.id ?? 'guest'}`),
  enabled: showGitHubAccount,
  default: () => [],
})

function hasProvider(provider: string) {
  return accounts.value.some(account => account.providerId === provider)
}

async function linkAccount() {
  if (!showGitHubAccount.value || accountsStatus.value !== 'success' || linkGitHub.status.value === 'pending') return
  await linkGitHub.execute({ provider: 'github', callbackURL: '/user' })
  if (linkGitHub.error.value) {
    toast.add({ title: linkGitHub.error.value.message, color: 'error' })
  }
}

const oauthError = useRoute().query.error
onMounted(() => {
  if (oauthError) toast.add({ color: 'error', title: String(oauthError) })
})
</script>

<template>
  <UPageBody>
    <div class="mx-auto max-w-3xl py-8">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-bold">
          Current session
        </h1>
        <UBadge v-if="isAnonymous" color="neutral" label="Anonymous" />
        <UBadge v-else-if="isAdmin" color="primary" label="Admin" />
        <UBadge v-else color="success" label="User" />
      </div>
      <p class="mt-2 text-muted">
        Nuxt Better Auth loaded this session on the server. NuxtHub stores it in the database configured for this deployment.
      </p>

      <UCard class="mt-6">
        <p class="font-semibold break-words">
          {{ user?.name }}
        </p>
        <p class="mt-1 text-sm text-muted break-all">
          {{ user?.email }}
        </p>
      </UCard>

      <details class="mt-4 rounded-lg border border-default p-4">
        <summary class="cursor-pointer font-medium">
          Session details
        </summary>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="min-w-0">
            <h2 class="text-sm font-semibold">
              User
            </h2>
            <pre class="mt-2 overflow-auto text-xs">{{ user }}</pre>
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-semibold">
              Session
            </h2>
            <pre class="mt-2 overflow-auto text-xs">{{ session }}</pre>
          </div>
        </div>
      </details>

      <UCard v-if="showGitHubAccount" class="mt-4">
        <template #header>
          <h2 class="font-semibold">
            GitHub account
          </h2>
        </template>
        <UAlert
          v-if="accountsError"
          color="error"
          title="Could not load linked accounts"
          :actions="[{ label: 'Retry', onClick: () => refreshAccounts() }]"
        />
        <UButton
          v-else-if="hasProvider('github')"
          color="neutral"
          variant="soft"
          icon="i-simple-icons-github"
          trailing-icon="i-lucide-check"
          disabled
        >
          Linked with GitHub
        </UButton>
        <UButton
          v-else
          color="neutral"
          icon="i-simple-icons-github"
          :loading="accountsStatus === 'pending' || linkGitHub.status.value === 'pending'"
          :disabled="accountsStatus !== 'success'"
          @click="linkAccount"
        >
          Link GitHub account
        </UButton>
      </UCard>
    </div>
  </UPageBody>
</template>
