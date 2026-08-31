import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BulkActionBar from '../BulkActionBar.vue'

const ROWS = [
  { id: 'r1', name: 'Trento Primary Care Facility', number: '16-015-2527-PCF-1' },
  { id: 'r2', name: 'Hipol Family Hospital', number: '16-19-26-I-2' },
  { id: 'r3', name: 'Socorro Birthing Clinic', number: '16-72-26-BH-1' },
]

const ACTIONS = [
  { value: 'notice', label: 'Send renewal notice' },
  { value: 'export', label: 'Export' },
]

const mountBar = (props = {}) =>
  mount(BulkActionBar, { props: { rows: ROWS, modelValue: [], actions: ACTIONS, ...props } })

describe('BulkActionBar', () => {
  it('renders every row with its name and licence number', () => {
    const wrapper = mountBar()
    expect(wrapper.findAll('[data-row]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Socorro Birthing Clinic')
    expect(wrapper.text()).toContain('16-72-26-BH-1')
  })

  it('reads "Select all" at zero and a count once something is chosen', () => {
    // Appendix D.1 — the header label is a count, not a static string.
    expect(mountBar().get('[data-bulk-label]').text()).toBe('Select all')
    expect(mountBar({ modelValue: ['r1', 'r2'] }).get('[data-bulk-label]').text()).toBe('2 selected')
  })

  it('hides the actions until at least one row is chosen', () => {
    // Appendix D.1 — the two buttons appear only when something is selected.
    expect(mountBar().findAll('[data-action]')).toHaveLength(0)
    const active = mountBar({ modelValue: ['r1'] })
    expect(active.findAll('[data-action]')).toHaveLength(2)
    expect(active.text()).toContain('Send renewal notice')
    expect(active.text()).toContain('Export')
  })

  it('tints the bar once active', () => {
    // Redline "Bulk bar" — sunken when idle, green tint when active.
    expect(mountBar().get('[data-bulk-bar]').classes()).toContain('bg-surface-sunken')
    const active = mountBar({ modelValue: ['r1'] }).get('[data-bulk-bar]')
    expect(active.classes()).toContain('bg-green-tint')
    expect(active.classes()).not.toContain('bg-surface-sunken')
  })

  it('tints a selected row and leaves the others plain', () => {
    // Redline "Selected row" — its own background.
    const rows = mountBar({ modelValue: ['r2'] }).findAll('[data-row]')
    expect(rows[1].classes()).toContain('bg-green-tint-2')
    expect(rows[0].classes()).not.toContain('bg-green-tint-2')
  })

  it('shows the header box mixed when some but not all rows are chosen', () => {
    // Redline "Indeterminate" — the tri-state is the point of this control.
    // Appendix C's Keyboard row says "aria-checked=mixed", but Task 1 proved
    // Ark exposes mixed through the native input's `indeterminate` IDL
    // PROPERTY, with no aria-checked attribute anywhere. Assert the property.
    const partial = mountBar({ modelValue: ['r1'] }).get('[data-bulk-box] input[type="checkbox"]')
    expect(partial.element.indeterminate).toBe(true)

    const all = mountBar({ modelValue: ['r1', 'r2', 'r3'] }).get(
      '[data-bulk-box] input[type="checkbox"]',
    )
    expect(all.element.indeterminate).toBe(false)
    expect(all.element.checked).toBe(true)
  })

  it('selects every row from the header, and clears them all again', async () => {
    const wrapper = mountBar()
    await wrapper.get('[data-bulk-box] input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual(['r1', 'r2', 'r3'])

    const full = mountBar({ modelValue: ['r1', 'r2', 'r3'] })
    await full.get('[data-bulk-box] input[type="checkbox"]').trigger('click')
    expect(full.emitted('update:modelValue')?.[0][0]).toEqual([])
  })

  it('emits the chosen action', async () => {
    const wrapper = mountBar({ modelValue: ['r1'] })
    await wrapper.findAll('[data-action]')[0].trigger('click')
    expect(wrapper.emitted('action')?.[0]).toEqual(['notice'])
  })
})
