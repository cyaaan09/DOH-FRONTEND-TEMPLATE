/**
 * Input mask for the date field.
 *
 * Redline "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04 ·
 * normalised on blur · calendar is never the only path". A mask that forced
 * digits would delete two of those three formats, so this one is conditional:
 * it engages only while the value is digits and slashes, and steps aside the
 * moment a letter or a dash appears. `4 Sep 26` and `2026-09-26` type exactly
 * as they did before.
 *
 * It also caps the numeric form at eight digits. Without that the field
 * accepted `12/12/202612121` and the calendar jumped to December 9999 — the
 * bug that prompted the mask.
 */

/** The mask owns the value only while it could still become MM/DD/YYYY. */
export const isMaskable = (value) => /^[\d/]*$/.test(value)

/**
 * The three groups, in the order the field accepts them, each with the digit
 * above which a single keystroke can only be a one-digit value.
 *
 * Month: no month starts with 2-9, so typing 4 can only mean April — pad it to
 * 04 and move on rather than waiting for a second digit that cannot come.
 * Day: same from 4 up, since only 0-3 can begin a two-digit day.
 * Year: four digits, nothing to infer.
 *
 * The thresholds belong to the FIELD, not the position: day-first swaps which
 * group leads, and with it which digit can still take a second one. Getting
 * that wrong is silent — the mask would commit `4` as April in a field whose
 * first group is the day.
 */
const MONTH = { size: 2, padAbove: '1' }
const DAY = { size: 2, padAbove: '3' }
const YEAR = { size: 4 }

/** The three groups in the order this field accepts them. */
const groupsFor = (order) => (order === 'mdy' ? [MONTH, DAY, YEAR] : [DAY, MONTH, YEAR])

/**
 * @param {string} raw       the field's current value
 * @param {boolean} deleting true when the edit was a backspace or delete
 * @returns {string} the value re-punctuated as MM/DD/YYYY
 */
export function maskDate(raw, deleting = false, order = 'dmy') {
  const digits = raw.replace(/\D/g, '')
  const groups = []
  let read = 0

  const GROUPS = groupsFor(order)
  for (const group of GROUPS) {
    if (read >= digits.length) break
    let chunk = digits.slice(read, read + group.size)
    read += chunk.length
    let complete = chunk.length === group.size

    // Auto-advance: a lone digit that cannot begin a two-digit value is that
    // value, so fill the leading zero and treat the group as done. Never while
    // deleting — padding a group the user is backing out of would grow the
    // field as they try to shorten it.
    if (!complete && !deleting && chunk.length === 1 && group.padAbove && chunk > group.padAbove) {
      chunk = `0${chunk}`
      complete = true
    }

    groups.push({ chunk, complete })
    if (!complete) break
  }

  if (groups.length === 0) return ''
  const value = groups.map((g) => g.chunk).join('/')
  const finished = groups[groups.length - 1].complete

  // A trailing separator once a group fills, so typing runs straight through —
  // but not on the last group, and not while deleting.
  return finished && groups.length < GROUPS.length && !deleting ? `${value}/` : value
}

/**
 * Where the caret belongs after `n` digits of the masked value.
 *
 * Counting DIGITS rather than characters is what keeps an edit in the middle of
 * the value from throwing the caret to the end: the separators move, the digits
 * around the caret do not.
 */
export function caretAfterDigits(masked, n, skipSeparator = false) {
  if (n <= 0) return 0
  let seen = 0
  for (let i = 0; i < masked.length; i++) {
    if (masked[i] >= '0' && masked[i] <= '9' && ++seen === n) {
      // Typing forward, step over a separator the mask just placed, so the
      // next digit lands in the next group instead of before the slash.
      // Never while deleting: there the caret must stay where the user left
      // it, or backspace walks forward and eats the wrong character.
      return skipSeparator && masked[i + 1] === '/' ? i + 2 : i + 1
    }
  }
  return masked.length
}

/**
 * Applies the mask to a live input element, in place.
 *
 * Returns true when it changed the value, so the caller knows whether the
 * component needs to be told. Mutating the element rather than round-tripping
 * through a ref is deliberate: this input belongs to Zag's state machine, and
 * the value it reads on blur is whatever is on the element at that moment.
 */
export function applyMask(el, inputType = '', order = 'dmy') {
  const raw = el.value
  if (!isMaskable(raw)) return false

  const deleting = String(inputType).startsWith('delete')
  const masked = maskDate(raw, deleting, order)
  if (masked === raw) return false

  const at = el.selectionStart ?? raw.length
  el.value = masked

  // Typing at the end is the overwhelmingly common case and the only one where
  // auto-advance applies, so it gets the simple answer. Counting digits would
  // be wrong there: padding 4 to 04 adds a digit the raw value never had, and
  // the caret would land between the zero and the four.
  const caret =
    at === raw.length
      ? masked.length
      : caretAfterDigits(masked, raw.slice(0, at).replace(/\D/g, '').length, !deleting)
  el.setSelectionRange(caret, caret)
  return true
}
