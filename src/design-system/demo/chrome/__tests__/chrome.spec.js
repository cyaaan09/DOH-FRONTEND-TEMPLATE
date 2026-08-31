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

  it('pads the header at spec §17.1: 20px top, 24px sides, 4px bottom', () => {
    // Redlined header pad "20px 24px 4px" (px-card-x=24, pt-5=20, pb-1=4).
    // Unasserted before this: a later edit could silently shift pt-5 to
    // pt-8, for example, and every existing test here would still pass.
    const header = mount(DemoCard, { props: { title: 'Chips' } }).get('div')
    expect(header.classes()).toContain('px-card-x')
    expect(header.classes()).toContain('pt-5')
    expect(header.classes()).toContain('pb-1')
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

  it('pads at spec §17.1 by default, and takes per-section overrides', () => {
    // Appendix D.1 — the horizontal 24px stays on the --pad-card-x token;
    // track minimum, gap and vertical padding vary by section and arrive as
    // custom properties, so there is exactly one declaration per property.
    const base = mount(DemoBlocks, { slots: { default: '<span />' } })
    expect(base.classes()).toContain('px-card-x')
    const style = base.attributes('style')
    expect(style).toContain('--db-pt: 18px')
    expect(style).toContain('--db-pb: 6px')
    expect(style).toContain('--db-min: 268px')
    expect(style).toContain('--db-gap: 24px')

    const over = mount(DemoBlocks, {
      props: { min: '280px', gap: '20px 24px', pb: '24px', alignStart: true },
      slots: { default: '<span />' },
    })
    expect(over.attributes('style')).toContain('--db-min: 280px')
    expect(over.attributes('style')).toContain('--db-gap: 20px 24px')
    expect(over.attributes('style')).toContain('--db-pb: 24px')
    expect(over.classes()).toContain('items-start')
  })
})

describe('DemoBlock', () => {
  it('renders its label at column-header scale', () => {
    const label = mount(DemoBlock, { props: { label: 'STATUS' } }).get('[data-label]')
    expect(label.text()).toBe('STATUS')
    expect(label.classes()).toContain('text-column-header')
    expect(label.classes()).toContain('text-text-header')
  })

  it('spaces its label and note at spec §17.1: 4px and 10px margin-bottom', () => {
    // Redlined "margin-bottom 4px" on the label, "margin-bottom 10px" on the
    // note (mb-1=4, mb-2.5=10) — the DemoBlock analogue of DemoCard/
    // DemoBlocks/DemoStrip's padding, since DemoBlock spaces its children
    // with margin instead.
    const wrapper = mount(DemoBlock, { props: { label: 'STATUS', note: 'A dot plus a word.' } })
    expect(wrapper.get('[data-label]').classes()).toContain('mb-1')
    expect(wrapper.get('[data-note]').classes()).toContain('mb-2.5')
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

  it('pads at spec §17.1 by default, and takes the plain Tabs variant', () => {
    // Redlined pad "18px 24px 22px" on --surface-sunken. Appendix D.1 — Tabs
    // runs the same block untinted, undivided and with its own padding, so
    // those are props; the tinted default stays what Chips and Toasts use.
    const base = mount(DemoStrip, { props: { label: 'INTERACTIVE — FILTER CHIPS' } })
    expect(base.classes()).toContain('px-card-x')
    expect(base.classes()).toContain('bg-surface-sunken')
    expect(base.classes()).toContain('border-t')
    expect(base.attributes('style')).toContain('--ds-pt: 18px')
    expect(base.attributes('style')).toContain('--ds-pb: 22px')

    const plain = mount(DemoStrip, {
      props: { label: 'UNDERLINE', tinted: false, divided: false, pt: '20px', pb: '4px' },
    })
    expect(plain.classes()).not.toContain('bg-surface-sunken')
    expect(plain.classes()).not.toContain('border-t')
    expect(plain.attributes('style')).toContain('--ds-pt: 20px')
  })

  it('tightens the label gap when a leading note is present', () => {
    // Appendix D.1's Tabs blocks — label mb 2px, note 12.5px mb 8px. Without
    // a note the label keeps §17.1's 10px.
    const bare = mount(DemoStrip, { props: { label: 'X' } })
    expect(bare.get('[data-label]').classes()).toContain('mb-2.5')
    expect(bare.find('[data-note]').exists()).toBe(false)

    const noted = mount(DemoStrip, { props: { label: 'X', note: 'Use at the top of a table card.' } })
    expect(noted.get('[data-label]').classes()).toContain('mb-0.5')
    expect(noted.get('[data-note]').classes()).toContain('text-caption')
    expect(noted.get('[data-note]').classes()).toContain('mb-2')
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
