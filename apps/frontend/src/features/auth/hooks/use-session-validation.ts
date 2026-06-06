import { useAuthControllerMe } from '@/api/generated/auth/auth'
import { isAuthenticated } from '@/lib/auth'

// Validates the persisted token on app load (e.g. browser refresh) by fetching
// the current user. An invalid/expired token triggers a 401, which the Axios
// response interceptor handles by clearing the token and redirecting to login.
export function useSessionValidation() {
  const enabled = isAuthenticated()
  const { isLoading, isError } = useAuthControllerMe({
    query: { enabled, retry: false, staleTime: 5 * 60 * 1000 },
  })

  return { validating: enabled && isLoading, invalid: enabled && isError }
}
