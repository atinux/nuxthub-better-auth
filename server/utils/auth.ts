import { D1Dialect } from '@atinux/kysely-d1'
import type { D1Database } from '@cloudflare/workers-types'
import { betterAuth } from 'better-auth'
import { admin, anonymous } from 'better-auth/plugins'
import { Kysely } from 'kysely'

let _auth: ReturnType<typeof betterAuth>
export function serverAuth() {
  if (!_auth) {
    const db = hubDatabase() as unknown as D1Database
    _auth = betterAuth({
      database: {
        db: new Kysely({
          dialect: new D1Dialect({
            database: db,
          }),
        }),
        type: 'sqlite',
      },
      secondaryStorage: {
        get: key => hubKV().getItemRaw(`_auth:${key}`),
        set: (key, value, ttl) => {
          return hubKV().set(`_auth:${key}`, value, { ttl })
        },
        delete: key => hubKV().del(`_auth:${key}`),
      },
      baseURL: getBaseURL(),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
      account: {
        accountLinking: {
          enabled: true,
        },
      },
      plugins: [anonymous(), admin()],
    })
  }
  return _auth
}

function getBaseURL() {
  const envBase = process.env.BETTER_AUTH_URL
  const runtimeAppUrl = (() => {
    try {
      const rc = useRuntimeConfig?.()
      return rc?.appUrl as string | undefined
    }
    catch {
      return undefined
    }
  })()

  let baseURL = envBase || runtimeAppUrl

  if (!baseURL) {
    try {
      baseURL = getRequestURL(useEvent()).origin
    }
    catch {
      // ignore
    }
  }

  return typeof baseURL === 'string' ? baseURL.replace(/\/+$/, '') : baseURL
}
