<script setup lang="ts">
definePageMeta({
  auth: {
    only: 'guest',
    redirectUserTo: '/user',
  },
})
const auth = useAuth()
const toast = useToast()
const tabs = [{
  slot: 'signin',
  label: 'Sign In',
  icon: 'i-heroicons-user',
}, {
  slot: 'signup',
  label: 'Sign Up',
  icon: 'i-heroicons-user-plus',
}]

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)

async function signIn() {
  if (loading.value) return
  loading.value = true
  const { error } = await auth.signIn.email({
    email: email.value,
    password: password.value,
  })
  if (error) {
    toast.add({
      title: error.message,
      color: 'error',
    })
  }
  else {
    await navigateTo('/user')
    toast.add({
      title: `You have been signed in!`,
    })
  }
  loading.value = false
}

async function signUp() {
  if (loading.value) return
  loading.value = true
  const { error } = await auth.signUp.email({
    email: email.value,
    password: password.value,
    name: name.value,
  })
  if (error) {
    toast.add({
      title: error.message,
      color: 'error',
    })
  }
  else {
    toast.add({
      title: `You have been signed up!`,
    })
    await navigateTo('/user')
  }
  loading.value = false
}
</script>

<template>
  <UPageBody class="py-12 sm:py-16">
    <div class="mx-auto max-w-xl space-y-3 text-center">
      <UBadge
        variant="solid"
        color="primary"
        class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium"
      >
        <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
        Welcome back
      </UBadge>
    </div>
    <UCard
      class="mx-auto mt-8 max-w-xl border border-gray-200/20 bg-white/70 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70"
      :ui="{
        header: 'p-0',
        body: 'p-6 sm:p-8',
        footer: 'p-0',
      }"
    >
      <UTabs
        :items="tabs"
        class="w-full"
        size="lg"
      >
        <template #signin>
          <form class="flex flex-col gap-4" @submit.prevent="signIn">
            <UFormField label="Email" name="email" required>
              <UInput v-model="email" type="email" placeholder="Email" />
            </UFormField>
            <UFormField label="Password" name="password" required>
              <UInput v-model="password" type="password" placeholder="Password" />
            </UFormField>
            <UButton
              class="w-full justify-center"
              type="submit"
              color="neutral"
              :loading="loading"
              :disabled="!email || !password"
            >
              Sign In
            </UButton>
            <UButton
              class="w-full justify-center"
              icon="i-simple-icons-github"
              type="button"
              color="neutral"
              @click="auth.signIn.social({ provider: 'github', callbackURL: '/user' })"
            >
              Sign In with Github
            </UButton>
          </form>
        </template>
        <template #signup>
          <form class="flex flex-col gap-4" @submit.prevent="signUp">
            <UFormField label="Email" name="email" required>
              <UInput v-model="email" type="email" placeholder="Email" />
            </UFormField>
            <UFormField label="Password" name="password" required>
              <UInput v-model="password" type="password" placeholder="Password" />
            </UFormField>
            <UFormField label="Name">
              <UInput v-model="name" type="name" placeholder="Name" />
            </UFormField>
            <UButton
              class="w-full justify-center"
              type="submit"
              :loading="loading"
              color="neutral"
            >
              Sign Up
            </UButton>
          </form>
        </template>
      </UTabs>
    </UCard>
  </UPageBody>
</template>
