<script setup lang="ts">
definePageMeta({
  auth: false,
})
</script>

<template>
  <UPageBody>
    <UCard class="mx-auto mt-8 max-w-2xl">
      <template #header>
        <h1 class="text-2xl font-bold">
          About the template
        </h1>
      </template>
      <p class="text-muted">
        This page is public: you can visit it signed in or signed out. The User and Secret pages require a session, while Admin also requires the admin role.
      </p>
    </UCard>
  </UPageBody>
</template>
