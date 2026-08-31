import { test, expect } from '@playwright/test'

/**
 * Appendix C's "Responsive & touch" group specifies five breakpoints. Until
 * now the suite rendered exactly one viewport (1280x900), so every row below
 * it was unverified — not "passing", never executed.
 *
 * The generic guard is horizontal overflow: almost every responsive failure
 * shows up as the page growing wider than its own viewport.
 */
const BREAKPOINTS = [
  { name: '≥1280 — full layout', width: 1440, height: 900 },
  { name: '1024–1279 — stat grids reflow', width: 1180, height: 900 },
  { name: '<1024 — rail collapses to 62px', width: 900, height: 900 },
  { name: '<768 — rail off-canvas', width: 720, height: 900 },
  { name: '<420 — toasts go full width', width: 390, height: 844 },
]

for (const bp of BREAKPOINTS) {
  test.describe(`at ${bp.width}px (${bp.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.goto('/design-system')
      await page.locator('[data-section]').first().waitFor()
    })

    test('the page never scrolls horizontally', async ({ page }) => {
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        view: document.documentElement.clientWidth,
      }))
      expect(overflow.doc, `page is ${overflow.doc - overflow.view}px wider than the viewport`).toBeLessThanOrEqual(
        overflow.view + 1,
      )
    })

    test('no section card is overflowed by its own content', async ({ page }) => {
      // The same guard the 1280 suite runs, at every other width — this is
      // where a fixed pixel width or an unwrapped row actually shows up.
      const offenders = await page.evaluate(() => {
        const out = []
        for (const section of document.querySelectorAll('[data-section]')) {
          const card = section.querySelector('section')
          if (!card) continue
          const limit = card.getBoundingClientRect().right
          for (const child of card.querySelectorAll('*')) {
            const rect = child.getBoundingClientRect()
            if (rect.width === 0 || child.closest('[role="listbox"],[role="menu"]')) continue
            let scroller = child.parentElement
            let scrolls = false
            while (scroller && scroller !== card) {
              const ox = getComputedStyle(scroller).overflowX
              if (ox === 'auto' || ox === 'scroll') {
                scrolls = true
                break
              }
              scroller = scroller.parentElement
            }
            if (scrolls) continue
            if (rect.right - limit > 2) {
              out.push(`${section.dataset.section}: ${child.tagName.toLowerCase()}.${child.getAttribute('class')}`)
              break
            }
          }
        }
        return out
      })
      expect(offenders, `overflows at ${bp.width}px: ${offenders.join(' | ')}`).toEqual([])
    })
  })
}

test.describe('breakpoint behaviour the redline names', () => {
  test('the sidebar rail collapses to 62px under 1024px', async ({ page }) => {
    // Redline "<1024px · rail collapses to 62px".
    await page.setViewportSize({ width: 1180, height: 900 })
    await page.goto('/design-system')
    const rail = page.locator('[data-sidebar-rail]').first()
    await rail.waitFor()
    expect(Math.round((await rail.boundingBox()).width)).toBe(244)

    await page.setViewportSize({ width: 900, height: 900 })
    await expect.poll(async () => Math.round((await rail.boundingBox()).width)).toBe(62)
  })

  test('the data table scrolls rather than reflowing', async ({ page }) => {
    // Redline "Tables · never reflow — overflow-x:auto with min-width".
    await page.setViewportSize({ width: 720, height: 900 })
    await page.goto('/design-system')
    const scroller = page.locator('[data-data-table] .table__scroll')
    await scroller.waitFor()
    const { clientWidth, scrollWidth, overflowX } = await scroller.evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      overflowX: getComputedStyle(el).overflowX,
    }))
    expect(overflowX).toBe('auto')
    expect(scrollWidth).toBeGreaterThan(clientWidth)
  })
})
