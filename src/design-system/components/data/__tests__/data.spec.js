import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DataTable from '../DataTable.vue'
import Pagination from '../Pagination.vue'

const COLUMNS = [
  { key: 'facility', label: 'FACILITY', width: 'minmax(240px, 2.4fr)', sortable: true },
  { key: 'lto', label: 'LTO NUMBER', width: '148px', sortable: true },
  { key: 'status', label: 'STATUS', width: '132px' },
]
const ROWS = [
  { id: 'a', stripe: 'green', cells: { facility: 'Carmen RHU', lto: '16-015-2527', status: 'Active' } },
  { id: 'b', stripe: 'red', cells: { facility: 'Hipol', lto: null, status: 'Expiring' } },
  { id: 'c', stripe: 'green', expand: true, cells: { facility: 'Prosperidad', lto: '16-015-2501', status: 'Active' } },
]

const mountTable = (props = {}) => mount(DataTable, { props: { columns: COLUMNS, rows: ROWS, ...props } })

describe('DataTable', () => {
  it('builds one grid template for the header and every row', () => {
    // Redline "Grid template" — the select and actions columns bracket the
    // data ones. Declaring the track list twice is how a header drifts out of
    // line with its body, so the component owns it and callers pass widths.
    const wrapper = mountTable()
    const expected = '44px minmax(240px, 2.4fr) 148px 132px 44px'
    expect(wrapper.get('[data-header-row]').attributes('style')).toContain(expected)
    for (const row of wrapper.findAll('[data-row]')) {
      expect(row.attributes('style')).toContain(expected)
    }
  })

  it('carries a state stripe per row without dropping the status chip', () => {
    // Redline rule card — "Never the only cue: the status chip stays".
    const wrapper = mountTable()
    const stripes = wrapper.findAll('[data-stripe]')
    expect(stripes).toHaveLength(3)
    expect(stripes[0].classes()).toContain('bg-green-fill')
    expect(stripes[1].classes()).toContain('bg-red-500')
    expect(stripes[0].attributes('aria-hidden')).toBe('true')
    // the status column still renders its own value
    expect(wrapper.text()).toContain('Active')
  })

  it('renders an em-dash for an absent value, never a blank cell', () => {
    // Redline "Empty cell · em-dash --ink-100 · never blank, never N/A".
    const cells = mountTable().findAll('[data-row]')[1].findAll('[data-cell]')
    expect(cells[1].text()).toBe('—')
  })

  it('puts the header checkbox in the mixed state on a partial selection', () => {
    // Redline "Select column · header is aria-checked=mixed when partial".
    const partial = mountTable({ selected: ['a'] })
    expect(partial.get('[data-select-all] input').element.indeterminate).toBe(true)
    const all = mountTable({ selected: ['a', 'b', 'c'] })
    expect(all.get('[data-select-all] input').element.indeterminate).toBe(false)
    expect(all.get('[data-select-all] input').element.checked).toBe(true)
  })

  it('names the select-all control without drawing its label', () => {
    // A 44px column has no room for the text, but the control still needs a
    // name — so the label is hidden rather than replaced by an aria-label,
    // which Ark's aria-labelledby would have overridden anyway.
    const wrapper = mountTable({ selectAllLabel: 'Select all facilities' })
    // .text() includes the decorative glyph, so read the label element itself
    expect(wrapper.get('[data-select-all] [data-label]').text()).toBe('Select all facilities')
    expect(wrapper.get('[data-select-all] [data-label]').classes()).toContain(
      'checkbox__label--hidden',
    )
  })

  it('shows the bulk bar only when something is selected', () => {
    expect(mountTable().find('[data-bulk-bar]').exists()).toBe(false)
    const some = mountTable({ selected: ['a', 'b'] })
    expect(some.get('[data-bulk-bar]').text()).toContain('2 selected')
  })

  it('makes a sortable header a button and announces its direction', () => {
    // Redline "Sort caret · header cell is the button".
    const wrapper = mountTable({ sort: { key: 'facility', dir: 'asc' } })
    const heads = wrapper.findAll('[data-column-header]')
    expect(heads[0].element.tagName).toBe('BUTTON')
    expect(heads[0].attributes('aria-sort')).toBe('ascending')
    expect(heads[1].attributes('aria-sort')).toBe('none')
    // STATUS is not sortable, so it is not a control at all
    expect(heads[2].element.tagName).toBe('DIV')
    expect(heads[2].attributes('aria-sort')).toBeUndefined()
  })

  it('expands one row at a time, and names the toggle', () => {
    const wrapper = mountTable({ expanded: 'c' })
    expect(wrapper.findAll('[data-expand-panel]')).toHaveLength(1)
    const toggle = wrapper.get('[data-expand]')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(toggle.attributes('aria-label')).toContain('Collapse')
    expect(toggle.attributes('title')).toBeTruthy()
  })

  it('gives the row-actions control a name and a tooltip', () => {
    // Redline "Actions cell · aria-label + title required" — a bare ⋯ names
    // nothing.
    const action = mountTable().get('[data-row-actions]')
    expect(action.attributes('aria-label')).toBe('Row actions')
    expect(action.attributes('title')).toBe('Row actions')
  })

  it('scrolls rather than reflowing below its minimum width', () => {
    // Redline "Min table width · 1040-1180px inside overflow-x:auto" — a
    // column that reflows becomes unreadable rather than merely off-screen.
    const wrapper = mountTable()
    expect(wrapper.find('.table__scroll').exists()).toBe(true)
    expect(wrapper.find('.table__inner').exists()).toBe(true)
  })
})

describe('Pagination', () => {
  const mountPager = (props = {}) =>
    mount(Pagination, { props: { page: 1, pageCount: 3, total: 211, ...props } })

  it('marks the current page and names every control', () => {
    const wrapper = mountPager({ page: 2 })
    const pages = wrapper.findAll('[data-page]')
    expect(pages.map((p) => p.attributes('aria-current'))).toEqual([undefined, 'page', undefined])
    expect(wrapper.get('[data-prev]').attributes('aria-label')).toBe('Previous page')
    expect(wrapper.get('[data-next]').attributes('title')).toBe('Next page')
  })

  it('disables the ends rather than wrapping around', () => {
    expect(mountPager({ page: 1 }).get('[data-prev]').attributes('disabled')).toBeDefined()
    expect(mountPager({ page: 1 }).get('[data-next]').attributes('disabled')).toBeUndefined()
    expect(mountPager({ page: 3 }).get('[data-next]').attributes('disabled')).toBeDefined()
  })

  it('emits the page and the rows-per-page it was asked for', async () => {
    const wrapper = mountPager({ page: 1 })
    await wrapper.findAll('[data-page]')[2].trigger('click')
    expect(wrapper.emitted('update:page')[0]).toEqual([3])
    await wrapper.get('[data-per-page]').setValue('50')
    expect(wrapper.emitted('update:perPage')[0]).toEqual([50])
  })

  it('shows the total it is paging through', () => {
    expect(mountPager().get('[data-total]').text()).toBe('of 211')
  })
})
