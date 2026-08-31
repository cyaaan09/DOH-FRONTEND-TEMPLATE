import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import Accordion from '../Accordion.vue'

const ITEMS = [
  { value: 'profile', title: 'Facility profile', summary: 'Type, address, contact' },
  { value: 'services', title: 'Services offered', summary: 'Pharmacy', badge: { label: '2', tone: 'neutral' } },
  { value: 'documents', title: 'Documents', summary: '2 rejected', badge: { label: '2', tone: 'action' } },
]

const mountAcc = (props = {}) =>
  mount(Accordion, { props: { items: ITEMS, modelValue: ['profile'], ...props } })

describe('Accordion', () => {
  it('makes the whole header the button, not the chevron', () => {
    // Redline "Header · the whole row is the button (aria-expanded)". A 22px
    // chevron hit area tests fine with a mouse and fails every other way in.
    const headers = mountAcc().findAll('[data-accordion-header]')
    expect(headers).toHaveLength(3)
    for (const h of headers) {
      expect(h.element.tagName).toBe('BUTTON')
      expect(h.attributes('aria-expanded')).toBeDefined()
    }
  })

  it('hides the chevron from assistive tech', () => {
    // Redline "Chevron tile · decorative" — the header already announces its
    // state, so a second announcement is noise.
    for (const c of mountAcc().findAll('[data-chevron]')) {
      expect(c.attributes('aria-hidden')).toBe('true')
    }
  })

  it('opens the first section and leaves the rest collapsed', () => {
    // Redline "Default state · first section open, rest collapsed".
    const states = mountAcc().findAll('[data-accordion-header]').map((h) => h.attributes('aria-expanded'))
    expect(states).toEqual(['true', 'false', 'false'])
  })

  it('carries a summary that answers without opening', () => {
    // Redline "Header text · summary that answers without opening", and the
    // rule card: "If a header needs opening to know whether it matters,
    // rewrite the sub-line."
    const summaries = mountAcc().findAll('[data-accordion-summary]').map((s) => s.text())
    expect(summaries).toEqual(['Type, address, contact', 'Pharmacy', '2 rejected'])
  })

  it('dresses the count badge by what it means, not by its number', () => {
    // Redline "Header badge · --divider neutral, --green-100 done,
    // --red-100 needs action".
    const badges = mountAcc().findAll('[data-accordion-badge]')
    expect(badges).toHaveLength(2)
    expect(badges[0].classes()).toContain('bg-neutral-100')
    expect(badges[1].classes()).toContain('bg-red-100')
  })

  it('toggles every section from the toolbar', async () => {
    const wrapper = mountAcc({ title: 'Carmen RHU' })
    await wrapper.get('[data-expand-all]').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(['profile', 'services', 'documents'])

    const allOpen = mountAcc({ title: 'Carmen RHU', modelValue: ['profile', 'services', 'documents'] })
    await allOpen.get('[data-expand-all]').trigger('click')
    expect(allOpen.emitted('update:modelValue')[0][0]).toEqual([])
  })

  it('indents the body to line up under the title', () => {
    // Redline "body pad 0 18px 18px 52px" — 18 gutter + 22 tile + 12 gap, so
    // the body starts where the title does and needs no second border.
    expect(readFileSync('src/design-system/components/disclosure/Accordion.vue', 'utf8')).toMatch(
      /padding:\s*0 18px 18px 52px/,
    )
  })

  it('never animates the text itself', () => {
    // Redline "Transition · 160ms ease on height and background · never
    // animate the text itself".
    const source = readFileSync('src/design-system/components/disclosure/Accordion.vue', 'utf8')
    const headerRule = source.match(/\.accordion__header\s*\{[^}]*\}/)[0]
    expect(headerRule).toMatch(/transition:\s*background-color/)
    expect(headerRule).not.toMatch(/transition:[^;]*\ball\b/)
  })
})
