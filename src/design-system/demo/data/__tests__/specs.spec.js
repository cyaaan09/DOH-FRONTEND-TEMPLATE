import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { SPEC_GROUPS } from '../specs.js'
import { buildSpecGroups, render } from '../../../../../scripts/build-spec-data.mjs'

const SPEC_PATH = 'docs/superpowers/specs/2026-08-29-design-system-design.md'

describe('generated spec data', () => {
  it('is in sync with spec Appendix C', () => {
    // The Component specs section IS Appendix C. Generated rather than
    // hand-copied so ~310 redline rows cannot drift from the spec; this
    // asserts the committed file matches what the generator produces now,
    // so an Appendix C edit fails here instead of shipping a stale table.
    expect(readFileSync('src/design-system/demo/data/specs.js', 'utf8')).toBe(
      render(buildSpecGroups(readFileSync(SPEC_PATH, 'utf8'))),
    )
  })

  it('carries every Appendix C group the artifact shows', () => {
    expect(SPEC_GROUPS).toHaveLength(19)
    expect(SPEC_GROUPS[0].name).toBe('Containers & surfaces')
    expect(SPEC_GROUPS[0].summary).toBe('canvas #EEF1F6 · card #FFF radius 14 · sunken #FAFBFD')
    expect(SPEC_GROUPS.at(-1).name).toBe('Type & layout')
  })

  it('marks a swatch only where the value IS a colour', () => {
    // A value that merely mentions a hex among other CSS is not a colour
    // row — "1px solid #D5DBE6" gets no tile, "#EEF1F6" does.
    const rows = SPEC_GROUPS.flatMap((g) => g.rows)
    expect(rows.filter((r) => r.c).length).toBeGreaterThan(0)
    for (const row of rows.filter((r) => r.c)) {
      expect(row.v.trim()).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})
