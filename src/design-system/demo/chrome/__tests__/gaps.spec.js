import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DemoRules from '../DemoRules.vue'
import DemoGap from '../DemoGap.vue'
import { SECTIONS } from '../sections'

describe('DemoRules', () => {
  it('renders one card per rule', () => {
    const wrapper = mount(DemoRules, {
      props: {
        rules: [
          { title: 'One tone per meaning', body: 'Green = good or issued.' },
          { title: 'Never two chips of the same tone', body: 'Move it into the label line.' },
        ],
      },
    })
    expect(wrapper.findAll('[data-rule]')).toHaveLength(2)
    expect(wrapper.text()).toContain('One tone per meaning')
    expect(wrapper.text()).toContain('Move it into the label line.')
  })

  it('renders the title at rule scale and the body at note scale', () => {
    const wrapper = mount(DemoRules, {
      props: { rules: [{ title: 'A', body: 'B' }] },
    })
    expect(wrapper.get('[data-rule-title]').classes()).toContain('text-notice')
    expect(wrapper.get('[data-rule-title]').classes()).toContain('font-bold')
    expect(wrapper.get('[data-rule-body]').classes()).toContain('text-caption')
  })

  it('renders nothing when given no rules', () => {
    expect(mount(DemoRules, { props: { rules: [] } }).findAll('[data-rule]')).toHaveLength(0)
  })
})

describe('DemoGap', () => {
  it('names the missing component and the redline group that governs it', () => {
    const wrapper = mount(DemoGap, {
      props: { component: 'SegmentedTabs', group: 'Tabs' },
    })
    expect(wrapper.text()).toContain('SegmentedTabs')
    expect(wrapper.text()).toContain('Tabs')
  })

  it('marks itself so a test can count gaps', () => {
    expect(mount(DemoGap, { props: { component: 'X', group: 'Y' } }).attributes('data-gap')).toBe(
      '',
    )
  })

  it('uses the dashed panel treatment', () => {
    // Spec §17.1 — dashed --border-dashed at 1.6px
    expect(mount(DemoGap, { props: { component: 'X', group: 'Y' } }).classes()).toContain(
      'demo-gap',
    )
  })

  it('cites Appendix C by default and a given source otherwise', () => {
    // Spec Appendix D.1, "Gap citations where Appendix C has no group" —
    // Foundations and Tokens for handoff describe token scales, not
    // components, so their gaps must cite Appendix A instead.
    const withoutSource = mount(DemoGap, { props: { component: 'X', group: 'Y' } })
    expect(withoutSource.text()).toContain('Appendix C')

    const withSource = mount(DemoGap, {
      props: { component: 'X', group: 'tokens.css', source: 'Appendix A' },
    })
    expect(withSource.text()).toContain('Appendix A')
    expect(withSource.text()).not.toContain('Appendix C')
  })

  it('renders the source alone when group is omitted, with no dangling quotes', () => {
    // Spec Appendix D.1 — a gap that would cover an entire appendix (e.g.
    // Component specs, which renders all 19 Appendix C groups) names no
    // single group. There must be no empty "" left behind either.
    const wrapper = mount(DemoGap, { props: { component: 'SpecTables' } })
    const text = wrapper.text()
    expect(text).toContain('Appendix C')
    expect(text).not.toContain('“')
    expect(text).not.toContain('”')
  })

  it('renders both the source and the group when a group is given', () => {
    const wrapper = mount(DemoGap, { props: { component: 'X', group: 'Chips' } })
    const text = wrapper.text()
    expect(text).toContain('Appendix C')
    expect(text).toContain('“Chips”')
  })
})

describe('the section manifest', () => {
  it('lists the artifact sections in order', () => {
    // Spec Appendix D. The order is the artifact's own and must not drift.
    expect(SECTIONS.map((s) => s.id)).toEqual([
      'foundations',
      'containers',
      'chips',
      'tabs',
      'fields',
      'dropdowns',
      'buttons',
      'files',
      'notices',
      'selection',
      'dialog',
      'layout',
      'stepper',
      'form-layout',
      'app-shell',
      'data-table',
      'type-scale',
      'specs',
      'dark-mode',
      'tokens',
    ])
  })

  it('gives every section a title and a completeness flag', () => {
    for (const section of SECTIONS) {
      expect(typeof section.title, `${section.id}: title`).toBe('string')
      expect(section.title.length, `${section.id}: title is empty`).toBeGreaterThan(0)
      expect(typeof section.complete, `${section.id}: complete flag`).toBe('boolean')
    }
  })
})
