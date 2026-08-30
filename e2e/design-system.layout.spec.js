import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
})

test.describe('layout regressions caught by eye, not by jsdom', () => {
  test('the stat block is inset by the card padding like its siblings', async ({ page }) => {
    // Regression: this block shipped as a bare child of DemoCard's slot, so it
    // rendered flush to the card edge while the header and DemoBlocks were
    // inset by px-card-x. Compares two live elements rather than a magic number.
    const section = page.locator('[data-section="specs"]')
    const heading = section.locator('h2')
    // NOTE: deviates from the brief's `[data-stat-block] [data-figure]` selector.
    // That selector measures the data-figure span, which sits a further 17px
    // right of the card edge (StatCard's own 1px border + 16px px-4 padding) --
    // unrelated to px-card-x and present regardless of the regression. Verified
    // live: the StatCard root's own left edge (this selector) lands exactly on
    // headingBox.x (diff 0px) on fixed code, while [data-figure] measured 17px
    // off on the SAME fixed code -- a false failure. This targets what the
    // adjacent comment actually describes: the card's own left edge.
    const firstStat = section.locator('[data-stat-block] .specs-section__stat-grid > *').first()

    const headingBox = await heading.boundingBox()
    const statBox = await firstStat.boundingBox()

    expect(headingBox).not.toBeNull()
    expect(statBox).not.toBeNull()
    // The stat card's own left edge sits at the section's content inset. Allow
    // 1px for the card's own border, nothing more.
    expect(Math.abs(statBox.x - headingBox.x)).toBeLessThanOrEqual(2)
  })

  test('the five stage cards sit in one row, not a vertical stack', async ({ page }) => {
    // Regression: at the page's real column width the stage grid's own
    // minmax() could not fit two columns, so all five cards stacked under a
    // heading reading "A WORKFLOW WITH VOLUME PER STEP".
    const cards = page.locator('[data-section="tabs"] [role="tab"]:has([data-step])')
    await expect(cards).toHaveCount(5)

    const boxes = await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.getBoundingClientRect().top),
    )
    const first = boxes[0]
    for (const [i, top] of boxes.entries()) {
      expect(Math.abs(top - first), `stage card ${i} wrapped to another row`).toBeLessThanOrEqual(2)
    }
  })

  test("the multi-select panel matches its trigger's width", async ({ page }) => {
    // Regression: Zag defaults the positioner to minWidth:max-content, so the
    // panel sized to its longest option — roughly 100px narrower than its own
    // field — until `sameWidth: true` was passed.
    const trigger = page.locator('[data-section="dropdowns"] [aria-label="Services"]')
    const triggerBox = await trigger.boundingBox()
    await trigger.click()

    const panel = page.locator('[role="listbox"]:visible')
    await expect(panel).toBeVisible()
    const panelBox = await panel.boundingBox()

    expect(Math.abs(panelBox.width - triggerBox.width), 'panel is not trigger width').toBeLessThanOrEqual(2)
  })
})
