import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createClient } from '@libsql/client'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../.nuxt/hub/db/schema.mjs'
import { seedDemoAccounts } from '../server/utils/seed-demo-accounts.ts'
import { demoAccounts, demoPassword } from '../shared/demo-accounts.ts'

test('initial migration supports signup, login, and sessions', async () => {
  const client = createClient({ url: ':memory:' })
  try {
    const migrations = new URL('../server/db/migrations/sqlite/', import.meta.url)
    const journal = JSON.parse(await readFile(new URL('meta/_journal.json', migrations), 'utf8'))
    for (const migration of journal.entries) {
      await client.executeMultiple(await readFile(new URL(`${migration.tag}.sql`, migrations), 'utf8'))
    }

    const auth = betterAuth({
      baseURL: 'http://localhost:3000',
      secret: 'schema-regression-secret-at-least-32-characters',
      database: drizzleAdapter(drizzle(client, { schema }), { provider: 'sqlite', schema }),
      emailAndPassword: { enabled: true },
    })

    const password = 'schema-regression-password'
    const created = await auth.api.signUpEmail({
      body: { name: 'New user', email: 'new@example.com', password },
    })
    const { headers, response: signedIn } = await auth.api.signInEmail({
      body: { email: 'new@example.com', password },
      returnHeaders: true,
    })
    assert.equal(signedIn.user.id, created.user.id)
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: headers.getSetCookie().map(cookie => cookie.split(';')[0]).join('; ') }),
    })
    assert.equal(session.user.id, created.user.id)
  }
  finally {
    client.close()
  }
})

test('demo seeding skips email collisions and preserves existing credentials on restart', async () => {
  const client = createClient({ url: ':memory:' })
  try {
    await client.executeMultiple(await readFile(new URL('../server/db/migrations/sqlite/0000_amazing_the_initiative.sql', import.meta.url), 'utf8'))
    const db = drizzle(client, { schema })
    const auth = betterAuth({
      baseURL: 'http://localhost:3000',
      secret: 'schema-regression-secret-at-least-32-characters',
      database: drizzleAdapter(db, { provider: 'sqlite', schema }),
      emailAndPassword: { enabled: true },
    })
    const password = 'existing-user-private-password'
    const existing = await auth.api.signUpEmail({
      body: { name: 'Existing user', email: demoAccounts.user.email, password },
    })
    const before = (await client.execute('SELECT * FROM user')).rows

    await seedDemoAccounts(db, schema)
    const accounts = (await client.execute('SELECT * FROM account ORDER BY id')).rows
    await seedDemoAccounts(db, schema)
    assert.deepEqual((await client.execute('SELECT * FROM account ORDER BY id')).rows, accounts)
    assert.deepEqual((await client.execute({ sql: 'SELECT * FROM user WHERE id = ?', args: [existing.user.id] })).rows, before)

    const signedIn = await auth.api.signInEmail({ body: { email: existing.user.email, password } })
    assert.equal(signedIn.user.id, existing.user.id)
    await assert.rejects(auth.api.signInEmail({ body: { email: existing.user.email, password: demoPassword } }))
    const admin = await auth.api.signInEmail({ body: { email: demoAccounts.admin.email, password: demoPassword } })
    assert.equal(admin.user.id, 'demo-admin')
    assert.equal((await client.execute({ sql: 'SELECT role FROM user WHERE id = ?', args: ['demo-admin'] })).rows[0].role, 'admin')
    assert.equal(accounts.length, 2)
  }
  finally {
    client.close()
  }
})

for (const idCollision of [false, true]) {
  test(`concurrent demo seeding is safe ${idCollision ? 'with an ID collision' : 'on a fresh database'}`, async () => {
    const client = createClient({ url: ':memory:' })
    try {
      await client.executeMultiple(await readFile(new URL('../server/db/migrations/sqlite/0000_amazing_the_initiative.sql', import.meta.url), 'utf8'))
      const db = drizzle(client, { schema })
      if (idCollision) {
        await db.insert(schema.user).values({ id: 'demo-user', name: 'Existing user', email: 'existing@example.com' })
      }
      await Promise.all([seedDemoAccounts(db, schema), seedDemoAccounts(db, schema)])

      const accounts = (await client.execute('SELECT userId FROM account ORDER BY userId')).rows.map(row => row.userId)
      assert.deepEqual(accounts, idCollision ? ['demo-admin'] : ['demo-admin', 'demo-user'])
      assert.equal((await client.execute('SELECT count(*) AS count FROM user')).rows[0].count, 2)
      assert.deepEqual((await client.execute('PRAGMA foreign_key_check')).rows, [])
    }
    finally {
      client.close()
    }
  })
}
