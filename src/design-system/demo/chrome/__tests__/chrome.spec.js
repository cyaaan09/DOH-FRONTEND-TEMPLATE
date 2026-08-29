import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DemoCard from '../DemoCard.vue'
import DemoBlocks from '../DemoBlocks.vue'
import DemoBlock from '../DemoBlock.vue'
import DemoStrip from '../DemoStrip.vue'

describe('DemoCard', () => {
  it('renders a hairline card at card radius', () => {
    // Spec §17.1 — radius 14, 1px hairline, --sh-card
    const classes = mount(DemoCard, { props: { title: 'Chips' } }).classes()
    expect(classes).toContain('rounded-card')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('shadow-card')
  })

  it('renders the title at section-title scale', () => {
    const heading = mount(DemoCard, { props: { title: 'Chips' } }).get('h2')
    expect(heading.text()).toBe('Chips')
    expect(heading.classes()).toContain('text-section-title')
  })

  it('renders a description only when given one', () => {
    const withDesc = mount(DemoCard, {
      props: { title: 'Chips', description: 'Tone comes from the meaning.' },
    })
    expect(withDesc.text()).toContain('Tone comes from the meaning.')
    expect(mount(DemoCard, { props: { title: 'Chips' } }).findAll('p')).toHaveLength(0)
  })

  it('renders its default slot', () => {
    const wrapper = mount(DemoCard, {
      props: { title: 'Chips' },
      slots: { default: '<span class="body-probe" />' },
    })
    expect(wrapper.find('.body-probe').exists()).toBe(true)
  })
})

describe('DemoBlocks', () => {
  it('renders an auto-fit grid, not a fixed column count', () => {
    // Spec §17.1 — repeat(auto-fit, minmax(268px, 1fr)), gap 24
    const wrapper = mount(DemoBlocks, { slots: { default: '<span class="block-probe" />' } })
    expect(wrapper.classes()).toContain('demo-blocks')
    expect(wrapper.find('.block-probe').exists()).toBe(true)
  })
})

describe('DemoBlock', () => {
  it('renders its label at column-header scale', () => {
    const label = mount(DemoBlock, { props: { label: 'STATUS' } }).get('[data-label]')
    expect(label.text()).toBe('STATUS')
    expect(label.classes()).toContain('text-column-header')
    expect(label.classes()).toContain('text-text-header')
  })

  it('renders a note only when given one', () => {
    const withNote = mount(DemoBlock, { props: { label: 'STATUS', note: 'A dot plus a word.' } })
    expect(withNote.get('[data-note]').classes()).toContain('text-caption')
    expect(mount(DemoBlock, { props: { label: 'STATUS' } }).find('[data-note]').exists()).toBe(false)
  })

  it('renders its default slot', () => {
    const wrapper = mount(DemoBlock, {
      props: { label: 'STATUS' },
      slots: { default: '<span class="chip-probe" />' },
    })
    expect(wrapper.find('.chip-probe').exists()).toBe(true)
  })
})

describe('DemoStrip', () => {
  it('sits on the sunken surface below a divider', () => {
    // Spec §17.1 — border-top 1px --divider, background --surface-sunken
    const classes = mount(DemoStrip, { props: { label: 'INTERACTIVE — FILTER CHIPS' } }).classes()
    expect(classes).toContain('bg-surface-sunken')
    expect(classes).toContain('border-divider')
  })

  it('renders its label and slot', () => {
    const wrapper = mount(DemoStrip, {
      props: { label: 'INTERACTIVE — FILTER CHIPS' },
      slots: { default: '<span class="strip-probe" />' },
    })
    expect(wrapper.text()).toContain('INTERACTIVE — FILTER CHIPS')
    expect(wrapper.find('.strip-probe').exists()).toBe(true)
  })
})
