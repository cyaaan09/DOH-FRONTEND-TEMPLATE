import { test, expect } from '@playwright/test'

/**
 * Appendix C's "ARIA & semantics" group (20 rows) and the semantic half of
 * "Keyboard & focus" (20). They are DOM facts, so unit tests could in
 * principle cover them — but none did, and the ones that matter most are
 * cross-component: whether EVERY field has a name, whether ANY table fakes its
 * headers. A per-component test cannot ask that question, which is why these
 * live here.
 *
 * Every check collects offenders and asserts the list is empty, rather than
 * comparing a count. A count turns green the moment someone adds an exception,
 * and tells you nothing about which element broke.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
  await page.locator('[data-section]').first().waitFor()
})

test.describe('ARIA & semantics', () => {
  test('every field has an accessible name', async ({ page }) => {
    // Redline "Fields · <label for> or aria-label". TextField and Textarea
    // dropped the <label> entirely under `bare` and put nothing in its place,
    // so eight fields in the form-layout section were anonymous.
    const unnamed = await page.evaluate(() => {
      const sec = (el) => el.closest('[data-section]')?.getAttribute('data-section') ?? 'chrome'
      return [...document.querySelectorAll('input:not([type=hidden]), textarea, select')]
        .filter((el) => {
          if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false
          if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false
          return !el.closest('label')
        })
        .map((el) => `${sec(el)} :: ${el.tagName} .${el.className.split(' ')[0]}`)
    })
    expect(unnamed).toEqual([])
  })

  test('no icon-only control is anonymous', async ({ page }) => {
    // Redline "Icon-only · aria-label required (⋯ = 'Row actions', × =
    // 'Dismiss')". The stepper's nodes read as "✓, button" until this passed.
    const anonymous = await page.evaluate(() => {
      const sec = (el) => el.closest('[data-section]')?.getAttribute('data-section') ?? 'chrome'
      return [...document.querySelectorAll('button, [role=button]')]
        .filter((el) => {
          if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false
          if (el.getAttribute('title')) return false
          const text = (el.textContent ?? '').trim()
          // a glyph or a bare number names nothing
          return text.length === 0 || /^[^\p{L}]{1,2}$/u.test(text)
        })
        .map(
          (el) => `${sec(el)} :: "${(el.textContent ?? '').trim()}" .${el.className.split(' ')[0]}`,
        )
    })
    expect(anonymous).toEqual([])
  })

  test('tables are real tables with scoped column headers', async ({ page }) => {
    // Redline "Tables · real <table> with <th scope=col>; grid CSS is fine,
    // faked headers are not". DataTable was a div grid: its aria-sort sat on a
    // plain <div>, where the attribute has no defined meaning and is dropped.
    const bad = await page.evaluate(() => {
      const sec = (el) => el.closest('[data-section]')?.getAttribute('data-section') ?? 'chrome'
      const out = []
      for (const th of document.querySelectorAll('th')) {
        if (!th.getAttribute('scope')) out.push(`${sec(th)} :: <th> without scope`)
      }
      for (const el of document.querySelectorAll('[aria-sort]')) {
        const role = el.getAttribute('role')
        if (el.tagName !== 'TH' && role !== 'columnheader' && role !== 'rowheader') {
          out.push(`${sec(el)} :: aria-sort on <${el.tagName.toLowerCase()}>`)
        }
      }
      return out
    })
    expect(bad).toEqual([])

    const table = page.locator('[data-section="data-table"] table').first()
    await expect(table).toHaveAttribute('role', 'table')
    expect(await table.locator('th[scope=col]').count()).toBeGreaterThan(2)
  })

  test('every nav landmark is named, and something is current', async ({ page }) => {
    // Redline "Nav · <nav aria-label='Primary'> · active item aria-current=page".
    const unnamed = await page.evaluate(() => {
      const sec = (el) => el.closest('[data-section]')?.getAttribute('data-section') ?? 'chrome'
      return [...document.querySelectorAll('nav')]
        .filter((el) => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
        .map((el) => `${sec(el)} :: .${el.className.split(' ')[0]}`)
    })
    expect(unnamed).toEqual([])
    expect(await page.locator('[aria-current]').count()).toBeGreaterThan(0)
  })

  test('a switch announces as a switch, with state from the native property', async ({ page }) => {
    // Redline "Switch · role=switch aria-checked — not a checkbox". Recorded in
    // spec §17.3: Zag exposes no `role` prop, and on input[type=checkbox] the
    // checked IDL property IS the aria-checked state — so this asserts the
    // property rather than an attribute it would be wrong to add.
    const switches = page.locator('[role=switch]')
    expect(await switches.count()).toBeGreaterThan(0)
    for (const s of await switches.all()) {
      expect(await s.evaluate((el) => el.tagName)).toBe('INPUT')
      expect(await s.evaluate((el) => typeof el.checked)).toBe('boolean')
    }
  })

  test('skeletons are hidden inside a region that announces the wait', async ({ page }) => {
    // Redline "Skeletons · aria-hidden=true inside an aria-busy=true container".
    // Both halves, and they cannot share a node: a hidden element's aria-busy
    // is never read, so the busy region has to be the parent.
    const regions = page.locator('[data-skeleton-region]')
    expect(await regions.count()).toBeGreaterThan(0)
    for (const r of await regions.all()) {
      await expect(r).toHaveAttribute('aria-busy', 'true')
      expect(await r.evaluate((el) => !!el.querySelector('[aria-hidden=true]'))).toBe(true)
    }
  })

  test('the toast region is a polite atomic status', async ({ page }) => {
    // Redline "Toast region · aria-live=polite (assertive for error) ·
    // role=status · aria-atomic=true". Ark ships role=region aria-atomic=false,
    // which announces nothing by itself and reads only the node that changed.
    const regions = page.locator('[data-toast-region]')
    expect(await regions.count()).toBeGreaterThan(0)
    for (const r of await regions.all()) {
      await expect(r).toHaveAttribute('role', 'status')
      await expect(r).toHaveAttribute('aria-atomic', 'true')
    }
  })

  test('the first tab stop skips the navigation', async ({ page }) => {
    // Redline "Skip link · first tab stop jumps past the rail to <main>".
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => {
      const el = document.activeElement
      return { tag: el.tagName, href: el.getAttribute('href'), text: (el.textContent ?? '').trim() }
    })
    expect(focused.tag).toBe('A')
    expect(focused.href).toBe('#main')
    expect(focused.text).toMatch(/skip/i)
    await expect(page.locator('#main')).toHaveAttribute('tabindex', '-1')
  })

  test('no positive tabindex anywhere', async ({ page }) => {
    // Redline "Tab order · DOM order = visual order; no positive tabindex".
    const positive = await page.evaluate(() =>
      [...document.querySelectorAll('[tabindex]')]
        .filter((el) => Number(el.getAttribute('tabindex')) > 0)
        .map((el) => `${el.tagName}.${el.className.split(' ')[0]}`),
    )
    expect(positive).toEqual([])
  })
})
