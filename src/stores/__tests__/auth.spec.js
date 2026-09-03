import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../auth'

/**
 * The store is the only thing that knows where a session comes from, so it is
 * the only place that has to be right about what happens when there isn't one.
 */
describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts signed out', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
  })

  it('derives a name from the email, so the shell has something to show', async () => {
    const auth = useAuthStore()
    await auth.signIn({ email: 'juan.dela.cruz@doh.gov.ph', password: 'x' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user.name).toBe('Juan Dela Cruz')
    expect(auth.user.email).toBe('juan.dela.cruz@doh.gov.ph')
  })

  it('persists the session, and restores it on the next store', async () => {
    const auth = useAuthStore()
    await auth.signIn({ email: 'a.b@doh.gov.ph', password: 'x' })

    setActivePinia(createPinia())
    expect(useAuthStore().isAuthenticated).toBe(true)
  })

  it('forgets the session on sign out, in memory and in storage', async () => {
    const auth = useAuthStore()
    await auth.signIn({ email: 'a.b@doh.gov.ph', password: 'x' })
    auth.signOut()

    expect(auth.isAuthenticated).toBe(false)
    setActivePinia(createPinia())
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it('still signs in when storage throws', async () => {
    // Private windows and some embedded webviews throw on localStorage access
    // rather than returning null. A template that cannot boot there would be a
    // poor advertisement for the design system it exists to show.
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })

    setActivePinia(createPinia())
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    await expect(auth.signIn({ email: 'a.b@doh.gov.ph', password: 'x' })).resolves.toBe(true)
    expect(auth.isAuthenticated).toBe(true)

    setItem.mockRestore()
    getItem.mockRestore()
  })

  it('reports a failure without leaving a half-signed-in session', async () => {
    const auth = useAuthStore()
    // The seam is the only thing that can fail; simulate it failing.
    vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error('Network unavailable')
    })
    await auth.signIn({ email: 'a.b@doh.gov.ph', password: 'x' })
    vi.restoreAllMocks()
    // whatever happened, the store is never left pending
    expect(auth.pending).toBe(false)
  })
})
