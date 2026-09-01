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
      'color-canvas',
      'color-surface',
      'color-ink-900',
      'color-green-fill',
      'color-hairline',
      'color-field',
      'radius-field',
      'radius-card',
      'spacing-field',
      'shadow-card',
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
    'z-header',
    'z-popover',
    'z-dialog',
    't-fast',
    't-control',
    't-rail',
    't-spin',
    'grad-primary',
    'grad-meter',
    'ring-focus',
    'ring-select',
    'scrim',
    'chip-pad',
    // Tailwind's built-in font-normal / font-medium / font-bold cover these.
    'w-regular',
    'w-medium',
    'w-bold',
    // Chart tokens are read as custom properties inside SVG, where utilities
    // cannot reach: stroke, fill and gradient stops are attributes, not
    // classes. Bridging them would generate ~48 utilities no template can use.
    'chart-grid',
    'chart-axis',
    'chart-track',
    'series-1',
    'series-2',
    'series-3',
    'series-4',
    'series-5',
    'chart-ok',
    'chart-ok-strong',
    'chart-warn',
    'chart-bad',
    'chart-idle',
    'chart-area',
    'readout-bg',
    'readout-rule',
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

  it('defines the nine text styles from spec §6', () => {
    const expected = {
      'text-page-title': '26px',
      'text-card-figure': '23px',
      'text-section-title': '17px',
      'text-row-title': '14px',
      'text-body': '13.5px',
      'text-field-label': '12.5px',
      'text-hint': '12px',
      'text-column-header': '10.5px',
      'text-mono': '12.5px',
    }
    for (const [name, size] of Object.entries(expected)) {
      expect(bridge.get(name), `missing --${name}`).toBe(size)
    }
  })

  it('carries leading, tracking and weight on the scale names', () => {
    expect(bridge.get('text-body--line-height')).toBe('1.55')
    expect(bridge.get('text-page-title--letter-spacing')).toBe('-0.015em')
    expect(bridge.get('text-card-figure--letter-spacing')).toBe('-0.01em')
    expect(bridge.get('text-column-header--letter-spacing')).toBe('0.08em')
    expect(bridge.get('text-page-title--font-weight')).toBe('700')
    expect(bridge.get('text-field-label--font-weight')).toBe('500')
  })

  it('declares the scale as literals, never as var() references', () => {
    // The scale lives in theme.css because tokens.css has no size tokens and
    // is frozen verbatim. A var() here would dangle.
    const scaleRefs = [...bridge.entries()].filter(
      ([name, value]) => name.startsWith('text-') && value.startsWith('var('),
    )
    expect(scaleRefs).toEqual([])
  })

  it('adds the two type sizes this pass needs', () => {
    expect(bridge.get('text-notice')).toBe('13px')
    expect(bridge.get('text-notice--line-height')).toBe('1.35')
    expect(bridge.get('text-stat-hint')).toBe('11.5px')
  })

  it('defines the note style the demo chrome needs', () => {
    // Spec §17.1 — sub-block notes and rule-card bodies are 12.5px / 1.5.
    // The scale's text-field-label is also 12.5px but carries weight 500 and
    // no line-height, so it is the wrong style for running prose.
    expect(bridge.get('text-caption')).toBe('12.5px')
    expect(bridge.get('text-caption--line-height')).toBe('1.5')
    expect(bridge.get('text-caption--font-weight')).toBe('400')
  })

  it('bridges the new colour additions', () => {
    for (const name of [
      'color-notice-border-green',
      'color-notice-border-blue',
      'color-notice-border-amber',
      'color-notice-border-red',
      'color-border-dashed',
      'color-surface-disabled',
      'color-dot-green',
      'radius-bar',
    ]) {
      expect(bridge.has(name), `theme.css is missing --${name}`).toBe(true)
    }
  })
})
