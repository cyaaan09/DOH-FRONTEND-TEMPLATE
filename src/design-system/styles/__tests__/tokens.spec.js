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
    const orphans = [...dark.keys()].filter((name) => !light.has(name))
    expect(orphans).toEqual([])
  })

  it('does not redeclare --font-sans or --font-mono (owned by theme.css)', () => {
    expect(light.has('font-sans')).toBe(false)
    expect(light.has('font-mono')).toBe(false)
  })

  it('keeps geometry theme-invariant', () => {
    const geometry = [...light.keys()].filter((n) =>
      /^(r-|h-|size-|rail-|gap-|pad-|z-|w-)/.test(n),
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
})
