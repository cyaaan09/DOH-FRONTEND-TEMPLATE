import { describe, expect, it } from 'vitest'
import { parseTokens, readStyle } from './parse-tokens'

/**
 * Appendix C's "Responsive & touch" group ends with thirteen contrast rows —
 * every one a specific ratio between two named colours. Nothing verified any
 * of them: they were prose in a spec, and a token could have been nudged in
 * any commit without a single test noticing.
 *
 * Two assertions per row, and both are needed:
 *   1. the ratio the redline claims is arithmetically true, and
 *   2. the TOKEN still holds the hex the claim was made about.
 * Without (2) the suite would keep passing while the palette drifted out from
 * under it; without (1) a mistyped redline would be enshrined as correct.
 */

const light = parseTokens(readStyle('tokens.css'))
const dark = parseTokens(readStyle('tokens.dark.css'))

// WCAG 2.x relative luminance — sRGB, the 0.03928/12.92 piecewise curve.
const channel = (v) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = (hex) => {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// The artifact rounds to two decimals and is not always consistent with
// itself: --ink-100 is quoted as 1.66 in "Decorative greys" and 1.65 in the
// 1.4.11 exception, against a true 1.648. This tolerance accepts its rounding
// and nothing wider — a real token change moves these by whole tenths.
const ROUNDING = 0.02

/** [ redline row, foreground token, background token or literal, claimed ratio ] */
const LIGHT_CLAIMS = [
  ['Dark on white', 'ink-900', 'surface', 15.37],
  ['Dark on white', 'ink-700', 'surface', 10.46],
  ['Dark on white', 'ink-600', 'surface', 7.69],
  ['Dark on white', 'ink-500', 'surface', 4.97],
  ['Column headers', 'text-header', 'surface', 5.89],
  // "canvas costs ~0.6 — #667085 drops to 4.39 and FAILS there"
  ['On tinted surfaces — the failing one', 'text-meta', 'canvas', 4.39],
  ['On tinted surfaces — its replacement', 'text-header', 'canvas', 5.21],
  ['Muted figures', 'ink-300', 'surface-card-muted', 2.51],
  ['Decorative greys', 'ink-400', 'surface', 3.06],
  ['Decorative greys', 'ink-300', 'surface', 2.58],
  ['Decorative greys', 'ink-100', 'surface', 1.65],
  ['Disabled', 'ink-200', 'surface', 1.81],
  ['White on green — the only safe fill', 'green-on-fill', 'green-fill', 6.01],
  ['White on green — fails', 'green-on-fill', 'green-600', 4.15],
  ['White on green — fails', 'green-on-fill', 'dot-green', 3.29],
  ['White on green — fails', 'green-on-fill', 'green-500', 3.06],
  ['Tone text on tint', 'amber-text', 'amber-100', 5.77],
  ['Tone text on tint', 'red-700', 'red-100', 5.38],
  ['Tone text on tint', 'blue-700', 'blue-100', 5.31],
  ['Tone text on tint', 'text-header', 'canvas', 5.21],
  ['Tone text on tint', 'green-text', 'green-100', 4.5],
  ['Focus ring', 'green-500', 'surface', 3.06],
  ['1.4.11 exception — resting borders', 'ink-100', 'surface', 1.65],
  ['1.4.11 exception — resting borders', 'border-field', 'surface', 1.39],
]

// The dark ratios are quoted against #161C26, which is --surface (the card),
// NOT --canvas (#0F141C, the page behind it). And the redline names literal
// hexes, which do not map to the same token in both themes: light quotes
// --ink-100 and --border-field, dark quotes --ink-200 (#55606F) and --ink-100
// (#384556, the value --border-field and --border-soft also carry).
const DARK_CLAIMS = [
  ['Focus ring', 'green-500', 'surface', 6.23],
  ['1.4.11 exception — resting borders', 'ink-200', 'surface', 2.68],
  ['1.4.11 exception — resting borders', 'ink-100', 'surface', 1.75],
]

const hex = (tokens, name) => {
  const value = tokens.get(name)
  expect(value, `--${name} is not defined`).toMatch(/^#[0-9A-Fa-f]{6}$/)
  return value
}

describe('Appendix C contrast rows — light', () => {
  it.each(LIGHT_CLAIMS)('%s: --%s on --%s is %f:1', (_row, fg, bg, claimed) => {
    expect(contrast(hex(light, fg), hex(light, bg))).toBeCloseTo(claimed, 1)
    // toBeCloseTo(_, 1) is ±0.05; tighten to the artifact's own rounding
    expect(Math.abs(contrast(hex(light, fg), hex(light, bg)) - claimed)).toBeLessThan(ROUNDING)
  })
})

describe('Appendix C contrast rows — dark', () => {
  it.each(DARK_CLAIMS)('%s: --%s on --%s is %f:1', (_row, fg, bg, claimed) => {
    // A dark token may be inherited from light when the theme does not
    // override it, which is exactly how --green-500 reaches this table.
    const fgHex = dark.has(fg) ? hex(dark, fg) : hex(light, fg)
    const bgHex = dark.has(bg) ? hex(dark, bg) : hex(light, bg)
    expect(Math.abs(contrast(fgHex, bgHex) - claimed)).toBeLessThan(ROUNDING)
  })
})

describe('the rules those ratios exist to enforce', () => {
  it('keeps every body text colour above AA on its own surface', () => {
    // Redline "Dark on white · all pass" and "Hints & meta · #667085 inside
    // white cards only". This is the claim the numbers are FOR.
    for (const name of ['ink-900', 'ink-700', 'ink-600', 'ink-500', 'text-meta', 'placeholder']) {
      expect(contrast(hex(light, name), hex(light, 'surface')), `--${name} on white`)
        .toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps text on the canvas above AA, where --text-meta does not reach', () => {
    // Redline "On tinted surfaces · canvas costs ~0.6 — #667085 drops to
    // 4.39:1 and FAILS there; use #5A6577 for text on #EEF1F6". The failure is
    // asserted too: if --text-meta ever passed on canvas this row would be
    // obsolete, and a reader should be told rather than left with a stale rule.
    expect(contrast(hex(light, 'text-meta'), hex(light, 'canvas'))).toBeLessThan(4.5)
    expect(contrast(hex(light, 'text-header'), hex(light, 'canvas'))).toBeGreaterThanOrEqual(4.5)
  })

  it('allows white text on exactly one green', () => {
    // Redline "White on green · only on #177236 (6.01:1) or darker".
    const white = hex(light, 'green-on-fill')
    expect(contrast(white, hex(light, 'green-fill'))).toBeGreaterThanOrEqual(4.5)
    for (const name of ['green-600', 'green-500', 'dot-green']) {
      expect(contrast(white, hex(light, name)), `white on --${name}`).toBeLessThan(4.5)
    }
  })

  it('keeps every tone-on-tint pair above AA with no headroom to spare', () => {
    // Redline "Tone text on tint · passes with zero headroom, so never lighten
    // either side". The upper bound is the point: a pair drifting comfortably
    // clear means one of the two colours moved.
    for (const [fg, bg] of [
      ['amber-text', 'amber-100'],
      ['red-700', 'red-100'],
      ['blue-700', 'blue-100'],
      ['green-text', 'green-100'],
    ]) {
      const ratio = contrast(hex(light, fg), hex(light, bg))
      // 4.49, not 4.5, for one pair only: --green-text on --green-100 measures
      // 4.4961, which the redline quotes as "4.50". It rounds to a pass at two
      // decimals and is 0.004 under the strict threshold — recorded in spec
      // §17.3 rather than silently rounded away here. Every other pair clears
      // 4.5 outright, so this floor cannot hide a real regression in them.
      expect(ratio, `--${fg} on --${bg}`).toBeGreaterThanOrEqual(4.49)
      expect(ratio, `--${fg} on --${bg} drifted`).toBeLessThan(6)
    }
  })

  it('keeps both focus rings above the 3:1 that 1.4.11 requires', () => {
    // Redline "Focus ring · #25A94E on #FFF = 3.06:1 · #2FB25F on #161C26 =
    // 6.23:1 — both meet 1.4.11". The light ring has 0.06 of headroom, which
    // is why it is worth a test rather than a comment.
    expect(contrast(hex(light, 'green-500'), hex(light, 'surface'))).toBeGreaterThanOrEqual(3)
    expect(contrast(hex(dark, 'green-500'), hex(dark, 'surface'))).toBeGreaterThanOrEqual(3)
  })

  it('records that resting borders deliberately do not reach 3:1', () => {
    // Redline "1.4.11 exception · resting control BORDERS do not reach 3:1 in
    // either theme. Known, deliberate: state is carried by the filled/focused
    // state (both >= 3:1) and by an always-visible label."
    //
    // Asserted as a FAILURE on purpose. If someone darkens these borders the
    // exception in the spec becomes wrong, and this is what will say so.
    expect(contrast(hex(light, 'border-field'), hex(light, 'surface'))).toBeLessThan(3)
    expect(contrast(hex(dark, 'border-field'), hex(dark, 'surface'))).toBeLessThan(3)
  })
})
