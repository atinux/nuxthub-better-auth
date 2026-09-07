import { defineClientAuth } from '@nuxtjs/better-auth/config'
import { adminClient, anonymousClient } from 'better-auth/client/plugins'
import { demoAccess, demoAdminRole, demoUserRole } from '#shared/auth-access'

export default defineClientAuth({
  plugins: [
    anonymousClient(),
    adminClient({
      ac: demoAccess,
      roles: {
        user: demoUserRole,
        admin: demoAdminRole,
      },
    }),
  ],
})
