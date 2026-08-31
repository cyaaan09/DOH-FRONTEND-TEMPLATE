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
 * @param {string} raw       the field's current value
 * @param {boolean} deleting true when the edit was a backspace or delete
 * @returns {string} the value re-punctuated as MM/DD/YYYY
 */
export function maskDate(raw, deleting = false) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)

  // A trailing separator is added as soon as a group fills, so typing runs
  // straight through — but NOT while deleting. Re-adding the slash the user
  // just removed would make the field impossible to back out of, which is the
  // classic way a mask traps someone mid-correction.
  const group = (from, to) => digits.slice(from, to)
  let out = group(0, 2)
  if (digits.length > 2) out += `/${group(2, 4)}`
  else if (digits.length === 2 && !deleting) out += '/'
  if (digits.length > 4) out += `/${group(4, 8)}`
  else if (digits.length === 4 && !deleting) out += '/'
  return out
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
export function applyMask(el, inputType = '') {
  const raw = el.value
  if (!isMaskable(raw)) return false

  const deleting = String(inputType).startsWith('delete')
  const masked = maskDate(raw, deleting)
  if (masked === raw) return false

  const before = raw.slice(0, el.selectionStart ?? raw.length).replace(/\D/g, '').length
  el.value = masked
  const caret = caretAfterDigits(masked, before, !deleting)
  el.setSelectionRange(caret, caret)
  return true
}
