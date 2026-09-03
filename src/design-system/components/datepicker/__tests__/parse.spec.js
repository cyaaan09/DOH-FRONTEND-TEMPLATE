import { describe, expect, it } from 'vitest'
import { formatDate, parseDateInput, toIso } from '../parse.js'

/**
 * Appendix C: "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04 ·
 * normalised on blur". All three examples denote the SAME date, which is what
 * makes the slash form day-first — and is asserted here, because it is the only
 * evidence in the artifact for an order its calendar contradicts.
 */
const iso = (value, options) => {
  const parts = parseDateInput(value, options)
  return parts ? toIso(parts) : null
}

describe('parseDateInput', () => {
  it('reads all three redlined formats as the same date', () => {
    expect(iso('04/09/2026')).toBe('2026-09-04')
    expect(iso('4 Sep 26')).toBe('2026-09-04')
    expect(iso('2026-09-04')).toBe('2026-09-04')
  })

  it('accepts the looser shapes of each', () => {
    expect(iso('4/9/26')).toBe('2026-09-04')
    expect(iso('04 September 2026')).toBe('2026-09-04')
    expect(iso('Sep 4, 2026')).toBe('2026-09-04')
    expect(iso('04-09-2026')).toBe('2026-09-04')
  })

  it('reads a four-digit leading group as ISO whatever the order', () => {
    // Unambiguous by shape: no day or month has four digits, so this form does
    // not need — and must not obey — the order setting.
    expect(iso('2026-09-04', { order: 'mdy' })).toBe('2026-09-04')
    expect(iso('2026-09-04', { order: 'dmy' })).toBe('2026-09-04')
  })

  it('swaps day and month with the order, and only for the numeric form', () => {
    expect(iso('04/09/2026', { order: 'dmy' })).toBe('2026-09-04')
    expect(iso('04/09/2026', { order: 'mdy' })).toBe('2026-04-09')
    // the textual forms name their month, so nothing to swap
    expect(iso('4 Sep 26', { order: 'mdy' })).toBe('2026-09-04')
  })

  it('rejects a date that does not exist rather than rolling it over', () => {
    // Date's constructor would turn 31 February into 3 March. A licensing
    // record silently moved to another month is worse than a rejected keystroke.
    expect(iso('31/02/2026')).toBeNull()
    expect(iso('2026-09-31')).toBeNull()
    expect(iso('13/13/2026')).toBeNull()
    expect(iso('00/09/2026')).toBeNull()
  })

  it('knows which Februaries have 29 days', () => {
    expect(iso('29/02/2024')).toBe('2024-02-29')
    expect(iso('29/02/2026')).toBeNull()
    expect(iso('29/02/2000')).toBe('2000-02-29')
    expect(iso('29/02/1900')).toBeNull()
  })

  it('expands a two-digit year on the POSIX pivot', () => {
    // 26 has to be 2026 for a system whose dates cluster around now, and 99 has
    // to stay 1999 for a facility registered then.
    expect(iso('1/1/26')).toBe('2026-01-01')
    expect(iso('1/1/68')).toBe('2068-01-01')
    expect(iso('1/1/69')).toBe('1969-01-01')
    expect(iso('1/1/99')).toBe('1999-01-01')
  })

  it('returns null for anything that is not a date', () => {
    // null, not a guess: the caller leaves the previous value alone, so a
    // half-typed field never commits.
    const inputs = ['', '   ', 'rubbish', '426', '20260926', '4 Foo 26', null, undefined]
    // as a map, so a failure names the input that parsed rather than just
    // reporting that something did
    expect(inputs.filter((value) => parseDateInput(value) !== null)).toEqual([])
  })
})

describe('formatDate', () => {
  it('writes the form the artifact displays', () => {
    // The artifact's own field renders `04 Sep 2026` — not a slash form at all,
    // which is what makes the display unambiguous whichever order is set.
    expect(formatDate({ year: 2026, month: 9, day: 4 })).toBe('04 Sep 2026')
    expect(formatDate({ year: 2026, month: 12, day: 31 })).toBe('31 Dec 2026')
  })

  it('round-trips every accepted format to one display', () => {
    const inputs = ['04/09/2026', '4 Sep 26', '2026-09-04', '4/9/26']
    expect(inputs.map((value) => formatDate(parseDateInput(value)))).toEqual(
      inputs.map(() => '04 Sep 2026'),
    )
  })
})
