const cloudflareDatabaseId = process.env.NUXT_HUB_CLOUDFLARE_DATABASE_ID
const isVercelBuild = Boolean(process.env.VERCEL || process.env.NITRO_PRESET?.startsWith('vercel'))
const isNodeBuild = process.env.NITRO_PRESET === 'node-server'

export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxtjs/better-auth', '@nuxt/ui', '@nuxt/eslint'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    githubClientId: '',
    githubClientSecret: '',
    public: {
      demoAccountsEnabled: false,
      githubAuthEnabled: false,
    },
  },

  routeRules: {
    '/': { auth: { only: 'guest', redirectTo: '/user' } },
    '/user': { auth: 'user' },
    '/secret': { auth: 'user' },
    '/admin': { auth: { only: 'user', user: { role: 'admin' } } },
  },

  compatibilityDate: '2026-09-03',

  nitro: {
    cloudflare: {
      wrangler: {
        name: 'atinux-nuxthub-better-auth',
        workers_dev: true,
        preview_urls: false,
      },
    },
  },

  hub: {
    db: {
      dialect: 'sqlite',
      applyMigrationsDuringBuild: !isVercelBuild,
      connection: isVercelBuild
        ? { url: '', authToken: '' }
        : isNodeBuild
          ? { url: 'file:.data/db/sqlite.db', authToken: '' }
          : cloudflareDatabaseId
            ? { databaseId: cloudflareDatabaseId }
            : undefined,
    },
  },

  auth: {
    redirects: {
      login: '/',
      authenticated: '/user',
      logout: '/',
    },
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
  },
})
