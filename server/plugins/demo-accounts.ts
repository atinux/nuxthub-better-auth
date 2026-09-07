import { db } from 'hub:db'
import * as schema from '#auth/schema'
import { seedDemoAccounts } from '../utils/seed-demo-accounts'

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) return

  let seeded = false

  nitroApp.hooks.hook('request', async (event) => {
    if (seeded || !useRuntimeConfig(event).public.demoAccountsEnabled) return

    await seedDemoAccounts(db, schema)

    seeded = true
  })
})
