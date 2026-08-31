import { describe, expect, it } from 'vitest'
import { extractCssBlockAfter, parseTokens, readSpec, readStyle } from './parse-tokens'

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
      /^(r-|h-|size-|rail-|gap-|pad-|z-|w-|chip-pad$)/.test(n),
    )
    expect(geometry.length).toBeGreaterThan(10)
    const overridden = geometry.filter((n) => dark.has(n))
    expect(overridden).toEqual([])
  })

  it('defines the tokens every component depends on', () => {
    for (const name of [
      'canvas',
      'surface',
      'surface-sunken',
      'ink-900',
      'ink-500',
      'green-fill',
      'green-on-fill',
      'border-card',
      'border-field',
      'r-field',
      'r-card',
      'h-field',
      'h-compact',
      'h-touch',
      'sh-card',
      'ring-focus',
      'scrim',
    ]) {
      expect(light.has(name), `light is missing --${name}`).toBe(true)
    }
  })

  it('flips the fill label colour in dark mode', () => {
    expect(light.get('green-on-fill')).toBe('#FFFFFF')
    expect(dark.get('green-on-fill')).toBe('#0B1017')
  })

  it('carries the additions the source document uses but never tokenised, at their exact values', () => {
    // Spec Appendix A.1 — values quoted independently here, not read back
    // from tokens.css, so a transcription error (e.g. one wrong hex digit)
    // actually fails this test instead of passing an existence-only check.
    const expected = {
      'notice-border-green': '#A6E7C3',
      'notice-border-blue': '#B2DDFF',
      'notice-border-amber': '#F7D9A0',
      'notice-border-red': '#F9C4BE',
      'toast-border-green': '#CDEAD6',
      'toast-border-amber': '#F2E0BD',
      'toast-border-blue': '#D5E4FA',
      'toast-bg-amber': '#FFFBF2',
      'toast-bg-blue': '#F5F9FF',
      'dot-green': '#17A34A',
      'border-dashed': '#CDD5E2',
      'dropzone-hover': '#F7FCF8',
      'surface-disabled': '#E9EDF3',
      'red-800': '#96190F',
      'green-link-hover': '#166534',
      'nav-ink': '#4B5565',
      'item-mark': '#B3BDCD',
      'avatar-bg': '#DBE4F0',
      'logo-ink': '#D9F2C4',
      separator: '#CBD3E0',
      'row-hover-strong': '#E0E5EE',
      'r-bar': '6px',
    }
    for (const [name, value] of Object.entries(expected)) {
      expect(light.get(name), `--${name}`).toBe(value)
    }
  })

  it('keeps the verbatim block intact above the additions', () => {
    // The additions are appended after a marker comment; everything above it
    // must still match spec Appendix A byte for byte.
    const css = readStyle('tokens.css')
    expect(css).toContain(
      '/* --- additions: colours the source document uses but never tokenised --- */',
    )
    const verbatim = css.split('/* --- additions')[0]
    expect(verbatim).toMatch(/^:root\s*\{/m)
    expect(verbatim).not.toContain('--notice-border-green')
  })
})

describe('spec Appendix A parity', () => {
  // Nothing previously checked that tokens.css actually matches spec Appendix
  // A / A.1 — undetected drift in exactly this layer is why this conformance
  // pass exists. These parse the spec's own code blocks and diff them against
  // the file, both directions, so a missing token, an extra token, or a
  // changed value all fail loudly instead of silently.
  const spec = readSpec()

  // The spec's Appendix A markdown writes --font-sans and --font-mono inside
  // the :root block it quotes from the source document, but tokens.css has
  // never declared them there (see the "does not redeclare --font-sans or
  // --font-mono" test above): theme.css owns them as literals instead,
  // because `--font-sans: var(--font-sans)` would be circular. Documented,
  // pre-existing, intentional — not drift — so it is the one named exception.
  const KNOWN_EXCEPTIONS = new Set(['font-sans', 'font-mono'])

  it('matches spec Appendix A exactly in the verbatim region', () => {
    const specTokens = parseTokens(extractCssBlockAfter(spec, '## Appendix A — `tokens.css`'))
    for (const name of KNOWN_EXCEPTIONS) specTokens.delete(name)
    const verbatim = readStyle('tokens.css').split('/* --- additions')[0]
    const fileTokens = parseTokens(verbatim)
    expect(Object.fromEntries(fileTokens)).toEqual(Object.fromEntries(specTokens))
  })

  it('matches spec Appendix A.1 exactly in the additions region', () => {
    const specTokens = parseTokens(
      extractCssBlockAfter(spec, '### Appendix A.1 — additions beyond the source token block'),
    )
    const additions = readStyle('tokens.css').split('/* --- additions')[1]
    const fileTokens = parseTokens(additions)
    expect(Object.fromEntries(fileTokens)).toEqual(Object.fromEntries(specTokens))
  })

  /**
   * Tokens that legitimately keep their LIGHT value under [data-theme="dark"].
   * Every entry needs a reason, because the default assumption is that a
   * colour token is wrong in the other theme until someone says why it is not.
   * 29 tokens sat unthemed before this guard existed and nothing noticed —
   * an unthemed token is silent: no error, the page just paints a light-mode
   * colour on a dark surface.
   */
  const KEEPS_LIGHT_VALUE = {
    'green-900': 'sidebar logo mark — AppShell is not built, no consumer',
    'green-600': 'legacy value the redline keeps for reference; no consumer',
    'amber-400': 'status DOT fill — a saturated dot reads on both surfaces',
    'red-500': 'status DOT fill — same',
    'dot-green': 'status DOT fill — same; the redline gives no dark value',
    'toast-bg-amber': 'no consumer — Toast dresses with a tone border on --surface',
    'toast-bg-blue': 'no consumer — same',
    'green-link-hover': 'no consumer',
    'nav-ink': 'app shell — AppShell/AppSidebar/AppHeader are not built',
    'item-mark': 'app shell — same',
    'avatar-bg': 'app shell — same',
    'logo-ink': 'app shell — same',
    separator: 'app shell — same',
    'row-hover-strong': 'app shell — same',
  }

  const GEOMETRY = /^(r-|h-|size-|rail-|pad-|gap-|t-|z-|w-|chip-pad|font-)/

  it('overrides every colour token in dark, or says why not', () => {
    const unthemed = [...light.keys()].filter(
      (name) => !GEOMETRY.test(name) && !dark.has(name) && !(name in KEEPS_LIGHT_VALUE),
    )
    expect(
      unthemed,
      `these paint a light colour on a dark surface: ${unthemed.join(', ')}`,
    ).toEqual([])
  })

  it('keeps the dark allowlist honest', () => {
    // An entry that no longer applies — because the token was themed, or
    // removed — is a lie the next reader would trust. Both directions.
    const stale = Object.keys(KEEPS_LIGHT_VALUE).filter(
      (name) => !light.has(name) || dark.has(name),
    )
    expect(stale, `allowlisted but no longer unthemed: ${stale.join(', ')}`).toEqual([])
    for (const reason of Object.values(KEEPS_LIGHT_VALUE)) {
      expect(reason.length).toBeGreaterThan(10)
    }
  })
})
