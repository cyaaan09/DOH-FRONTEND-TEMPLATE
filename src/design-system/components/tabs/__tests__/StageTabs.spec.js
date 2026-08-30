import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StageTabs from '../StageTabs.vue'

const STAGES = [
  { key: 'review', step: '1', label: 'Review', count: 2, hint: '2 returned' },
  { key: 'payment', step: '2', label: 'Payment', count: 2, hint: '1 awaiting OP' },
  {
    key: 'inspection',
    step: '3',
    label: 'Inspection',
    count: 8,
    hint: '2 due within 7 days',
    urgent: true,
  },
  { key: 'issuance', step: '4', label: 'Issuance', count: 1, hint: 'ready to sign' },
  {
    key: 'closed',
    step: '·',
    label: 'Closed',
    count: 41,
    hint: 'rejected · forfeited',
    muted: true,
  },
]

const mountStages = (props = {}) =>
  mount(StageTabs, { props: { stages: STAGES, modelValue: 'review', ...props } })

describe('StageTabs', () => {
  it('renders one card per stage, with step, label, count and hint', () => {
    const wrapper = mountStages()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(5)
    const text = wrapper.text()
    expect(text).toContain('Inspection')
    expect(text).toContain('8')
    expect(text).toContain('2 due within 7 days')
  })

  it('renders the Closed stage with its middot marker, not a number', () => {
    // The artifact gives Closed a "·" because it is not a step in the flow.
    expect(mountStages().findAll('[data-step]')[4].text()).toBe('·')
  })

  it('emits update:modelValue when a stage is chosen', async () => {
    const wrapper = mountStages()
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['inspection'])
  })

  it('rings only the active stage card', () => {
    // Redline "Stage active" — green border plus the select ring. Idle cards
    // keep the hairline border, so exactly one border colour applies to each.
    const cards = mountStages().findAll('[role="tab"]')
    expect(cards[0].classes()).toContain('stage-tabs__card--active')
    expect(cards[0].classes()).toContain('border-green-500')
    expect(cards[0].classes()).not.toContain('border-hairline')
    expect(cards[1].classes()).toContain('border-hairline')
    expect(cards[1].classes()).not.toContain('border-green-500')
    expect(cards[1].classes()).not.toContain('stage-tabs__card--active')
  })

  it('renders the count at the stage-figure step', () => {
    // Redline "Stage figure"
    expect(mountStages().get('[data-figure]').classes()).toContain('text-stage-figure')
  })

  it('colours an urgent hint red and bold, leaving the others meta grey', () => {
    // Redline "Stage urgent" — 11.5/700. Every hint sets colour and weight, so
    // neither is left to emit order.
    const hints = mountStages().findAll('[data-hint]')
    expect(hints[2].classes()).toContain('text-red-700')
    expect(hints[2].classes()).toContain('font-bold')
    expect(hints[0].classes()).toContain('text-text-meta')
    expect(hints[0].classes()).toContain('font-normal')
    expect(hints[0].classes()).not.toContain('text-red-700')
  })

  it('mutes the Closed stage', () => {
    // Background has exactly one source: both branches of the same binding.
    const cards = mountStages().findAll('[role="tab"]')
    expect(cards[4].classes()).toContain('bg-surface-sunken')
    expect(cards[0].classes()).toContain('bg-surface')
    expect(cards[0].classes()).not.toContain('bg-surface-sunken')
  })

  it('renders the active stage panel through the default slot', () => {
    const wrapper = mount(StageTabs, {
      props: { stages: STAGES, modelValue: 'review' },
      slots: { default: '<span class="stage-panel-probe" />' },
    })
    expect(wrapper.find('.stage-panel-probe').exists()).toBe(true)
  })
})
