import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createClient } from '@libsql/client'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../.nuxt/hub/db/schema.mjs'

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
