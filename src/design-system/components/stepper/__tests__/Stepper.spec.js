import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Stepper from '../Stepper.vue'

const STEPS = [
  { key: 'a', label: 'Applicant', sublabel: 'Completed', state: 'done' },
  { key: 'b', label: 'Facility profile', sublabel: 'In progress', state: 'current' },
  { key: 'c', label: 'Documents', sublabel: '4 required', state: 'upcoming' },
  { key: 'd', label: 'Review & sign', sublabel: 'Not started', state: 'upcoming' },
]

const mountStepper = (props = {}) =>
  mount(Stepper, { props: { steps: STEPS, label: 'Application progress', ...props } })

describe('Stepper', () => {
  it('renders an ordered list, named but not drawn', () => {
    // Redline "ARIA · ol/li with aria-current=step on the current node".
    const wrapper = mountStepper()
    const list = wrapper.get('ol')
    expect(list.attributes('aria-label')).toBe('Application progress')
    expect(wrapper.text()).not.toContain('Application progress')
    expect(wrapper.findAll('li')).toHaveLength(4)
  })

  it('marks only the current step with aria-current', () => {
    const steps = mountStepper().findAll('[data-step]')
    expect(steps.map((s) => s.attributes('aria-current'))).toEqual([
      undefined,
      'step',
      undefined,
      undefined,
    ])
  })

  it('makes reached steps buttons and upcoming ones plain text', () => {
    // Redline "Interaction · done and current are buttons; upcoming is plain
    // text — no forward jumps past validation". Rendering an upcoming step as
    // a disabled button would still put it in the tab order's shape; a span
    // is not a control at all.
    const nodes = mountStepper().findAll('[data-node]')
    expect(nodes.map((n) => n.element.tagName)).toEqual(['BUTTON', 'BUTTON', 'SPAN', 'SPAN'])
  })

  it('emits only for the steps that are reachable', async () => {
    const wrapper = mountStepper()
    await wrapper.findAll('[data-node]')[0].trigger('click')
    await wrapper.findAll('[data-node]')[2].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')[0][0].key).toBe('a')
  })

  it('fills a connector only behind a DONE step, so progress stops at the current node', () => {
    // Redline "Connector rule" — the current step's connector stays unfilled.
    // Filling it would read as progress the user has not made.
    const connectors = mountStepper().findAll('[data-connector]')
    expect(connectors).toHaveLength(3) // one per step except the last
    expect(connectors[0].classes()).toContain('bg-green-fill')
    expect(connectors[1].classes()).toContain('bg-neutral-100')
    expect(connectors[1].classes()).not.toContain('bg-green-fill')
  })

  it('dresses each node state distinctly, and puts state in the text too', () => {
    // Redline ARIA row — "state also in the sub-label text, not colour alone".
    const wrapper = mountStepper()
    const nodes = wrapper.findAll('[data-node]')
    expect(nodes[0].classes()).toContain('stepper__node--done')
    expect(nodes[0].text()).toBe('✓')
    expect(nodes[1].classes()).toContain('stepper__node--current')
    expect(nodes[1].text()).toBe('2')
    expect(nodes[2].classes()).toContain('stepper__node--upcoming')
    expect(wrapper.findAll('[data-sublabel]').map((s) => s.text())).toEqual([
      'Completed',
      'In progress',
      '4 required',
      'Not started',
    ])
  })

  it('renders an error step with its own node and red sub-label', () => {
    const wrapper = mountStepper({
      steps: [{ key: 'x', label: 'Documents', sublabel: '2 files rejected', state: 'error' }],
    })
    expect(wrapper.get('[data-node]').classes()).toContain('stepper__node--error')
    expect(wrapper.get('[data-node]').text()).toBe('!')
    expect(wrapper.get('[data-sublabel]').classes()).toContain('text-red-700')
  })

  it('computes the compact percentage from done steps, not the index', () => {
    // Two of four done = 50%. Reading it off the current index would report
    // progress for a step still being filled in.
    const wrapper = mountStepper({ variant: 'compact', title: 'Step 2 of 4' })
    expect(wrapper.get('[data-compact-percent]').text()).toBe('25%')
    expect(wrapper.get('[data-meter-fill]').attributes('style')).toContain('width: 25%')
  })

  it('drops the segment strip above four steps, keeping the meter', () => {
    // Redline "Compact · 4px segments for ≤4 steps".
    const four = mountStepper({ variant: 'compact' })
    expect(four.findAll('[data-segment]')).toHaveLength(4)
    const five = mountStepper({
      variant: 'compact',
      steps: [...STEPS, { key: 'e', label: 'Extra', state: 'upcoming' }],
    })
    expect(five.findAll('[data-segment]')).toHaveLength(0)
    expect(five.find('[data-meter]').exists()).toBe(true)
  })

  it('switches layout class per variant', () => {
    expect(mountStepper().classes()).toContain('stepper--horizontal')
    expect(mountStepper({ variant: 'vertical' }).classes()).toContain('stepper--vertical')
    expect(mountStepper({ variant: 'compact' }).classes()).toContain('stepper--compact')
  })
})
