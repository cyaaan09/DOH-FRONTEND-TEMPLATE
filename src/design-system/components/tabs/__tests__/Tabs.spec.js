import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Tabs from '../Tabs.vue'

const TABS = [
  { key: 'active', label: 'Active LTOs', count: '211' },
  { key: 'all', label: 'All applications', count: '215' },
  { key: 'moa', label: 'MOA services', count: '8' },
]

const mountTabs = (props = {}) =>
  mount(Tabs, { props: { tabs: TABS, modelValue: 'active', ...props } })

describe('Tabs', () => {
  it('renders one trigger per tab, with its count', () => {
    const wrapper = mountTabs()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Active LTOs')
    expect(wrapper.text()).toContain('211')
  })

  it('marks the model value selected and the others not', () => {
    const triggers = mountTabs().findAll('[role="tab"]')
    expect(triggers[0].attributes('aria-selected')).toBe('true')
    expect(triggers[1].attributes('aria-selected')).toBe('false')
  })

  it('emits update:modelValue when another tab is chosen', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['all'])
  })

  it('colours the 2.5px marker only under the active tab', () => {
    // Redline "Marker". Asserted through classes rather than left to scoped
    // CSS: a marker that never paints is invisible to a DOM test otherwise.
    // The width is asserted too (review Finding 3): border-b-green-fill sets
    // only border-bottom-color, so a 9-test suite could stay green even if
    // border-b-[2.5px] were deleted and the marker never painted at all.
    const triggers = mountTabs().findAll('[role="tab"]')
    expect(triggers[0].classes()).toContain('border-b-[2.5px]')
    expect(triggers[0].classes()).toContain('border-b-green-fill')
    expect(triggers[1].classes()).toContain('border-b-[2.5px]')
    expect(triggers[1].classes()).toContain('border-b-transparent')
    expect(triggers[1].classes()).not.toContain('border-b-green-fill')
  })

  it('gives the active tab the green text and the idle ones the header grey', () => {
    // Redline "Active text" and "Idle tab text" — the idle colour is the
    // accessible header grey, not the lighter meta grey.
    const triggers = mountTabs().findAll('[role="tab"]')
    expect(triggers[0].classes()).toContain('text-green-text')
    expect(triggers[0].classes()).not.toContain('text-text-header')
    expect(triggers[1].classes()).toContain('text-text-header')
    expect(triggers[1].classes()).not.toContain('text-green-text')
  })

  it('tints the active count and greys the idle ones', () => {
    // Redline "Count active" and "Count idle"
    const counts = mountTabs().findAll('[data-count]')
    expect(counts[0].classes()).toContain('bg-green-100')
    expect(counts[0].classes()).toContain('text-green-text')
    expect(counts[1].classes()).toContain('bg-surface-muted')
    expect(counts[1].classes()).toContain('text-text-header')
  })

  it('renders counts in mono at the redlined size', () => {
    // Redline "Tab count · mono 11.5px/500"
    const count = mountTabs().get('[data-count]')
    expect(count.classes()).toContain('font-mono')
    expect(count.classes()).toContain('text-stat-hint')
    expect(count.classes()).toContain('font-medium')
  })

  it('does not repeat the tab label inside its own accessible name', () => {
    // The count sits inside role="tab", so an aria-label on it REPLACES its text
    // in the tab's name-from-content computation, producing "Active LTOs 211
    // Active LTOs". The visible label already gives the number its context.
    const count = mountTabs().get('[data-count]')
    expect(count.attributes('aria-label')).toBeUndefined()
    expect(count.text()).toBe('211')
  })

  it('omits the count element for a tab with no count', () => {
    const wrapper = mount(Tabs, {
      props: { tabs: [{ key: 'a', label: 'A' }], modelValue: 'a' },
    })
    expect(wrapper.find('[data-count]').exists()).toBe(false)
  })

  it('renders the active tab panel through the default slot', () => {
    const wrapper = mount(Tabs, {
      props: { tabs: TABS, modelValue: 'active' },
      slots: { default: '<span class="panel-probe" />' },
    })
    expect(wrapper.find('.panel-probe').exists()).toBe(true)
  })
})
