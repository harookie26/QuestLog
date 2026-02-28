const AUTH_KEY = 'questlog-auth'
const USER_KEY = 'questlog-user'

const hasWindow = () => typeof window !== 'undefined'

const getActiveStorage = (): Storage | null => {
  if (!hasWindow()) return null

  if (localStorage.getItem(AUTH_KEY) === 'true') return localStorage
  if (sessionStorage.getItem(AUTH_KEY) === 'true') return sessionStorage
  return null
}

export const isAuthenticated = (): boolean => {
  if (!hasWindow()) return false
  return localStorage.getItem(AUTH_KEY) === 'true' || sessionStorage.getItem(AUTH_KEY) === 'true'
}

export const getStoredUser = <T = unknown>(): T | null => {
  const activeStorage = getActiveStorage()
  if (!activeStorage) return null

  const raw = activeStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const saveAuth = (user: unknown, keepSignedIn: boolean): void => {
  if (!hasWindow()) return

  const target = keepSignedIn ? localStorage : sessionStorage
  const other = keepSignedIn ? sessionStorage : localStorage

  other.removeItem(AUTH_KEY)
  other.removeItem(USER_KEY)

  target.setItem(AUTH_KEY, 'true')
  target.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = (): void => {
  if (!hasWindow()) return

  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(USER_KEY)
}
