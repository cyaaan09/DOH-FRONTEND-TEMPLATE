import { test, expect } from '@playwright/test'

/**
 * The date field's input mask, against the real Zag machine.
 *
 * This cannot be a unit test. The mask logic has its own tests, but the thing
 * that broke twice here is the INTEGRATION: Zag owns this input, reads
 * event.target.value in its own handler and patches the element back from
 * machine state. A mask listening on the input itself was registered after
 * Zag's handler and lost both ways — it saw the value too late and its edit was
 * overwritten on the next patch. It passed every unit test while doing nothing
 * in a browser. Only typing into the real field shows that.
 */
const fieldAt = (page, index) =>
  page.locator('[data-section="date-picker"] [data-dp-input]').nth(index)

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
  await page.locator('[data-section]').first().waitFor()
})

test('inserts each separator as its group fills', async ({ page }) => {
  const field = fieldAt(page, 0)
  await field.click()

  const seen = []
  for (const char of '12122026') {
    await field.type(char, { delay: 10 })
    seen.push(await field.inputValue())
  }
  expect(seen).toEqual([
    '1',
    '12/',
    '12/1',
    '12/12/',
    '12/12/2',
    '12/12/20',
    '12/12/202',
    '12/12/2026',
  ])
})

test('advances a group as soon as its digit can only mean one thing', async ({ page }) => {
  // No month begins with 2-9, so typing 4 can only mean April: the field fills
  // the leading zero and moves to the day rather than waiting for a second
  // digit that cannot come. Only 0-3 can begin a two-digit day, so the day has
  // its own threshold — which is why 15 still takes both keystrokes.
  const field = fieldAt(page, 0)
  await field.click()

  const seen = []
  for (const char of '492026') {
    await field.type(char, { delay: 10 })
    seen.push(await field.inputValue())
  }
  expect(seen).toEqual(['04/', '04/09/', '04/09/2', '04/09/20', '04/09/202', '04/09/2026'])

  // 3 advances the month, then 1 must wait because 15 and 31 both exist
  await field.fill('')
  await field.type('3152026', { delay: 10 })
  expect(await field.inputValue()).toBe('03/15/2026')

  // and the caret sits after the padded group, not inside it
  await field.fill('')
  await field.type('4', { delay: 10 })
  expect(await field.evaluate((el) => el.selectionStart)).toBe(3)
})

test('cannot be typed past a whole date', async ({ page }) => {
  // The reported bug: the field accepted 12/12/202612121 and the calendar
  // jumped to December 9999. Eight digits is a date; there is no ninth.
  const field = fieldAt(page, 0)
  await field.click()
  await field.type('12122026' + '12121', { delay: 10 })
  expect(await field.inputValue()).toBe('12/12/2026')

  await page.keyboard.press('Tab')
  expect(await field.inputValue()).toBe('12/12/2026')
})

test('backspace walks back out of the value', async ({ page }) => {
  // A mask that re-adds the separator you just deleted traps you in the field.
  const field = fieldAt(page, 0)
  await field.click()
  await field.type('1212', { delay: 10 })
  expect(await field.inputValue()).toBe('12/12/')

  await field.press('Backspace')
  expect(await field.inputValue()).toBe('12/12')
  await field.press('Backspace')
  expect(await field.inputValue()).toBe('12/1')
})

test('masks the range field too, not just the single one', async ({ page }) => {
  const field = fieldAt(page, 1)
  await field.click()
  await field.type('01152026', { delay: 10 })
  expect(await field.inputValue()).toBe('01/15/2026')
})

/**
 * Appendix C's "Month header" row specifies a centred label and ‹ › buttons and
 * nothing else — so reaching a date three years out was 39 clicks on ›, which
 * is the opposite of the row that says "typing beats clicking for a date three
 * years out". Recorded as a deliberate addition in spec §17.3.
 *
 * The trap this guards: DatePickerViewTrigger was already in the markup before
 * these views existed. Clicking the month label switched the machine's view to
 * one that rendered nothing, so the calendar sat there looking broken with no
 * error anywhere.
 */
