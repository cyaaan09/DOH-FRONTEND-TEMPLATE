import { describe, expect, it } from 'vitest'
import { parseTokens, readStyle } from './parse-tokens'

const light = parseTokens(readStyle('tokens.css'))
const bridge = parseTokens(readStyle('theme.css'))

/** Bridged entries whose value is a single var() reference. */
const references = [...bridge.entries()]
  .map(([name, value]) => [name, /^var\(\s*--([\w-]+)\s*\)$/.exec(value)?.[1]])
  .filter(([, target]) => target !== undefined)

describe('tailwind theme bridge', () => {
  it('uses @theme inline so utilities resolve through the variables', () => {
    expect(readStyle('theme.css')).toMatch(/@theme\s+inline\s*\{/)
  })

  it('never references a token that does not exist', () => {
    const dangling = references.filter(([, target]) => !light.has(target))
    expect(dangling.map(([name, target]) => `--${name} → --${target}`)).toEqual([])
  })

  it('never declares a self-reference', () => {
    // `--font-sans: var(--font-sans)` is circular. It does not error —
    // the utility silently resolves to nothing. This is the guard.
    const circular = references.filter(([name, target]) => name === target)
    expect(circular.map(([name]) => `--${name}`)).toEqual([])
  })

  it('owns the two colliding font names with literal values', () => {
    expect(bridge.get('font-sans')).toBe("'DM Sans', system-ui, sans-serif")
    expect(bridge.get('font-mono')).toBe("'JetBrains Mono', monospace")
  })

  it('bridges the namespaces components are written against', () => {
    for (const name of [
      'color-canvas', 'color-surface', 'color-ink-900', 'color-green-fill',
      'color-hairline', 'color-field',
      'radius-field', 'radius-card', 'spacing-field', 'shadow-card',
    ]) {
      expect(bridge.has(name), `bridge is missing --${name}`).toBe(true)
    }
  })

  /**
   * Tokens that are deliberately not bridged into a Tailwind utility
   * namespace (--spacing-, --color-, and so on), per the comment at the
   * bottom of theme.css. Kept in
   * sync with that comment by hand — a token belongs here only if it is
   * listed there too.
   */
  const DELIBERATELY_UNBRIDGED = new Set([
    'z-header', 'z-popover', 'z-dialog',
    't-fast', 't-control', 't-rail',
    'grad-primary', 'grad-meter',
    'ring-focus', 'ring-select', 'scrim', 'chip-pad',
    // Tailwind's built-in font-normal / font-medium / font-bold cover these.
    'w-regular', 'w-medium', 'w-bold',
  ])

  /** The set of token names theme.css bridges (the target side of every var() reference). */
  const bridgedTokens = new Set(references.map(([, target]) => target))

  it('bridges every token, or names it as deliberately unbridged', () => {
    // The inverse of "never references a token that does not exist" above:
    // this catches a token that exists in tokens.css but was never wired
    // into theme.css at all — which fails silently (the utility it should
    // have fed just never generates, no build error, no test failure)
    // unless something checks token -> bridge coverage explicitly.
    const gaps = [...light.keys()].filter(
      (name) => !bridgedTokens.has(name) && !DELIBERATELY_UNBRIDGED.has(name),
    )
    expect(gaps.map((name) => `--${name}`)).toEqual([])
  })
})
