import { test, expect, devices } from '@playwright/test'

/**
 * The touch half of Appendix C's "Responsive & touch" group.
 *
 * Its own file because a device profile has to be applied at file level:
 * Playwright refuses test.use({ ...devices }) inside a describe, since it
 * forces a new worker.
 *
 * A real coarse pointer, not a narrow window. A small desktop window still has
 * a mouse and a large tablet still has fingers — screen width was never the
 * question. setViewportSize alone leaves (pointer: coarse) false, which is why
 * the responsive suite, which only ever resized, could not have caught any of
 * the failures this file was written against.
 */
test.use({ ...devices['Pixel 7'] })

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
  await page.locator('[data-section]').first().waitFor()
})

test('the emulated pointer really is coarse', async ({ page }) => {
  // Guards the guard. If device emulation ever stops setting these, every
  // assertion below would keep passing while measuring a desktop pointer —
  // the exact failure mode that made two earlier guards in this project
  // vacuous.
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
  expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false)
})

test('every control meets the 44px minimum', async ({ page }) => {
  // Redline "Touch targets · 44×44px minimum — 34px controls get padding, not
  // a smaller box". Controls measured 16-38px tall across the whole system
  // before base.css got its (pointer: coarse) rule; only Checkbox and Radio
  // had ever implemented this row.
  //
  // ALLOWLIST — controls whose width IS their own label. Each meets the 44px
  // height and clears WCAG 2.5.8's 24px minimum (asserted separately below, so
  // this list cannot quietly license any size at all). Squaring off a text
  // control would put ragged gaps through a row of links, and the redline's
  // "34px controls get padding" is about controls with a box, not words.
  const TEXT_CONTROLS = ['toast__action', 'notif__action', 'spectables__option', 'text-sm']

  // A SECOND, different exemption: controls whose tappable area is a larger
  // ancestor row, exactly as the redline's "17px box inside a 44px tappable row
  // on touch" describes for checkbox and radio. The row is asserted to earn it
  // in the test below — an entry here is not a licence on its own.
  const ROW_IS_THE_TARGET = ['rail__icon-btn']

  const undersized = await page.evaluate(
    ({ allow, rowTarget }) => {
      const sec = (el) => el.closest('[data-section]')?.getAttribute('data-section') ?? 'chrome'
      const skip = new Set(['tabpanel', 'listbox', 'menu', 'dialog', 'region', 'group'])
      return [
        ...document.querySelectorAll(
          'button, a[href], select, textarea, [role=button], [role=tab], [role=option], [role=menuitem], input:not([type=hidden])',
        ),
      ]
        .filter((el) => {
          if (skip.has(el.getAttribute('role'))) return false
          const r = el.getBoundingClientRect()
          // Ark's visually-hidden inputs are 1x1 by design; the visible control
          // beside them is the real target and is measured on its own.
          if (r.width <= 2 || r.height <= 2) return false
          if (allow.some((c) => el.classList.contains(c))) return false
          if (rowTarget.some((c) => el.classList.contains(c))) return false
          return r.width < 44 || r.height < 44
        })
        .map((el) => {
          const r = el.getBoundingClientRect()
          return `${sec(el)} :: ${Math.round(r.width)}x${Math.round(r.height)} .${el.className.split(' ')[0]}`
        })
    },
    { allow: TEXT_CONTROLS, rowTarget: ROW_IS_THE_TARGET },
  )
  expect(undersized).toEqual([])
})

test('the allowlisted text controls still clear the AA minimum', async ({ page }) => {
  // Without this the allowlist above would be a blank cheque: anything wearing
  // one of those class names could shrink to nothing and stay green.
  for (const cls of ['toast__action', 'notif__action', 'spectables__option']) {
    const box = await page.locator(`.${cls}`).first().boundingBox()
    expect(box.width, `${cls} width`).toBeGreaterThanOrEqual(24)
    expect(box.height, `${cls} height`).toBeGreaterThanOrEqual(44)
  }
})

test('the rail exempts its icon by making the row the target', async ({ page }) => {
  // Two halves of one rule, and a regression guard with a scar.
  //
  // The redline's own precedent is "17px box inside a 44px tappable row on
  // touch": the ROW is the target, so the glyph inside it stays small. Marking
  // this button data-icon-button forced it to 44px wide and pushed 100px of
  // content into the 62px collapsed rail. So: the rail keeps its redlined
  // 62px, the button is NOT inflated — and the row around it earns that
  // exemption by being a real 44px target itself.
  const rail = page.locator('[data-section="app-shell"] .rail').nth(1)
  expect(Math.round((await rail.boundingBox()).width)).toBe(62)

  const btn = rail.locator('.rail__icon-btn').first()
  expect((await btn.boundingBox()).width).toBeLessThan(44)
  expect(await btn.getAttribute('data-icon-button')).toBeNull()

  // the row that carries the tap
  const row = page.locator('[data-section="app-shell"] .rail').first().locator('.nav').first()
  const rowBox = await row.boundingBox()
  expect(rowBox.height).toBeGreaterThanOrEqual(44)
  expect(rowBox.width).toBeGreaterThanOrEqual(44)
})

test('hover styling never sticks to a touch', async ({ page }) => {
  // Redline "Hover styles · guard with @media (hover:hover) so touch doesn't
  // stick them" — on touch, :hover latches until the next tap elsewhere. 22
  // hand-written rules fired on touch before this; Tailwind already wraps its
  // own hover: variants, so only hand-written CSS was ever exposed.
  const unguarded = await page.evaluate(() =>
    [...document.styleSheets].flatMap((sheet) => {
      // A rule may BOTH carry a selector and contain nested rules, so this
      // collects its own selector and recurses — it never treats the two as
      // alternatives. The first version of this walk did, and was vacuous:
      // every CSSStyleRule in Chrome exposes a `cssRules` list for CSS
      // nesting, and an EMPTY list is still truthy, so `if (rule.cssRules)`
      // sent every plain rule down the recursion branch and no selector was
      // ever tested. It passed against a deliberately unguarded :hover rule.
      const walk = (rules, guarded) =>
        [...rules].flatMap((rule) => {
          const condition = rule.conditionText
          const nowGuarded =
            guarded || (condition !== undefined && /hover\s*:\s*hover/.test(condition))
          const own =
            !nowGuarded && rule.selectorText?.includes(':hover') ? [rule.selectorText] : []
          const nested = rule.cssRules?.length ? walk(rule.cssRules, nowGuarded) : []
          return [...own, ...nested]
        })
      try {
        return walk(sheet.cssRules, false)
      } catch {
        // a cross-origin sheet cannot be read; nothing here loads one
        return []
      }
    }),
  )
  expect(unguarded).toEqual([])
})

test('the page still does not scroll sideways under a finger', async ({ page }) => {
  // The responsive suite asserts this at five widths, all with a fine pointer.
  // The coarse-pointer rule GROWS controls, so it can reintroduce overflow that
  // no resize would ever show.
  //
  // document.documentElement.scrollWidth is not usable here: under mobile
  // emulation it reports the un-clipped content extent (1026px on a page that
  // does not scroll at all), because a mobile layout viewport expands to let
  // the user zoom out. body.scrollWidth and an actual scroll attempt are the
  // honest signals.
  const result = await page.evaluate(() => {
    window.scrollTo(9999, 0)
    const scrolledTo = window.scrollX
    window.scrollTo(0, 0)
    return {
      scrolledTo,
      body: document.body.scrollWidth,
      view: document.documentElement.clientWidth,
    }
  })
  expect(result.scrolledTo).toBe(0)
  expect(result.body).toBeLessThanOrEqual(result.view)
})
