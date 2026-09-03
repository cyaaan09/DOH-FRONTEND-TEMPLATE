import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Who is signed in.
 *
 * The sign-in itself is mocked, but only in ONE place — `requestSignIn` below.
 * Everything else (the guard, the layout, the account menu) reads this store and
 * does not know or care where the session came from, so pointing this at a real
 * backend is a change to one function rather than a hunt through the app.
 */

const STORAGE_KEY = 'doh.session'

/**
 * THE SEAM. Replace the body with a real request and nothing else changes:
 *
 *   import { api } from '@/lib/api'
 *   const { user, token } = await api.post('/auth/login', { email, password })
 *   return { name: user.name, email: user.email, role: user.role, token }
 *
 * Until then any credentials are accepted, because a template that cannot be
 * clicked through is not a template. It deliberately does NOT pretend to
 * validate a password — a fake check invites someone to trust it.
 */
async function requestSignIn({ email }) {
  const name = email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')

  return {
    name: name || 'Signed-in user',
    email,
    role: 'Regional Licensing Officer',
    // A real backend returns a token here. Nothing reads this yet; it exists so
    // the shape does not change when the seam is closed.
    token: null,
  }
}

/**
 * Sessions survive a refresh, which is what makes the app usable while pages
 * are being built on top of it. Wrapped because storage throws outright in a
 * private window and in some embedded webviews — a design system demo that
 * cannot boot there would be a poor advertisement for it.
 */
function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredSession(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // A session that cannot be persisted still works for this tab.
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(readStoredSession())
  const pending = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => user.value !== null)

  async function signIn(credentials) {
    pending.value = true
    error.value = ''
    try {
      user.value = await requestSignIn(credentials)
      writeStoredSession(user.value)
      return true
    } catch (cause) {
      // The message is shown to the user, so it says what to do next rather
      // than repeating a status code at them.
      error.value = cause?.message || 'Could not sign in. Check your details and try again.'
      return false
    } finally {
      pending.value = false
    }
  }

  function signOut() {
    user.value = null
    error.value = ''
    writeStoredSession(null)
  }

  return { user, pending, error, isAuthenticated, signIn, signOut }
})
