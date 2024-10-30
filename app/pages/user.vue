<script setup>
// https://better-auth.vercel.app/docs/integrations/nuxt#ssr-usage
const auth = useAuth()
</script>

<template>
  <UPageBody>
    <h3 class="text-xl font-bold">
      User
    </h3>
    <pre>{{ auth.user }}</pre>
    <h3 class="text-xl font-bold mt-2">
      Session
    </h3>
    <pre>{{ auth.session }}</pre>
    <UButton class="mt-2" color="black" @click="auth.signOut({ redirectTo: '/' })">
      Sign Out
    </UButton>
  </UPageBody>
</template>
