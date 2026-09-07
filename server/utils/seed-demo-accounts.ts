import type { db as hubDb } from 'hub:db'
import type * as authSchema from '#auth/schema'
import { hashPassword } from 'better-auth/crypto'
import { sql } from 'drizzle-orm'
import { demoAccounts, demoPassword } from '../../shared/demo-accounts.ts'

export async function seedDemoAccounts(db: typeof hubDb, { user, account }: typeof authSchema) {
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
    ...users.map(demo => db.run(sql`
      INSERT INTO ${account} (id, accountId, providerId, userId, password, updatedAt)
      SELECT ${`${demo.id}-credential`}, id, 'credential', id, ${password}, ${Date.now()}
      FROM ${user} WHERE id = ${demo.id} AND email = ${demo.email}
      ON CONFLICT DO NOTHING
    `)),
  ])
}
