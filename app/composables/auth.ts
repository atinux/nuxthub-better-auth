import { defu } from 'defu'
import { createAuthClient } from 'better-auth/client'
import type { InferSessionFromClient, InferUserFromClient, ClientOptions } from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
  })

  const options = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  })
  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
  const user = useState<InferUserFromClient<ClientOptions> | null>('auth:user', () => null)

  client.useSession.subscribe((newSession) => {
    if (newSession.data) {
      session.value = newSession.data.session || null
      user.value = newSession.data.user || null
    }
    if (newSession.error) {
      session.value = null
      user.value = null
    }
  })

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    options,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = await client.signOut()
      await navigateTo(redirectTo || options.redirectGuestTo)
      return res
    },
    async fetchSession() {
      const { data } = await client.getSession({
        fetchOptions: {
          headers,
        },
      })
      session.value = data?.session || null
      user.value = data?.user || null
      return data
    },
    client,
  }
}
