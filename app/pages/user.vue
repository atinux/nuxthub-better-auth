<script setup>
// https://better-auth.vercel.app/docs/integrations/nuxt#ssr-usage
const session = await auth.useSession(useFetch)

watch(() => session.data.value, (data) => {
  if (!data) {
    navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div>
    <pre>{{ session }}</pre>
    <UButton @click="auth.signOut()">
      Sign Out
    </UButton>
  </div>
</template>
