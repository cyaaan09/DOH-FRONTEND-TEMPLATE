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

  it('marks the model value selected and the others not', () => {
    // Selection semantics guard (review Finding 7) — Ark exposes this through
    // aria-selected the same way it does for the underline Tabs variant; a
    // future swap of the underlying primitive could silently drop it.
    const cards = mountStages().findAll('[role="tab"]')
    expect(cards[0].attributes('aria-selected')).toBe('true')
    expect(cards[1].attributes('aria-selected')).toBe('false')
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

  it('gives the step marker the active fill or the idle divider tint', () => {
    // Redline "Stage number" — bg/text is one branch each; rounded-bar
    // carries the radius so that value cannot be silently deleted.
    const steps = mountStages().findAll('[data-step]')
    expect(steps[0].classes()).toContain('bg-green-fill')
    expect(steps[0].classes()).toContain('text-green-on-fill')
    expect(steps[0].classes()).toContain('rounded-bar')
    expect(steps[0].classes()).not.toContain('bg-divider')
    expect(steps[0].classes()).not.toContain('text-text-header')
    expect(steps[1].classes()).toContain('bg-divider')
    expect(steps[1].classes()).toContain('text-text-header')
    expect(steps[1].classes()).not.toContain('bg-green-fill')
    expect(steps[1].classes()).not.toContain('text-green-on-fill')
  })

  it('renders the count at the stage-figure step', () => {
    // Redline "Stage figure"
    expect(mountStages().get('[data-figure]').classes()).toContain('text-stage-figure')
  })

  it('gives each stage figure an aria-label for context', () => {
    // Redline "Counts" (ARIA & semantics, spec line 938) — a bare digit has
    // no context for assistive tech; derived from the stage's own data, no
    // new prop needed.
    const figures = mountStages().findAll('[data-figure]')
    expect(figures[0].attributes('aria-label')).toBe('2 Review')
    expect(figures[2].attributes('aria-label')).toBe('8 Inspection')
  })

  it('hides the decorative step marker from assistive tech', () => {
    // Mirrors StatCard's dot precedent for the same job: the marker repeats
    // information already in the label/hint (and for Closed, its "·" would
    // otherwise be announced as content).
    const steps = mountStages().findAll('[data-step]')
    expect(steps[0].attributes('aria-hidden')).toBe('true')
    expect(steps[4].attributes('aria-hidden')).toBe('true')
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

  it('mutes the Closed stage background, leaving the others on the plain surface', () => {
    // Redline "Muted card" (Stat cards & meters, spec line 861) — #FBFCFE is
    // --surface-card-muted, NOT --surface-sunken (#FAFBFD, "expanded row,
    // footer" per Appendix D and *lighter* than --surface in dark mode, which
    // would invert the Closed card's elevation relative to the active ones).
    // Background has exactly one source: both branches of the same binding.
    const cards = mountStages().findAll('[role="tab"]')
    expect(cards[4].classes()).toContain('bg-surface-card-muted')
    expect(cards[4].classes()).not.toContain('bg-surface')
    expect(cards[0].classes()).toContain('bg-surface')
    expect(cards[0].classes()).not.toContain('bg-surface-card-muted')
  })

  it('colours the muted figure the accessible header grey, leaving others ink-900', () => {
    // Redline "Muted card" (Stat cards & meters, spec line 861) — figure
    // #5A6577, the same "Stat cards & meters" group whose "Stage number" row
    // already governs this component. Mirrors StatCard's figure binding for
    // the same redline row, so both components express it the same way.
    const figures = mountStages().findAll('[data-figure]')
    expect(figures[4].classes()).toContain('text-text-header')
    expect(figures[4].classes()).not.toContain('text-ink-900')
    expect(figures[0].classes()).toContain('text-ink-900')
    expect(figures[0].classes()).not.toContain('text-text-header')
  })

  it('renders the active stage panel through the default slot', () => {
    const wrapper = mount(StageTabs, {
      props: { stages: STAGES, modelValue: 'review' },
      slots: { default: '<span class="stage-panel-probe" />' },
    })
    expect(wrapper.find('.stage-panel-probe').exists()).toBe(true)
  })
})
