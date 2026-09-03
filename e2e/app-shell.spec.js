import { test, expect } from '@playwright/test'

/**
 * The application shell: sign in, land on the dashboard, move between pages.
 *
 * These run against the real router guard and the real store, because the parts
 * most likely to break are the seams between them — a redirect that loses the
 * page you asked for, a session that does not survive a refresh, an active
 * state that does not follow the route.
 */
const signIn = async (page, email = 'juan.dela.cruz@doh.gov.ph') => {
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test('sends a signed-out visitor to the login page', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('returns to the page that was asked for, not just the dashboard', async ({ page }) => {
  // A deep link that survives signing in. Without the `next` round trip, every
  // shared URL lands the recipient on the dashboard instead.
  await page.goto('/second-page')
  await expect(page).toHaveURL(/\/login\?next=\/second-page/)
  await signIn(page)
  await expect(page).toHaveURL(/\/second-page$/)
})

test('signs in and lands on the dashboard inside the shell', async ({ page }) => {
  await page.goto('/login')
  await signIn(page)
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('[data-app-shell]')).toBeVisible()
  await expect(page.locator('[data-chart-panel]').first()).toBeVisible()
})

test('names the signed-in user in both the rail and the header', async ({ page }) => {
  // Both take { initials, name, role } — `mark` is the BRAND's key, and mixing
  // them up leaves an empty grey circle with no error anywhere.
  await page.goto('/login')
  await signIn(page)
  await expect(page.locator('[data-app-shell]')).toBeVisible()
  await expect(page.locator('[data-sidebar]')).toContainText('Juan Dela Cruz')
  await expect(page.locator('[data-sidebar]')).toContainText('Regional Licensing Officer')
  for (const avatar of await page.locator('[class*="avatar"]').all()) {
    await expect(avatar).toHaveText('JC')
  }
})

test('moves between the two pages and follows the active state', async ({ page }) => {
  await page.goto('/login')
  await signIn(page)
  await expect(page).toHaveURL(/\/dashboard$/)

  const dashboard = page.getByRole('button', { name: 'Dashboard' })
  const second = page.getByRole('button', { name: 'Second page' })
  await expect(dashboard).toHaveAttribute('aria-current', 'page')

  await second.click()
  await expect(page).toHaveURL(/\/second-page$/)
  await expect(second).toHaveAttribute('aria-current', 'page')
  await expect(dashboard).not.toHaveAttribute('aria-current', 'page')
  // the breadcrumb is derived from the nav, so it follows without being told
  await expect(page.locator('[data-app-header]')).toContainText('Second page')
})

test('keeps the session across a reload', async ({ page }) => {
  await page.goto('/login')
  await signIn(page)
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.reload()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('[data-app-shell]')).toBeVisible()
})

test('has nothing for a signed-in user to do on the login page', async ({ page }) => {
  await page.goto('/login')
  await signIn(page)
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/login')
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('leaves the component gallery reachable without a session', async ({ page }) => {
  // It is documentation, not application data — and every other e2e spec in
  // this suite navigates straight to it.
  await page.goto('/design-system')
  await expect(page).toHaveURL(/\/design-system$/)
  await expect(page.locator('[data-section]').first()).toBeVisible()
})

test('the shell fills the viewport rather than stopping under the rail', async ({ page }) => {
  // AppShell is min-height:100%, which resolves to nothing without a height
  // chain — the rail ended under the account block and left bare canvas below.
  await page.goto('/login')
  await signIn(page)
  await page.locator('[data-app-shell]').waitFor()
  const rail = await page.locator('[data-sidebar-rail]').boundingBox()
  expect(rail.height).toBeGreaterThanOrEqual(page.viewportSize().height)
})
