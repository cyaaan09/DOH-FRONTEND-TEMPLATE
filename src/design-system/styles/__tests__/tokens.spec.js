import { describe, expect, it } from 'vitest'
import { parseTokens, readStyle } from './parse-tokens'

const light = parseTokens(readStyle('tokens.css'))
const dark = parseTokens(readStyle('tokens.dark.css'))

describe('design tokens', () => {
  it('defines the light palette on :root', () => {
    expect(readStyle('tokens.css')).toMatch(/^:root\s*\{/m)
    expect(light.size).toBeGreaterThan(80)
  })

  it('scopes the dark palette to [data-theme="dark"]', () => {
    expect(readStyle('tokens.dark.css')).toMatch(/^\[data-theme="dark"\]\s*\{/m)
  })

  it('introduces no token in dark that does not exist in light', () => {
    // --green-on-fill-red and --red-fill-hover are dark-only by design (spec
    // Appendix A.1): light mode's destructive button already has white text
    // and --red-800 for its hover, so there is no light-mode role for these.
    // Named here, not widened generally — a real orphan should still fail.
    const DARK_ONLY_BY_DESIGN = new Set(['green-on-fill-red', 'red-fill-hover'])
    const orphans = [...dark.keys()].filter(
      (name) => !light.has(name) && !DARK_ONLY_BY_DESIGN.has(name),
    )
    expect(orphans).toEqual([])
  })

  it('does not redeclare --font-sans or --font-mono (owned by theme.css)', () => {
    expect(light.has('font-sans')).toBe(false)
    expect(light.has('font-mono')).toBe(false)
  })

  it('keeps geometry theme-invariant', () => {
    const geometry = [...light.keys()].filter((n) =>
      /^(r-|h-|size-|rail-|gap-|pad-|z-|w-|chip-pad$)/.test(n),
    )
    expect(geometry.length).toBeGreaterThan(10)
    const overridden = geometry.filter((n) => dark.has(n))
    expect(overridden).toEqual([])
  })

  it('defines the tokens every component depends on', () => {
    for (const name of [
      'canvas', 'surface', 'surface-sunken', 'ink-900', 'ink-500',
      'green-fill', 'green-on-fill', 'border-card', 'border-field',
      'r-field', 'r-card', 'h-field', 'h-compact', 'h-touch',
      'sh-card', 'ring-focus', 'scrim',
    ]) {
      expect(light.has(name), `light is missing --${name}`).toBe(true)
    }
  })

  it('flips the fill label colour in dark mode', () => {
    expect(light.get('green-on-fill')).toBe('#FFFFFF')
    expect(dark.get('green-on-fill')).toBe('#0B1017')
  })

  it('carries the additions the source document uses but never tokenised', () => {
    // Spec Appendix A.1 — each of these is cited to the redline that needs it.
    for (const name of [
      'notice-border-green', 'notice-border-blue', 'notice-border-amber', 'notice-border-red',
      'toast-border-green', 'toast-border-amber', 'toast-border-blue',
      'toast-bg-amber', 'toast-bg-blue',
      'dot-green', 'border-dashed', 'dropzone-hover', 'surface-disabled',
      'red-800', 'green-link-hover',
      'nav-ink', 'item-mark', 'avatar-bg', 'logo-ink', 'separator', 'row-hover-strong',
      'r-bar',
    ]) {
      expect(light.has(name), `tokens.css is missing --${name}`).toBe(true)
    }
  })

  it('keeps the verbatim block intact above the additions', () => {
    // The additions are appended after a marker comment; everything above it
    // must still match spec Appendix A byte for byte.
    const css = readStyle('tokens.css')
    expect(css).toContain('/* --- additions: colours the source document uses but never tokenised --- */')
    const verbatim = css.split('/* --- additions')[0]
    expect(verbatim).toMatch(/^:root\s*\{/m)
    expect(verbatim).not.toContain('--notice-border-green')
  })

  it('gives the two dark-mode additions their counterparts', () => {
    for (const name of ['green-on-fill-red', 'red-fill-hover']) {
      expect(dark.has(name), `tokens.dark.css is missing --${name}`).toBe(true)
    }
  })
})
