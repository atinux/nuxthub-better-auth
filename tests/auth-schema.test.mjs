import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createClient } from '@libsql/client'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { hashPassword } from 'better-auth/crypto'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../.nuxt/hub/db/schema.mjs'

test('migrations preserve existing logins and allow new credential accounts', async () => {
  const client = createClient({ url: ':memory:' })
  try {
    const migrations = new URL('../server/db/migrations/sqlite/', import.meta.url)
    const journal = JSON.parse(await readFile(new URL('meta/_journal.json', migrations), 'utf8'))
    const [initial, ...upgrades] = journal.entries
    await client.executeMultiple(await readFile(new URL(`${initial.tag}.sql`, migrations), 'utf8'))

    const password = 'schema-regression-password'
    await client.execute({
      sql: 'INSERT INTO user (id, name, email) VALUES (?, ?, ?)',
      args: ['existing-user', 'Existing user', 'existing@example.com'],
    })
    await client.execute({
      sql: 'INSERT INTO account (id, issuer, accountId, providerId, userId, password, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: ['existing-account', 'local:credential', 'existing-user', 'credential', 'existing-user', await hashPassword(password), Date.now()],
    })

    for (const migration of upgrades) {
      await client.executeMultiple(await readFile(new URL(`${migration.tag}.sql`, migrations), 'utf8'))
    }

    const auth = betterAuth({
      baseURL: 'http://localhost:3000',
      secret: 'schema-regression-secret-at-least-32-characters',
      database: drizzleAdapter(drizzle(client, { schema }), { provider: 'sqlite', schema }),
      emailAndPassword: { enabled: true },
    })

    const existing = await auth.api.signInEmail({
      body: { email: 'existing@example.com', password },
    })
    assert.equal(existing.user.id, 'existing-user')

    const created = await auth.api.signUpEmail({
      body: { name: 'New user', email: 'new@example.com', password },
    })
    const signedIn = await auth.api.signInEmail({
      body: { email: 'new@example.com', password },
    })
    assert.equal(signedIn.user.id, created.user.id)
    assert.equal((await client.execute('SELECT count(*) AS count FROM account')).rows[0].count, 2)
  }
  finally {
    client.close()
  }
})
