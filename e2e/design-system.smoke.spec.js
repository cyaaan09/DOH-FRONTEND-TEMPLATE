import { expect, test } from '@playwright/test'
import { SECTIONS } from '../src/design-system/demo/chrome/sections.js'

test.describe('design-system page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design-system')
    // page.goto resolves on the `load` event, which on a warm cache can fire
    // before Vue finishes mounting -- leaving the DOM empty for anything that
    // reads it next. locator.count() below does not auto-wait the way
    // Playwright's action/assertion APIs do, so every test in this file must
    // first prove the app is mounted via an auto-waiting assertion.
    await expect(page.locator('[data-section]')).toHaveCount(SECTIONS.length)
    // Neither webfont (src/design-system/styles/fonts.css loads two
    // @fontsource-variable faces) is guaranteed ready by `load`; wait for both
    // before any test measures layout.
    await page.evaluate(() => document.fonts.ready)
  })

  test('loads and renders every section in the manifest', async ({ page }) => {
    // Spec §17 — the page is a checklist of the whole system; a section that
    // fails to render is invisible rather than obviously broken.
    const sections = page.locator('[data-section]')
    await expect(sections).toHaveCount(SECTIONS.length)

    // The count above only proves SECTIONS.length wrapper divs exist -- Vue's
    // v-for keeps rendering siblings even when one child throws during render,
    // replacing just that child with a Comment node, so a throwing section
    // would not move the count. Every section renders through DemoCard, which
    // always emits its own title as the section's first <h2> (a few sections
    // also nest demo content with further h2s of their own -- e.g. Containers'
    // Card example -- so .first() targets DemoCard's, which DOM order
    // guarantees comes first). A section reduced to a Comment node would
    // have no h2 at all.
    const sectionCount = await sections.count()
    for (let i = 0; i < sectionCount; i++) {
      await expect(sections.nth(i).locator('h2').first()).toBeVisible()
    }

    for (const id of ['foundations', 'tabs', 'dropdowns', 'buttons', 'tokens']) {
      await expect(page.locator(`[data-section="${id}"]`)).toBeVisible()
    }
  })

  test('still shows unbuilt work as visible gaps', async ({ page }) => {
    // Sanity: the page is a progress checklist. If gaps ever hit zero while
    // sections remain incomplete, the markers have been lost, not the work done.
    expect(await page.locator('[data-gap]').count()).toBeGreaterThan(0)
  })
})
