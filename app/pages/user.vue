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
  <UContainer>
    <UPageHeader
      title="Current Session"
      description="Nuxt Better Auth loaded this session on the server. NuxtHub stores it in the database configured for this deployment."
    >
      <template #headline>
        <UBadge
          v-if="isAnonymous"
          color="neutral"
          variant="subtle"
          label="Anonymous"
        />
        <UBadge v-else-if="isAdmin" variant="subtle" label="Admin" />
        <UBadge
          v-else
          color="neutral"
          variant="subtle"
          label="User"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="flex max-w-3xl flex-col gap-4">
        <UCard>
          <p class="font-medium text-highlighted break-words">
            {{ user?.name }}
          </p>
          <p class="mt-1 text-sm text-muted break-all">
            {{ user?.email }}
          </p>
        </UCard>

        <UCollapsible>
          <UButton
            label="Session Details"
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-chevron-down"
            block
            class="group justify-between"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
          />
          <template #content>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div class="min-w-0">
                <h2 class="text-sm">
                  User
                </h2>
                <pre class="mt-2 overflow-auto text-xs text-muted">{{ user }}</pre>
              </div>
              <div class="min-w-0">
                <h2 class="text-sm">
                  Session
                </h2>
                <pre class="mt-2 overflow-auto text-xs text-muted">{{ session }}</pre>
              </div>
            </div>
          </template>
        </UCollapsible>

        <UCard v-if="showGitHubAccount">
          <template #header>
            <h2 class="text-base text-highlighted">
              GitHub Account
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
            variant="subtle"
            icon="i-simple-icons-github"
            trailing-icon="i-lucide-check"
            disabled
          >
            Linked with GitHub
          </UButton>
          <UButton
            v-else
            color="neutral"
            variant="subtle"
            icon="i-simple-icons-github"
            :loading="accountsStatus === 'pending' || linkGitHub.status.value === 'pending'"
            :disabled="accountsStatus !== 'success'"
            @click="linkAccount"
          >
            Link GitHub Account
          </UButton>
        </UCard>
      </div>
    </UPageBody>
  </UContainer>
</template>
