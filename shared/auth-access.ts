import { createAccessControl } from 'better-auth/plugins/access'

export const demoStatement = {
  demo: ['read'],
} as const

export const demoAccess = createAccessControl(demoStatement)
export const demoUserRole = demoAccess.newRole({ demo: [] })
export const demoAdminRole = demoAccess.newRole({ demo: ['read'] })
