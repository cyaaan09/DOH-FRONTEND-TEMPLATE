import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SECTIONS } from '@/design-system/demo/chrome/sections'
import DesignSystemPage from '../design-system.vue'

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

  it('shows gaps only in the sections still to be built', () => {
    // The page is a live checklist. It briefly held zero gaps — all 15
    // sections were complete — and the 2026-08-31 artifact update added five
    // more, so the assertion is the durable one again: a gap may exist ONLY
    // inside a section the manifest marks incomplete.
    const wrapper = mount(DesignSystemPage)
    const incomplete = SECTIONS.filter((s) => !s.complete).map((s) => s.id)
    for (const gap of wrapper.findAll('[data-gap]')) {
      const section = gap.element.closest('[data-section]')
      expect(section, 'a gap outside any section').not.toBeNull()
      expect(
        incomplete,
        `gap inside "${section.getAttribute('data-section')}", which is marked complete`,
      ).toContain(section.getAttribute('data-section'))
    }
    // and every incomplete section actually shows its gaps
    for (const id of incomplete) {
      const section = wrapper.get(`[data-section="${id}"]`)
      expect(section.findAll('[data-gap]').length, `${id}: no gap marker`).toBeGreaterThan(0)
    }
  })
})
