import { describe, expect, it } from 'vitest'
import { applyMask, caretAfterDigits, isMaskable, maskDate } from '../mask.js'

describe('date input mask', () => {
  it('inserts each separator as its group fills', () => {
    // The behaviour that was asked for: typing digits never requires a slash.
    expect(maskDate('1')).toBe('1')
    expect(maskDate('12')).toBe('12/')
    expect(maskDate('1212')).toBe('12/12/')
    expect(maskDate('12122')).toBe('12/12/2')
    expect(maskDate('12122026')).toBe('12/12/2026')
  })

  it('advances as soon as a digit can only mean one thing', () => {
    // A day cannot begin with 4-9 (31 is the most there is), so in the
    // day-first default, typing 4 can only be the 4th. Waiting for a second
    // digit that cannot come is what made the field feel wrong.
    expect(maskDate('4')).toBe('04/')
    expect(maskDate('9')).toBe('09/')
    // 3 waits, because 30 and 31 exist — and 0-2 obviously do.
    expect(maskDate('0')).toBe('0')
    expect(maskDate('2')).toBe('2')
    expect(maskDate('3')).toBe('3')
  })

  it('moves the thresholds with the field order, not the position', () => {
    // The rule belongs to the FIELD: a month cannot begin with 2-9 either, but
    // it CAN begin with 1 (10, 11, 12), where a day can also be 15 or 19. Get
    // this backwards and the mask silently commits `4` as April in a field
    // whose first group is the day.
    expect(maskDate('2', false, 'mdy')).toBe('02/')
    expect(maskDate('2', false, 'dmy')).toBe('2')
    // second group, same swap in reverse
    expect(maskDate('123', false, 'mdy')).toBe('12/3')
    expect(maskDate('123', false, 'dmy')).toBe('12/03/')
  })

  it('applies the rule to the second group at its own threshold', () => {
    // day-first: the second group is the MONTH, so 2-9 advance and 0-1 wait.
    expect(maskDate('124')).toBe('12/04/')
    expect(maskDate('129')).toBe('12/09/')
    expect(maskDate('121')).toBe('12/1')
    expect(maskDate('120')).toBe('12/0')
  })

  it('never auto-advances while deleting', () => {
    // Otherwise backspacing into a single digit would pad it straight back and
    // the field would grow as the user tried to shorten it.
    expect(maskDate('4', true)).toBe('4')
    expect(maskDate('12/4', true)).toBe('12/4')
  })

  it('re-punctuates a value that already has slashes', () => {
    expect(maskDate('12/12/2026')).toBe('12/12/2026')
    expect(maskDate('12/1')).toBe('12/1')
  })

  it('caps the numeric form at eight digits', () => {
    // The reported bug: this value was accepted whole and the calendar jumped
    // to December 9999.
    expect(maskDate('12/12/202612121')).toBe('12/12/2026')
    expect(maskDate('999999999999')).toBe('99/99/9999')
  })

  it('does not re-add the separator the user is deleting', () => {
    // Without this the field traps you: backspace removes the slash, the mask
    // puts it straight back, and the value can never get shorter.
    expect(maskDate('12/12', true)).toBe('12/12')
    expect(maskDate('12', true)).toBe('12')
    expect(maskDate('12/', true)).toBe('12')
  })

  it('steps aside for every other format the redline names', () => {
    // Redline "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04".
    expect(isMaskable('4 Sep 26')).toBe(false)
    expect(isMaskable('2026-09-26')).toBe(false)
    expect(isMaskable('12/12/2026')).toBe(true)
    expect(isMaskable('')).toBe(true)
  })

  it('places the caret by digit count, not character count', () => {
    expect(caretAfterDigits('12/12/2026', 0)).toBe(0)
    expect(caretAfterDigits('12/12/2026', 2)).toBe(2)
    expect(caretAfterDigits('12/12/2026', 3)).toBe(4)
    // skipSeparator steps over a slash the mask just placed
    expect(caretAfterDigits('12/12/', 4, true)).toBe(6)
    expect(caretAfterDigits('12/12/', 4, false)).toBe(5)
    expect(caretAfterDigits('12/12/2026', 8)).toBe(10)
    expect(caretAfterDigits('12/12/2026', 99)).toBe(10)
  })

  describe('applyMask on a live element', () => {
    const field = (value, selectionStart = value.length) => {
      let range = [selectionStart, selectionStart]
      return {
        value,
        selectionStart,
        setSelectionRange: (a, b) => {
          range = [a, b]
        },
        get caret() {
          return range[0]
        },
      }
    }

    it('steps the caret past a separator it just placed', () => {
      const el = field('1212')
      expect(applyMask(el, 'insertText')).toBe(true)
      expect(el.value).toBe('12/12/')
      expect(el.caret).toBe(6)
    })

    it('puts the caret after a padded group, not inside it', () => {
      // Padding 4 to 04 adds a digit the raw value never had, so counting
      // digits would land the caret between the zero and the four.
      const el = field('4')
      expect(applyMask(el, 'insertText')).toBe(true)
      expect(el.value).toBe('04/')
      expect(el.caret).toBe(3)
    })

    it('never walks the caret forward while deleting', () => {
      // Otherwise backspace steps over the slash and eats the digit beyond it.
      const el = field('12/12/', 6)
      expect(applyMask(el, 'deleteContentBackward')).toBe(true)
      expect(el.value).toBe('12/12')
      expect(el.caret).toBe(5)
    })

    it('reports no change when the value is already masked', () => {
      const el = field('12/12/2026')
      expect(applyMask(el, 'insertText')).toBe(false)
      expect(el.value).toBe('12/12/2026')
    })

    it('leaves a non-numeric value completely alone', () => {
      const el = field('4 Sep 26')
      expect(applyMask(el, 'insertText')).toBe(false)
      expect(el.value).toBe('4 Sep 26')
    })

    it('keeps the caret near the edit when editing mid-value', () => {
      // "1_2/12/2026" with the caret after the first digit: inserting there
      // must not throw the caret to the end of the field.
      const el = field('132/12/2026', 2)
      applyMask(el, 'insertText')
      expect(el.value).toBe('13/21/2202')
      expect(el.caret).toBe(3)
    })
  })
})
