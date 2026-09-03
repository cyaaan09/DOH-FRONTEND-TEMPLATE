import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'
import { useAuthStore } from '@/stores/auth'

// Routes are auto-generated from files in src/pages by unplugin-vue-router,
// then wrapped with layouts from src/layouts by vite-plugin-vue-layouts-next.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

/**
 * Everything needs a session except the routes that say otherwise.
 *
 * Closed by default, on purpose: a guard written the other way round — a list
 * of protected routes — leaks every page somebody forgets to add to it, and
 * forgetting is silent. A page opts out with `meta.public`, which is visible in
 * the page's own route block rather than in a list somewhere else.
 */
const PUBLIC_ROUTES = new Set(['/login'])

const isPublic = (to) => to.meta.public === true || PUBLIC_ROUTES.has(to.path)

router.beforeEach((to) => {
  // Inside the guard, not at module scope: Pinia is not installed yet when this
  // file is first evaluated, and calling it there throws on boot.
  const auth = useAuthStore()

  if (!auth.isAuthenticated && !isPublic(to)) {
    // Carry where they were going, so a deep link survives signing in.
    return { path: '/login', query: to.fullPath === '/' ? {} : { next: to.fullPath } }
  }

  // A signed-in user on the login page has nothing to do there.
  if (auth.isAuthenticated && to.path === '/login') {
    return { path: '/dashboard' }
  }

  return true
})

export default router
