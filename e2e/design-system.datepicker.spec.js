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
