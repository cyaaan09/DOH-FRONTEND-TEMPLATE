import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchResults from '../SearchResults.vue'

const GROUPS = [
  {
    label: 'FACILITIES',
    count: 3,
    rows: [
      { id: 'a', tile: 'PCF', title: 'Carmen RHU', meta: '16-015-2527-PCF-1' },
      { id: 'b', tile: 'BH', title: 'Carmen BH', meta: '16-015-2419-BH-2' },
      { id: 'c', tile: 'CL', title: 'Carmen Lab', meta: 'no LTO on file' },
      { id: 'd', tile: 'CL', title: 'Fourth', meta: 'x' },
      { id: 'e', tile: 'CL', title: 'Fifth — over the cap', meta: 'x' },
    ],
  },
]

const mountS = (props = {}) =>
  mount(SearchResults, { props: { groups: GROUPS, active: 'a', ...props } })

describe('SearchResults', () => {
  it('wires the combobox pattern, with the selection announced by id', () => {
    // Redline "ARIA · role=combobox aria-expanded + role=listbox/option ·
    // aria-activedescendant follows the arrows". Focus stays in the input
    // while the arrows move the selection, so it must be announced by id.
    const wrapper = mountS()
    const input = wrapper.get('[data-search-input]')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-activedescendant')).toBe('search-results-a')
    expect(wrapper.get('[data-search-panel]').attributes('role')).toBe('listbox')
    expect(wrapper.get('[data-search-row]').attributes('role')).toBe('option')
  })

  it('marks exactly one row selected, and does not navigate on its own', () => {
    // Redline "Active row · preselected but never auto-navigated".
    const wrapper = mountS()
    const selected = wrapper
      .findAll('[data-search-row]')
      .filter((r) => r.attributes('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('caps rows per group and leaves the rest to See all', () => {
    // Redline "Row cap · 4 rows per group · everything else behind See all".
    expect(mountS().findAll('[data-search-row]')).toHaveLength(4)
    expect(mountS().text()).not.toContain('Fifth — over the cap')
  })

  it('states a missing identifier in words rather than leaving a blank line', () => {
    // Redline "Missing meta · states the absence in words (no LTO on file) —
    // never an empty second line". A blank line reads as a rendering bug.
    const metas = mountS()
      .findAll('[data-row-meta]')
      .map((m) => m.text())
    expect(metas).toContain('no LTO on file')
    expect(metas.every((m) => m.length > 0)).toBe(true)
  })

  it('shows the escape hint inside the field, before it is needed', () => {
    expect(mountS().get('[data-esc-hint]').text()).toBe('esc')
  })

  it('collapses to the field alone when there are no groups', () => {
    const wrapper = mountS({ groups: [] })
    expect(wrapper.find('[data-search-panel]').exists()).toBe(false)
    expect(wrapper.get('[data-search-input]').attributes('aria-expanded')).toBe('false')
  })
})