const openPanel = async (page) => {
  await page.locator('[data-section="date-picker"] [data-dp-trigger]').first().click()
  const panel = page.locator('[data-section="date-picker"] [data-dp-panel]').first()
  await panel.waitFor()
  return panel
}

// All three views are mounted at once and only the active one is displayed, so
// an unqualified .first() resolves to a hidden node from another view and the
// click hangs until the test times out. Everything below asks for the visible
// one by name.
const visible = (panel, selector) => panel.locator(`${selector}:visible`)

test('drills up from days to months to years', async ({ page }) => {
  const panel = await openPanel(page)
  await expect(visible(panel, '[data-dp-header]')).toContainText('September 2026')

  await visible(panel, '[data-dp-view]').click()
  await expect(panel.locator('[data-dp-month-grid]')).toBeVisible()
  await expect(visible(panel, '[data-dp-header]')).toContainText('2026')
  await expect(visible(panel, '[data-dp-cell]')).toHaveCount(12)

  await visible(panel, '[data-dp-view]').click()
  await expect(panel.locator('[data-dp-year-grid]')).toBeVisible()
  await expect(visible(panel, '[data-dp-header]')).toContainText('2020 - 2029')
  await expect(visible(panel, '[data-dp-cell]')).toHaveCount(10)
})

test('picking a year then a month lands back on that month of days', async ({ page }) => {
  // The round trip is the point. Drilling up is useless if coming back down
  // does not actually move the calendar.
  const panel = await openPanel(page)
  await visible(panel, '[data-dp-view]').click()
  await visible(panel, '[data-dp-view]').click()

  await visible(panel, '[data-dp-cell]').filter({ hasText: /^2028$/ }).click()
  await expect(panel.locator('[data-dp-month-grid]')).toBeVisible()
  await expect(visible(panel, '[data-dp-header]')).toContainText('2028')

  await visible(panel, '[data-dp-cell]').filter({ hasText: /^Mar$/ }).click()
  await expect(panel.locator('[data-dp-month-grid]')).toBeHidden()
  await expect(visible(panel, '[data-dp-header]')).toContainText('March 2028')
  // and it is a real calendar again, not an empty view
  expect(await visible(panel, '[data-dp-day]').count()).toBeGreaterThan(27)
})

test('keeps unavailable months visible and struck, never hidden', async ({ page }) => {
  // Redline "Day states · unavailable --border-soft struck" and the rule card
  // "Unavailable, not hidden". The single-date demo is min 2026-09-03, so
  // everything before September is out of range.
  const panel = await openPanel(page)
  await visible(panel, '[data-dp-view]').click()

  const january = visible(panel, '[data-dp-cell]').filter({ hasText: /^Jan$/ })
  await expect(january).toBeVisible()
  await expect(january).toHaveAttribute('data-disabled', '')
  expect(await january.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain(
    'line-through',
  )
})

test('the footer explains the strike in every view, not just the days', async ({ page }) => {
  // Appendix D.1's rule card is two halves: "Out-of-range days stay visible
  // with a strike, WITH THE REASON SPELLED OUT IN THE FOOTER — a missing day
  // looks like a bug." Adding the month and year views put struck cells on two
  // screens the footer did not reach, which left the strike unexplained — the
  // half of the rule that actually does the work.
  const panel = await openPanel(page)
  for (const view of ['day', 'month', 'year']) {
    if (view !== 'day') await visible(panel, '[data-dp-view]').click()
    const footer = visible(panel, '[data-dp-footer]')
    await expect(footer, `${view} view`).toHaveCount(1)
    await expect(footer).toContainText('Before 03 Sep unavailable')
    await expect(footer).toContainText('Today')
  }
})
