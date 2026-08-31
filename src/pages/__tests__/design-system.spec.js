import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DesignSystemPage from '../design-system.vue'
import { SECTIONS } from '@/design-system/demo/chrome/sections'

describe('design system page', () => {
  it('renders every section the artifact has, in its order', () => {
    const text = mount(DesignSystemPage).text()
    for (const section of SECTIONS) {
      expect(text, `missing section: ${section.title}`).toContain(section.title)
    }
  })

  it('renders the sections in the artifact order, not alphabetically', () => {
    // Uses text(), not html(): html() serialises literal "&" as "&amp;" (three
    // titles contain "&") and also serialises DemoGap's internal HTML
    // comments, one of which happens to contain the words "Tokens for
    // handoff" — both would falsely fail this check against a correctly
    // ordered page. Search advances a cursor past each match instead of
    // starting from 0 each time, since the page's own intro paragraph
    // mentions "Chips" ahead of the real Chips section.
    const text = mount(DesignSystemPage).text()
    let cursor = 0
    const positions = SECTIONS.map((s) => {
      const pos = text.indexOf(s.title, cursor)
      cursor = pos >= 0 ? pos + s.title.length : cursor
      return pos
    })
    expect(positions.every((p) => p >= 0)).toBe(true)
    const sorted = [...positions].sort((a, b) => a - b)
    expect(positions).toEqual(sorted)
  })

  it('a section marked complete contains no gap markers', () => {
    // Spec §17.2 — a section cannot be declared done while a slot is empty.
    const wrapper = mount(DesignSystemPage)
    for (const section of SECTIONS.filter((s) => s.complete)) {
      const el = wrapper.find(`[data-section="${section.id}"]`)
      expect(el.exists(), `no element for section: ${section.id}`).toBe(true)
      expect(el.findAll('[data-gap]'), `${section.id} is marked complete but has gaps`).toHaveLength(
        0,
      )
    }
  })

  it('shows no gaps at all — every section is built', () => {
    // The page was a checklist: each unbuilt slot rendered a visible gap
    // marker, and this asserted at least one remained. All 15 sections are
    // now complete, so the assertion inverts — a gap reappearing means a
    // section regressed, or a new slot was added without filling it.
    expect(mount(DesignSystemPage).findAll('[data-gap]')).toHaveLength(0)
  })
})
