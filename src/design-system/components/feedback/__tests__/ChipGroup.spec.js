import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChipGroup from '../ChipGroup.vue'

// Deliberately not `new URL('../ChipGroup.vue', import.meta.url)`: Vite
// statically intercepts that exact call pattern as an asset reference and
// rewrites it to a dev-server URL, which then fails to resolve as a
// filesystem path under the jsdom test environment (see parse-tokens.js).
const testsDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(testsDir, '..', 'ChipGroup.vue'), 'utf8')

describe('ChipGroup', () => {
  it('renders its slot content', () => {
    const wrapper = mount(ChipGroup, { slots: { default: '<span class="c">chip</span>' } })
    expect(wrapper.find('.c').exists()).toBe(true)
  })

  it('does not use the gap-chip-row utility, whose token is 8px not the redlined 7px', () => {
    // Redline "Gap in row · 7px" contradicts the source's own verbatim
    // token block (--gap-chip-row: 8px, reproduced byte-for-byte in
    // tokens.css under a parity test). Spec §2 rules Appendix C wins where
    // the two disagree, so the row gap is set directly rather than through
    // the token.
    expect(mount(ChipGroup).classes()).not.toContain('gap-chip-row')
  })

  it('defaults the row gap to the redlined 7px, in CSS rather than a utility', () => {
    // No Tailwind spacing step lands on 7px (gap-2 is 8px, the next step
    // down is 6px), so this is a scoped CSS rule rather than a utility —
    // asserted against the source text since jsdom does not apply the
    // component's <style scoped> block in this test environment. The value
    // now arrives as a custom property so a caller can pass the artifact's
    // 8px filter row, but 7px remains BOTH the prop default and the CSS
    // fallback, so an unset property still lands on the redline.
    expect(source).toMatch(/gap:\s*var\(--chip-group-gap,\s*7px\)/)
    expect(source).toMatch(/default:\s*'7px'/)
    expect(mount(ChipGroup).attributes('style')).toContain('--chip-group-gap: 7px')
  })

  it('takes the 8px gap the artifact uses for the filter row', () => {
    expect(mount(ChipGroup, { props: { gap: '8px' } }).attributes('style')).toContain(
      '--chip-group-gap: 8px',
    )
  })
})
