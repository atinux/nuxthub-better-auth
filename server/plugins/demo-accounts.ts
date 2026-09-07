import { hashPassword } from 'better-auth/crypto'
import { db } from 'hub:db'
import { user, account } from '#auth/schema'
import { demoAccounts, demoPassword } from '#shared/demo-accounts'

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) return

  let seeded = false

  nitroApp.hooks.hook('request', async (event) => {
    if (seeded || !useRuntimeConfig(event).public.demoAccountsEnabled) return

    const password = await hashPassword(demoPassword)
    const users = Object.entries(demoAccounts).map(([role, demo]) => ({
      id: `demo-${role}`,
      name: demo.label,
      email: demo.email,
      emailVerified: true,
      isAnonymous: false,
      role,
    }))

    await db.batch([
      db.insert(user).values(users).onConflictDoNothing(),
      db.insert(account).values(users.map(demo => ({
        id: `${demo.id}-credential`,
        accountId: demo.id,
        providerId: 'credential',
        userId: demo.id,
        password,
        updatedAt: new Date(),
      }))).onConflictDoNothing(),
    ])

    seeded = true
  })
})
