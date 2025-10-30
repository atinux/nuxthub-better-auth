<script setup>
const { signOut, loggedIn } = useAuth()
const headerLinks = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'User',
    to: '/user',
  },
  {
    label: 'Secret',
    to: '/secret',
  },
  {
    label: 'About',
    to: '/about',
  },
]
const footerLinks = [
  {
    label: 'Source code',
    to: 'https://github.com/atinux/nuxthub-better-auth',
    target: '_blank',
  },
  {
    label: 'NuxtHub',
    to: 'https://hub.nuxt.com',
    target: '_blank',
  },
  {
    label: 'Better Auth',
    to: 'https://better-auth.com',
    target: '_blank',
  },
  {
    label: 'Nuxt UI Pro',
    to: 'https://ui.nuxt.com/pro',
    target: '_blank',
  },
]
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <UHeader title="NuxtHub x BetterAuth" :links="headerLinks">
      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/atinux/nuxthub-better-auth"
          icon="i-simple-icons-github"
          color="gray"
          variant="ghost"
          target="_blank"
        />
        <UButton v-if="loggedIn" color="black" @click="signOut({ redirectTo: '/' })">
          Sign Out
        </UButton>
      </template>
    </UHeader>
    <UContainer>
      <UMain class="min-h-[calc(100vh-160px)]">
        <NuxtPage />
      </UMain>
    </UContainer>
    <UFooter :links="footerLinks" />
  </UApp>
</template>
