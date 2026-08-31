import { expect, test } from '@playwright/test'
import { SECTIONS } from '../src/design-system/demo/chrome/sections.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
  // page.goto resolves on the `load` event, which on a warm cache can fire
  // before Vue finishes mounting -- leaving the DOM empty for anything that
  // reads it next. page.evaluate and locator.count() below do not auto-wait
  // the way Playwright's action/assertion APIs do, so every test in this file
  // must first prove the app is mounted via an auto-waiting assertion.
  await expect(page.locator('[data-section]')).toHaveCount(SECTIONS.length)
  // Neither webfont (src/design-system/styles/fonts.css loads two
  // @fontsource-variable faces) is guaranteed ready by `load`. Without this,
  // every boundingBox()/getBoundingClientRect() below could measure fallback-
  // font layout instead -- a flake source, and a coverage hole (a nowrap row
  // that overflows in DM Sans may not overflow in the fallback).
  await page.evaluate(() => document.fonts.ready)
})

test.describe('layout regressions caught by eye, not by jsdom', () => {
  test('the stat block is inset by the card padding like its siblings', async ({ page }) => {
    // Regression: this block shipped as a bare child of DemoCard's slot, so it
    // rendered flush to the card edge while the header and DemoBlocks were
    // inset by px-card-x. Compares two live elements rather than a magic number.
    const section = page.locator('[data-section="specs"]')
    // .first(): a section can nest further h2s of its own (e.g. Containers'
    // Card example), so this must not assume only DemoCard's h2 exists --
    // the smoke spec's own h2 check already handles this the same way.
    const heading = section.locator('h2').first()
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

    // toBeVisible() proves the panel exists, not that its width has settled:
    // Zag/Floating-UI applies `sameWidth` through an autoUpdate cycle that can
    // land a frame later. Poll the measurement instead of taking it once, same
    // 2px tolerance as before.
    await expect
      .poll(
        async () => Math.abs((await panel.boundingBox()).width - triggerBox.width),
        { message: 'panel is not trigger width' },
      )
      .toBeLessThanOrEqual(2)
  })
})

test.describe('page-level layout guards', () => {
  test('the page never scrolls horizontally', async ({ page }) => {
    // Spec §12 — the page is the conformance surface; a horizontal scrollbar
    // means something inside it is wider than its container.
    const overflow = await page.evaluate(() => {
      const el = document.documentElement
      return el.scrollWidth - el.clientWidth
    })
    expect(overflow, 'document scrolls horizontally').toBeLessThanOrEqual(0)
  })

  test('no section card is overflowed by its own content', async ({ page }) => {
    // Catches the class the Tabs underline row hit: a flex row with no wrap and
    // whitespace-nowrap children spilling past the card, where DemoCard's
    // overflow-hidden then clips it silently.
    const { offenders, noSectionRoot } = await page.evaluate(() => {
      const offenders = []
      const noSectionRoot = []
      for (const section of document.querySelectorAll('[data-section]')) {
        const card = section.querySelector('section')
        if (!card) {
          noSectionRoot.push(section.dataset.section)
          continue
        }
        const limit = card.getBoundingClientRect().right
        for (const child of card.querySelectorAll('*')) {
          const rect = child.getBoundingClientRect()
          // Portalled panels are positioned against the viewport, not the card,
          // and are legitimately allowed outside it.
          if (rect.width === 0 || child.closest('[role="listbox"],[role="menu"]')) continue
          if (rect.right - limit > 2) {
            // getAttribute('class'), not .className: on an SVG child,
            // .className is an SVGAnimatedString, not a string, and stringifies
            // uselessly (e.g. "svg.[object SVGAnimatedString]") in the message.
            offenders.push(
              `${section.dataset.section}: ${child.tagName.toLowerCase()}.${child.getAttribute('class')}`,
            )
            break
          }
        }
      }
      return { offenders, noSectionRoot }
    })
    // A section with no <section> root falls out of the loop above with zero
    // overflow coverage and would otherwise stay silently unchecked forever --
    // fail loudly instead of passing vacuously.
    expect(
      noSectionRoot,
      `sections with no <section> root, so no overflow coverage: ${noSectionRoot.join(', ')}`,
    ).toEqual([])
    expect(offenders, `content overflows its card in: ${offenders.join(' | ')}`).toEqual([])
  })

  test('every section marked complete renders no visible gap markers', async ({ page }) => {
    for (const { id } of SECTIONS.filter((s) => s.complete)) {
      await expect(
        page.locator(`[data-section="${id}"] [data-gap]:visible`),
        `${id} is complete but shows a gap`,
      ).toHaveCount(0)
    }
    // Positive counterpart: on an unmounted or blank page every count above is
    // trivially zero. Asserting the incomplete sections DO show gaps means the
    // zero-counts cannot be satisfied by absence.
    for (const { id } of SECTIONS.filter((s) => !s.complete)) {
      await expect(
        page.locator(`[data-section="${id}"] [data-gap]:visible`),
        `${id} is incomplete but shows no gap`,
      ).not.toHaveCount(0)
    }
  })
})

test.describe('toasts actually stack inside their demo surface', () => {
  // jsdom cannot exercise Ark's Toaster: it renders through a teleport and
  // positions itself from inline styles the machine writes at runtime. This
  // is the only place the toast demo is really executed.
  test('a fired toast lands inside the app surface, not over the page', async ({ page }) => {
    const surface = page.locator('.notices__surface')
    await surface.waitFor()

    await page.getByRole('button', { name: 'Error', exact: true }).click()
    const toast = page.locator('[data-toast]').filter({ hasText: 'Upload failed' })
    await expect(toast).toBeVisible()

    const [zone, box] = await Promise.all([surface.boundingBox(), toast.boundingBox()])
    // Contained: the toast sits within its dashed panel on every edge. If
    // ToastRegion's !important override ever stops beating Ark's inline
    // `position: fixed`, the toast jumps to the viewport corner and this
    // fails — which is the whole reason the override exists.
    expect(box.x).toBeGreaterThanOrEqual(zone.x - 1)
    expect(box.y).toBeGreaterThanOrEqual(zone.y - 1)
    expect(box.x + box.width).toBeLessThanOrEqual(zone.x + zone.width + 1)
    expect(box.y + box.height).toBeLessThanOrEqual(zone.y + zone.height + 1)

    // Redline "Toast region · 372px wide".
    expect(Math.round(box.width)).toBe(372)
  })

  test('the dismiss button clears the stack', async ({ page }) => {
    await page.locator('.notices__surface').waitFor()
    await page.getByRole('button', { name: 'Warning', exact: true }).click()
    await expect(page.locator('[data-toast]').first()).toBeVisible()
    await page.locator('[data-dismiss-all]').click()
    await expect(page.locator('[data-toast]')).toHaveCount(0)
  })
})
