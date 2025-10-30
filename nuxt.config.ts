// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxt/ui', '@nuxt/eslint'],
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      auth: {
        redirectUserTo: '/user',
        redirectGuestTo: '/',
      },
    },
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-07-30',

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    database: true,
    kv: true,
  },

  // https://eslint.nuxt.com
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
  },
})
