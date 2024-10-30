import { betterAuth } from 'better-auth'
import { D1Dialect } from '@atinux/kysely-d1'
import { anonymous, admin } from 'better-auth/plugins'

let _auth: ReturnType<typeof betterAuth>
export function hubAuth() {
  let baseURL = process.env.BETTER_AUTH_URL
  if (!baseURL) {
    try {
      baseURL = getRequestURL(useEvent()).origin
    }
    catch (e) {}
  }
  if (!_auth) {
    _auth = betterAuth({
      database: {
        dialect: new D1Dialect({
          database: hubDatabase(),
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
      baseURL,
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
      plugins: [anonymous(), admin()],
      // session: {
      //   cookieCache: {
      //     enabled: true,
      //     maxAge: 5 * 60, // Cache duration in seconds
      //   },
      // },
    })
  }
  return _auth
}
