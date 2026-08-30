import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SegmentedTabs from '../SegmentedTabs.vue'

const OPTIONS = ['All', 'Initial', 'Renewal', 'Add / Modify']

const mountSegments = (props = {}) =>
  mount(SegmentedTabs, {
    props: { options: OPTIONS, modelValue: 'All', label: 'Application type', ...props },
  })

describe('SegmentedTabs', () => {
  it('renders one segment per option', () => {
    const wrapper = mountSegments()
    expect(wrapper.findAll('[data-segment]')).toHaveLength(4)
    expect(wrapper.text()).toContain('Add / Modify')
  })

  it('names the group for assistive technology', () => {
    // The group is a radio group; without a name its options have no context.
    const group = mountSegments().get('[role="radiogroup"]')
    expect(group.attributes('aria-label')).toBe('Application type')
  })

  it('checks the selected segment and leaves the others unchecked', () => {
    // Selection semantics guard (review Finding 7). NOT an aria-checked
    // assertion, despite the finding naming that attribute by analogy with
    // Tabs.spec.js's aria-selected guard: verified against the installed
    // @zag-js/radio-group (radio-group.connect.mjs) that connect() never
    // sets aria-checked anywhere, on the item or the hidden input. This
    // control renders a real <input type="radio">, and ARIA authoring
    // practice is to let the browser expose a native control's checked state
    // rather than mirror it into an aria-* attribute. What a future
    // primitive swap could actually drop silently is the native `checked`
    // state itself, so that is what this guards.
    const inputs = mountSegments().findAll('[data-segment] input')
    expect(inputs[0].element.checked).toBe(true)
    expect(inputs[1].element.checked).toBe(false)
  })

  it('emits update:modelValue when a segment is chosen', async () => {
    // Ark's radio-group wires selection through the hidden input's `click`
    // handler (it reads `event.currentTarget.checked`), not a `change`
    // listener — there is no `onChange` in the connect() output. `.trigger`
    // matches how zag-js actually listens; `setValue()` fires only `change`
    // and never reaches the handler, so the update is never emitted.
    const wrapper = mountSegments()
    await wrapper.findAll('[data-segment] input')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Initial'])
  })

  it('gives the selected segment the raised white treatment', () => {
    // Redline "Segment on" — white, tile radius, 700. All three are static
    // utility classes, so all three get an assertion: a passing suite must
    // not survive deleting any one of them.
    const segments = mountSegments().findAll('[data-segment]')
    expect(segments[0].classes()).toContain('bg-surface')
    expect(segments[0].classes()).toContain('rounded-tile')
    expect(segments[0].classes()).toContain('font-bold')
  })

  it('leaves unselected segments transparent and at 500', () => {
    // Redline "Segment off". Both branches must set background AND weight, or
    // the winner is decided by Tailwind's emit order.
    const segments = mountSegments().findAll('[data-segment]')
    expect(segments[1].classes()).toContain('bg-transparent')
    expect(segments[1].classes()).toContain('font-medium')
    expect(segments[1].classes()).not.toContain('bg-surface')
    expect(segments[1].classes()).not.toContain('font-bold')
  })

  it('sizes every segment from the same type step', () => {
    // Redline "Segment on"/"Segment off" are both 12.5px; only weight differs.
    for (const segment of mountSegments().findAll('[data-segment]')) {
      expect(segment.classes()).toContain('text-field-label')
    }
  })

  it('puts the muted shell around the group', () => {
    // Redline "Segmented shell"
    const group = mountSegments().get('[role="radiogroup"]')
    expect(group.classes()).toContain('bg-surface-muted')
    expect(group.classes()).toContain('rounded-field')
  })
})
