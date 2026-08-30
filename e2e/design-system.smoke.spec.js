import { expect, test } from '@playwright/test'

test.describe('design-system page', () => {
  test('loads and renders every section in the manifest', async ({ page }) => {
    await page.goto('/design-system')

    // Spec §17 — the page is a checklist of the whole system; a section that
    // fails to render is invisible rather than obviously broken.
    const sections = page.locator('[data-section]')
    await expect(sections).toHaveCount(15)

    for (const id of ['foundations', 'tabs', 'dropdowns', 'buttons', 'tokens']) {
      await expect(page.locator(`[data-section="${id}"]`)).toBeVisible()
    }
  })

  test('still shows unbuilt work as visible gaps', async ({ page }) => {
    // Sanity: the page is a progress checklist. If gaps ever hit zero while
    // sections remain incomplete, the markers have been lost, not the work done.
    await page.goto('/design-system')
    expect(await page.locator('[data-gap]').count()).toBeGreaterThan(0)
  })
})
