/**
 * Reading and writing the date field's text.
 *
 * Appendix C: "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04 ·
 * normalised on blur · calendar is never the only path", and the section's own
 * rule card adds why: "A calendar-only date field is a wall for anyone entering
 * a hundred records."
 *
 * None of it was implemented. Zag's input discards letters and dashes as they
 * are typed and never normalises, so `4 Sep 26` became `426` and stayed that
 * way — measured against a build with the mask removed, so the mask was not
 * the cause. Zag takes a `parse` and a `format` prop for exactly this.
 *
 * Pure functions, no DateValue: the component turns the result into one with
 * Ark's `parseDate`, and these stay testable without a browser.
 */

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const SHORT = MONTHS.map((m) => m.slice(0, 3))

/** What the artifact's own field displays: `04 Sep 2026`. */
export function formatDate({ year, month, day }) {
  const name = SHORT[month - 1]
  const label = name ? name[0].toUpperCase() + name.slice(1) : String(month)
  return `${String(day).padStart(2, '0')} ${label} ${year}`
}

const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
const daysIn = (year, month) =>
  [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]

/**
 * Two digits to a full year, on the POSIX pivot: 00-68 is this century, 69-99
 * the last. A licensing system's dates cluster around now, so `26` must be
 * 2026 — and `99` has to remain 1999 for a facility registered then.
 */
const expandYear = (text) => {
  const n = Number(text)
  if (text.length > 2) return n
  return n <= 68 ? 2000 + n : 1900 + n
}

const monthFromName = (text) => {
  const word = text.toLowerCase()
  const exact = SHORT.indexOf(word.slice(0, 3))
  if (exact === -1) return 0
  // reject "Sept" against "September" only if the longer form disagrees
  const full = MONTHS[exact]
  return full.startsWith(word) || word.length <= 4 ? exact + 1 : 0
}

const build = (year, month, day) => {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) return null
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  if (!Number.isInteger(day) || day < 1 || day > daysIn(year, month)) return null
  return { year, month, day }
}

/**
 * Every form the redline names, and nothing else.
 *
 * @param {string} value  the field's text
 * @param {'dmy'|'mdy'} order  how to read a purely numeric date. The artifact's
 *   three examples all denote 4 September 2026, which makes `04/09/2026`
 *   day-first — but the same page draws a Sunday-first calendar, so it is not
 *   self-consistent, and the reading that matters is the one the people typing
 *   use. Hence a parameter with a recorded default rather than a constant.
 * @returns {{year:number,month:number,day:number}|null} null when it is not a
 *   date, so the caller can leave the previous value alone rather than commit a
 *   guess.
 */
export function parseDateInput(value, { order = 'dmy' } = {}) {
  const text = String(value ?? '')
    .trim()
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
  if (!text) return null

  // ISO first: a four-digit leading group is unambiguous whatever the order.
  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (iso) return build(Number(iso[1]), Number(iso[2]), Number(iso[3]))

  // `4 Sep 26`, `04 September 2026`
  const dayFirst = text.match(/^(\d{1,2}) ([A-Za-z]{3,}) (\d{2,4})$/)
  if (dayFirst) {
    const month = monthFromName(dayFirst[2])
    return month ? build(expandYear(dayFirst[3]), month, Number(dayFirst[1])) : null
  }

  // `Sep 4 2026` — not in the redline, but it is what a US-shaped habit types
  // and it cannot be confused with anything else that is.
  const monthFirst = text.match(/^([A-Za-z]{3,}) (\d{1,2}) (\d{2,4})$/)
  if (monthFirst) {
    const month = monthFromName(monthFirst[1])
    return month ? build(expandYear(monthFirst[3]), month, Number(monthFirst[2])) : null
  }

  // `04/09/2026`, `4/9/26`, `04-09-2026`
  const numeric = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/)
  if (numeric) {
    const [, a, b, y] = numeric
    const day = order === 'dmy' ? Number(a) : Number(b)
    const month = order === 'dmy' ? Number(b) : Number(a)
    return build(expandYear(y), month, day)
  }

  return null
}

/** ISO for Ark's `parseDate`, which is the only date constructor it re-exports. */
export const toIso = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
