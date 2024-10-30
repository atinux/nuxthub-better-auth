import { defu } from 'defu'

type MiddlewareOptions = false | {
  /**
   * Only apply auth middleware to guest or user
   */
  only?: 'guest' | 'user'
  /**
   * Redirect authenticated user to this route
   */
  redirectUserTo?: string
  /**
   * Redirect guest to this route
   */
  redirectGuestTo?: string
}

declare module '#app' {
  interface PageMeta {
    auth?: MiddlewareOptions
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: MiddlewareOptions
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  // If auth is disabled, skip middleware
  if (to.meta?.auth === false) {
    return
  }
  const { loggedIn, options, fetchSession } = useAuth()
  const { only, redirectUserTo, redirectGuestTo } = defu(to.meta?.auth, options)

  // If guest mode, redirect if authenticated
  if (only === 'guest' && loggedIn.value) {
    // Avoid infinite redirect
    if (to.path === redirectUserTo) {
      return
    }
    return navigateTo(redirectUserTo)
  }

  // If client-side, fetch session between each navigation
  if (import.meta.client) {
    await fetchSession()
  }
  // If not authenticated, redirect to home
  if (!loggedIn.value) {
    // Avoid infinite redirect
    if (to.path === redirectGuestTo) {
      return
    }
    return navigateTo(redirectGuestTo)
  }
})
