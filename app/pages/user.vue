<script setup lang="ts">
// https://better-auth.vercel.app/docs/integrations/nuxt#ssr-usage
const { user, session, client } = useAuth()
const toast = useToast()
const { data: accounts } = await useAsyncData('accounts', () => client.listAccounts())

function hasProvider(provider: string) {
  return accounts.value?.data?.some(account => account.providerId === provider)
}
const error = useRoute().query?.error
onMounted(() => {
  if (error) {
    console.log('ERR', error)

    toast.add({
      color: 'error',
      title: 'Authentication Error',
    })
  }
})
</script>

<template>
  <UPageBody class="py-10 sm:py-16">
    <div class="mx-auto max-w-4xl space-y-10">
      <div class="space-y-4 text-center">
        <UBadge
          variant="solid"
          color="primary"
          class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium"
        >
          <UIcon name="i-heroicons-user-circle" class="h-4 w-4" />
          Account overview
        </UBadge>
        <h1 class="text-3xl font-semibold sm:text-4xl">
          Welcome back, {{ user?.name || 'friend' }}!
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Here’s a quick snapshot of your profile, session details, and connected accounts.
        </p>
      </div>

      <UCard
        class="border border-gray-200/20 bg-white/70 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70"
        :ui="{
          body: 'p-6 sm:p-8',
        }"
      >
        <div class="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
          <UAvatar
            :src="user?.image || undefined"
            :alt="user?.name || user?.email || 'User avatar'"
            size="xl"
            class="shadow-lg ring-2 ring-primary/20"
          />
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold">
              {{ user?.name || 'Anonymous user' }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ user?.email || 'No email provided' }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
              <UBadge variant="soft" color="primary">
                User ID: {{ user?.id || 'n/a' }}
              </UBadge>
              <UBadge v-if="user?.emailVerified" variant="soft">
                Email verified
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-6 lg:grid-cols-2">
        <UCard
          class="h-full border border-gray-200/20 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70"
          :ui="{ body: 'p-4 sm:p-6' }"
        >
          <template #header>
            <h3 class="text-lg font-semibold">
              User
            </h3>
          </template>
          <div class="rounded-2xl border border-gray-200/40 bg-gray-950/90 p-4 text-left text-sm text-gray-100 shadow-inner dark:border-white/10 dark:bg-black/60">
            <pre class="overflow-x-auto whitespace-pre-wrap wrap-break-word">{{ user }}</pre>
          </div>
        </UCard>

        <UCard
          class="h-full border border-gray-200/20 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70"
          :ui="{ body: 'p-4 sm:p-6' }"
        >
          <template #header>
            <h3 class="text-lg font-semibold">
              Current session
            </h3>
          </template>
          <div class="rounded-2xl border border-gray-200/40 bg-gray-950/90 p-4 text-left text-sm text-gray-100 shadow-inner dark:border-white/10 dark:bg-black/60">
            <pre class="overflow-x-auto whitespace-pre-wrap wrap-break-word">{{ session }}</pre>
          </div>
        </UCard>
      </div>

      <UCard
        class="border border-gray-200/20 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70"
        :ui="{ body: 'p-6 sm:p-8' }"
      >
        <template #header>
          <h3 class="text-lg font-semibold">
            Connected accounts
          </h3>
        </template>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Manage social connections to quickly sign in with your favorite providers.
          </p>
          <div>
            <UButton
              v-if="hasProvider('github')"
              icon="i-simple-icons-github"
              trailing-icon="i-heroicons-check"
              variant="soft"
            >
              Linked with GitHub
            </UButton>
            <UButton
              v-else
              icon="i-simple-icons-github"
              @click="client.linkSocial({ provider: 'github' })"
            >
              Link account with GitHub
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UPageBody>
</template>
