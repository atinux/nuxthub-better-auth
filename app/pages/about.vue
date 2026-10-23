<script setup lang="ts">
definePageMeta({
  auth: false,
})
</script>

<template>
  <UContainer>
    <UPageHeader
      title="About the Template"
      description="This page is public: you can visit it signed in or signed out. The User and Secret pages require a session, while Admin also requires the admin role."
    />
  </UContainer>
</template>
