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

test('lands the account block at the foot of the rail', async ({ page }) => {
  // Redline "Rail surface · sticky top 0 · h 100vh" and "Rail footer · pad
  // 12px 14px · --surface-card-muted". Without the height the footer sat
  // directly under the last nav item with bare canvas below it — the rail
  // looked truncated, and .rail__body's flex-1 had nothing to expand into.
  await page.goto('/login')
  await signIn(page)
  await page.locator('[data-app-shell]').waitFor()

  const rail = await page.locator('[data-app-sidebar]').boundingBox()
  const footer = await page.locator('[data-account]').boundingBox()
  expect(rail.height).toBeGreaterThanOrEqual(page.viewportSize().height - 1)
  expect(footer.y + footer.height).toBeCloseTo(rail.y + rail.height, 0)
})

test('never nests a card inside a card', async ({ page }) => {
  // Redline "Section · cards never nest — divide (1px --divider) or sink
  // (--surface-sunken) instead". The dashboard wrapped six cards in a Section,
  // which is a seventh card around the other six. Checked on every app page,
  // because the rule is about the page and not about one component.
  // Signed in ONCE: a second visit to /login redirects to the dashboard, so
  // signing in per iteration waits forever for a field that is not there.
  await page.goto('/login')
  await signIn(page)
  for (const path of ['/dashboard', '/second-page']) {
    await page.goto(path)
    await page.locator('[data-page]').waitFor()
    const nested = await page.evaluate(() => {
      const CARD = '[data-ds-section], [data-chart-panel], [data-chart-stat], [data-card]'
      return [...document.querySelectorAll(CARD)]
        .filter((el) => el.parentElement?.closest(CARD))
        .map((el) => el.tagName + '.' + String(el.className).slice(0, 30))
    })
    expect(nested, `on ${path}`).toEqual([])
  }
})

test('gives every app page a title', async ({ page }) => {
  // Also a guard against a silent failure mode: an unresolved component renders
  // as NOTHING in a production build, with no console error. PageHeader went
  // missing exactly that way when its import did not survive an edit, and the
  // page still looked plausible.
  await page.goto('/login')
  await signIn(page)
  for (const [path, title] of [
    ['/dashboard', 'Dashboard'],
    ['/second-page', 'Second page'],
  ]) {
    await page.goto(path)
    await expect(page.locator('[data-page-title]')).toHaveText(title)
  }
})

test('uses the redline’s wide bucket, not the reading column', async ({ page }) => {
  // Appendix C "Content max-w · 1320px detail · 1560px tables". The narrower
  // value is for a reading column; a dashboard of side-by-side panels is a wide
  // overview, and at 1320 it left a canvas margin wider than the nav rail on
  // any large monitor.
  await page.setViewportSize({ width: 2000, height: 1000 })
  await page.goto('/login')
  await signIn(page)
  await page.locator('[data-app-shell]').waitFor()

  const inner = await page.locator('[data-page] > div').boundingBox()
  expect(Math.round(inner.width)).toBe(1560)

  // and the gutter each side stays smaller than the rail, which is the thing
  // that made it read as wasted space rather than as breathing room
  const main = await page.locator('[data-app-main]').boundingBox()
  expect((main.width - inner.width) / 2).toBeLessThan(244)
})

test('the chart panels bottom out together', async ({ page }) => {
  // The panels sit in a stretch grid, so the shorter one is pulled to the
  // height of the taller. The artifact's own line panel flexes its plot BOX
  // while pinning the chart inside it to 108px, which left ~90px of dead space
  // under the line whenever the ranked-bars panel beside it was taller.
  // LineChart's `fill` stretches the plot itself; the viewBox is unchanged
  // because preserveAspectRatio="none" does the work.
  await page.setViewportSize({ width: 2040, height: 1100 })
  await page.goto('/login')
  await signIn(page)
  await page.locator('[data-app-shell]').waitFor()

  const panel = await page.locator('[data-chart-panel]').first().boundingBox()
  const chart = await page.locator('[data-line-chart]').boundingBox()
  // only the panel's own 16px bottom padding may remain
  expect(panel.y + panel.height - (chart.y + chart.height)).toBeLessThan(24)

  // and stretching must not cost the chart its parts
  await expect(page.locator('[data-x-axis]')).toBeVisible()
  expect(await page.locator('[data-gridlines] span').count()).toBe(3)
})
