<script setup lang="ts">
const { loggedIn, user, fetchSession } = useUserSession()
const toast = useToast()
const { execute: signOut, status: signOutStatus, error: signOutError } = useAuthClientAction(client => user.value?.isAnonymous ? client.deleteAnonymousUser : client.signOut)

const headerLinks = [
  { label: 'Home', to: '/' },
  { label: 'User', to: '/user' },
  { label: 'Secret', to: '/secret' },
  { label: 'Admin', to: '/admin' },
  { label: 'About', to: '/about' },
]

const footerLinks = [
  { label: 'Source', to: 'https://github.com/atinux/nuxthub-better-auth', target: '_blank' },
  { label: 'NuxtHub', to: 'https://hub.nuxt.com', target: '_blank' },
  { label: 'Better Auth', to: 'https://better-auth.com', target: '_blank' },
  { label: 'Nuxt UI', to: 'https://ui.nuxt.com', target: '_blank' },
]

async function onSignOut() {
  if (signOutStatus.value === 'pending') return

  await signOut({
    fetchOptions: {
      onSuccess: async () => {
        await fetchSession({ force: true })
        await navigateTo('/')
      },
    },
  })

  if (signOutError.value) {
    toast.add({ title: signOutError.value.message, color: 'error' })
  }
}
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <UHeader>
      <template #title>
        <span class="flex items-baseline gap-2">
          <img src="/logo-green-black.svg" alt="Nuxt" class="h-6 w-auto dark:hidden">
          <img src="/logo-green-white.svg" alt="Nuxt" class="hidden h-6 w-auto dark:block">
          <span class="font-heading font-medium text-highlighted">Better Auth</span>
        </span>
      </template>
      <UNavigationMenu :items="headerLinks" class="hidden md:flex" />
      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/atinux/nuxthub-better-auth"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          target="_blank"
          aria-label="View source on GitHub"
        />
        <UButton
          v-if="loggedIn"
          color="neutral"
          variant="subtle"
          :loading="signOutStatus === 'pending'"
          @click="onSignOut"
        >
          Sign Out
        </UButton>
      </template>
      <template #body>
        <UNavigationMenu :items="headerLinks" orientation="vertical" />
      </template>
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
    <UFooter class="border-t border-default">
      <template #left>
        <span class="text-sm text-muted">Built with Nuxt, Better Auth, and NuxtHub.</span>
      </template>
      <template #right>
        <UNavigationMenu :items="footerLinks" />
      </template>
    </UFooter>
  </UApp>
</template>
