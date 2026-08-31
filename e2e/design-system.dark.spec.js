import { test, expect } from '@playwright/test'

/**
 * The dark theme had never been rendered by any test. The layout gate runs
 * colorScheme: 'light' and the unit suite computes no styles at all, so 29
 * colour tokens sat unthemed — silently painting a light-mode colour on a
 * dark surface — and nobody could have noticed.
 *
 * The token-level guard now catches an unthemed TOKEN. This catches the
 * other half: a colour written past the token layer entirely.
 */
test.describe('dark theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design-system')
    await page.locator('[data-section]').first().waitFor()
    // Click the real toggle. Writing data-theme by hand does NOT work:
    // useTheme() wraps VueUse's useDark, whose own watcher rewrites the
    // attribute back to "light" within a tick — so a hand-set attribute
    // silently leaves the test measuring the LIGHT theme, which is exactly
    // what the first version of this file did.
    await page.getByRole('button', { name: 'Dark', exact: true }).click()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
      .toBe('dark')
  })

  test('paints the page on the dark canvas, not the light one', async ({ page }) => {
    const body = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(body).toBe('rgb(15, 20, 28)')
  })

  test('leaves no opaque near-white surface anywhere on the page', async ({ page }) => {
    const offenders = await page.evaluate(() => {
      const out = []
      for (const el of document.querySelectorAll('#app *')) {
        // Foundations paints each swatch from the hex it documents — that is
        // the table's content, and it is correct in both themes.
        if (el.matches('[data-chip]') && el.closest('[data-swatch]')) continue

        const bg = getComputedStyle(el).backgroundColor
        const m = bg.match(/rgba?\(([^)]+)\)/)
        if (!m) continue
        const parts = m[1].split(',').map((n) => parseFloat(n))
        const [r, g, b, a = 1] = parts
        // The dark theme's own background tints run 7–24% ("tints become the
        // tone at 14–24% over the surface"), so anything below half opacity
        // is a legitimate tint. At or above it, a near-white is a light-mode
        // colour that leaked through — an earlier version skipped everything
        // under alpha 1 and let a 90%-opaque white pass.
        if (a < 0.5) continue
        if (0.2126 * r + 0.7152 * g + 0.0722 * b > 235) {
          out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} → ${bg}`)
        }
      }
      return out
    })
    expect(offenders).toEqual([])
  })

  test('keeps text light and readable on the dark surfaces', async ({ page }) => {
    // --ink-900 in dark. If the text tokens ever stop being overridden this
    // reads as near-black on near-black, which no structural test would see.
    const heading = page.locator('[data-section] h2, [data-section] .text-section-title').first()
    const color = await heading.evaluate((el) => getComputedStyle(el).color)
    expect(color).toBe('rgb(232, 236, 243)')
  })

  test('drops card and button shadows, as the Elevation row requires', async ({ page }) => {
    // Appendix C, Dark mode → "Elevation: card/button none". Depth comes
    // from surface lightness on dark, not from shadow.
    const card = page.locator('[data-section]').first()
    expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none')
  })

  test('renders every section, with no gaps, in dark too', async ({ page }) => {
    await expect(page.locator('[data-gap]')).toHaveCount(0)
    expect(await page.locator('[data-section]').count()).toBeGreaterThan(10)
  })
})
