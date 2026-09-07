import type { db as hubDb } from 'hub:db'
import type * as authSchema from '#auth/schema'
import { hashPassword } from 'better-auth/crypto'
import { and, eq, sql } from 'drizzle-orm'
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
    ...users.map(demo => db.insert(account).select(db.select({
      id: sql<string>`${`${demo.id}-credential`}`,
      accountId: user.id,
      providerId: sql<string>`'credential'`,
      userId: user.id,
      accessToken: sql<null>`NULL`,
      refreshToken: sql<null>`NULL`,
      idToken: sql<null>`NULL`,
      accessTokenExpiresAt: sql<null>`NULL`,
      refreshTokenExpiresAt: sql<null>`NULL`,
      scope: sql<null>`NULL`,
      password: sql<string>`${password}`,
      createdAt: sql<Date>`${Date.now()}`,
      updatedAt: sql<Date>`${Date.now()}`,
    }).from(user).where(and(eq(user.id, demo.id), eq(user.email, demo.email)))).onConflictDoNothing()),
  ])
}
