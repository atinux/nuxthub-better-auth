<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()
</script>

<template>
  <UApp>
    <UError :error="error" :clear="{ label: 'Back to Home' }" />
  </UApp>
</template>
