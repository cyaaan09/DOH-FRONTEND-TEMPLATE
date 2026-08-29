import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DesignSystemPage from '../design-system.vue'
import { SECTIONS } from '@/design-system/demo/chrome/sections'
import { readSpec } from '@/design-system/styles/__tests__/parse-tokens.js'
import { parseAppendixD } from './appendix-d.js'

// Review Finding 2 — Appendix D's content (descriptions, sub-block notes,
// rule-card bodies, and the DemoRules footers themselves) was ~90%
// unasserted: the existing suite protects the page's structure but not its
// text, so an implementer editing a section file could drop a note, a
// footer, or a labelled slot and 236 green tests would not notice. This
// mounts the assembled page once and checks every section's rendered text
// against Appendix D itself (parsed by ./appendix-d.js), so the check stays
// in lockstep with the spec instead of drifting the way the plan's own
// rule-card extraction did.
describe('Appendix D content, section by section', () => {
  const expectations = parseAppendixD(readSpec(), SECTIONS)
  const wrapper = mount(DesignSystemPage)

  it('parsed real content for every section, not a vacuous pass', () => {
    // Guards the guard: if a heading-text drift ever made every chunk parse
    // empty, every assertion below would trivially pass on nothing.
    expect(expectations).toHaveLength(SECTIONS.length)
    expect(expectations.every((s) => typeof s.description === 'string' || s.title === 'Dark mode')).toBe(
      true,
    )
    expect(expectations.some((s) => s.subBlocks.some((b) => b.note))).toBe(true)
    expect(expectations.some((s) => s.rules.length > 0)).toBe(true)
  })

  it.each(expectations)('$title', (expected) => {
    const section = wrapper.get(`[data-section="${expected.id}"]`)
    const text = section.text()

    // `?? ''` / an empty note rather than an `if` guard around expect: Dark
    // mode has no description and three Foundations groups have no note
    // (spec Appendix D.1 — "*(none)*"), and every string "contains" ''; a
    // conditional expect would trip vitest/no-conditional-expect for
    // silently skipping the assertion instead of making it a no-op.
    expect(text, `${expected.title}: description text`).toContain(expected.description ?? '')

    for (const block of expected.subBlocks) {
      expect(text, `${expected.title}: sub-block label "${block.label}"`).toContain(block.label)
      expect(text, `${expected.title}: sub-block note for "${block.label}"`).toContain(block.note)
    }

    for (const rule of expected.rules) {
      expect(text, `${expected.title}: rule-card title "${rule.title}"`).toContain(rule.title)
      expect(text, `${expected.title}: rule-card body for "${rule.title}"`).toContain(rule.body)
    }

    expect(
      section.findAll('[data-rule]'),
      `${expected.title}: rule-card count (expected ${expected.rules.length})`,
    ).toHaveLength(expected.rules.length)
  })
})
