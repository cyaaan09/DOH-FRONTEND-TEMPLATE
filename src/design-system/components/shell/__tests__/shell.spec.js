import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import AppSidebar from '../AppSidebar.vue'
import AppHeader from '../AppHeader.vue'

const GROUPS = [
  {
    label: 'LICENSING',
    items: [
      { key: 'issued', label: 'Issued LTO', mark: 'circle', badge: '211' },
      { key: 'applications', label: 'LTO Applications', mark: 'square', badge: '4' },
      { key: 'facilities', label: 'Facilities', mark: 'square' },
    ],
  },
]
const ACCOUNT = { initials: 'RV', name: 'R. Villaflor', role: 'Regional Licensing Officer' }

const mountRail = (props = {}) =>
  mount(AppSidebar, { props: { groups: GROUPS, active: 'issued', account: ACCOUNT, ...props } })

describe('AppSidebar', () => {
  it('marks exactly one item as the current page', () => {
    const items = mountRail().findAll('[data-nav-item]')
    expect(items.map((i) => i.attributes('aria-current'))).toEqual(['page', undefined, undefined])
    expect(items[0].classes()).toContain('nav--active')
  })

  it('keeps every item named once the labels drop', () => {
    // Redline "Collapsed item · title + aria-label required (the label is the
    // only name once text drops)". The mark is decorative and 1.4.11-exempt
    // BESIDE a label — collapsed there is no label, so the accessible name
    // has to come from somewhere, and a tooltip alone is not a name.
    const collapsed = mountRail({ collapsed: true })
    for (const item of collapsed.findAll('[data-nav-item]')) {
      expect(item.attributes('aria-label'), 'collapsed item has no accessible name').toBeTruthy()
      expect(item.attributes('title'), 'collapsed item has no tooltip').toBeTruthy()
    }
    expect(collapsed.text()).not.toContain('LTO Applications')
    // and expanded, the visible text IS the name, so no aria-label overrides it
    expect(mountRail().findAll('[data-nav-item]')[0].attributes('aria-label')).toBeUndefined()
  })

  it('collapses a count badge to a dot rather than shrinking the number', () => {
    // Redline "Collapsed badge · 7px dot" — a two- or three-digit count is
    // unreadable at 62px, so it degrades to presence.
    const open = mountRail()
    expect(open.findAll('[data-badge]').map((b) => b.text())).toEqual(['211', '4'])
    expect(open.findAll('[data-badge-dot]')).toHaveLength(0)

    const shut = mountRail({ collapsed: true })
    expect(shut.findAll('[data-badge]')).toHaveLength(0)
    expect(shut.findAll('[data-badge-dot]')).toHaveLength(2)
  })

  it('gives its icon-only controls a name and a tooltip', () => {
    // Redline "Icon-only control · aria-label + title" — a bare chevron is
    // unusable by screen reader and unexplained by pointer.
    const collapse = mountRail().get('[data-collapse]')
    expect(collapse.attributes('aria-label')).toBe('Collapse navigation')
    expect(collapse.attributes('title')).toBe('Collapse navigation')

    const menu = mountRail().get('[data-account-menu]')
    expect(menu.attributes('aria-label')).toContain('R. Villaflor')
    expect(menu.attributes('title')).toBeTruthy()
  })

  it('hides the decorative marks and the logo from assistive tech', () => {
    // Redline "Item mark · decorative, 1.4.11 exempt beside its label".
    const wrapper = mountRail()
    for (const mark of wrapper.findAll('[data-mark]')) {
      expect(mark.attributes('aria-hidden')).toBe('true')
    }
    expect(wrapper.get('[data-logo]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-avatar]').attributes('aria-hidden')).toBe('true')
  })

  it('drops group headers when collapsed, since they have no room to read', () => {
    expect(mountRail().findAll('[data-group]').map((g) => g.text())).toEqual(['LICENSING'])
    expect(mountRail({ collapsed: true }).findAll('[data-group]')).toHaveLength(0)
  })

  it('emits the item it was asked for', async () => {
    const wrapper = mountRail()
    await wrapper.findAll('[data-nav-item]')[1].trigger('click')
    expect(wrapper.emitted('select')[0][0].key).toBe('applications')
  })

  it('is a landmark with a name', () => {
    const nav = mountRail()
    expect(nav.element.tagName).toBe('NAV')
    expect(nav.attributes('aria-label')).toBe('OLRS')
  })
})

describe('AppHeader', () => {
  it('marks the last crumb as the current page', () => {
    const crumbs = mount(AppHeader, {
      props: { breadcrumb: ['Licensing', 'Issued LTO'] },
    }).findAll('[data-crumb]')
    expect(crumbs.map((c) => c.text())).toEqual(['Licensing', 'Issued LTO'])
    expect(crumbs[0].attributes('aria-current')).toBeUndefined()
    expect(crumbs[1].attributes('aria-current')).toBe('page')
  })

  it('names its breadcrumb landmark', () => {
    const wrapper = mount(AppHeader, { props: { breadcrumb: ['A', 'B'] } })
    expect(wrapper.get('[data-breadcrumb]').attributes('aria-label')).toBe('Breadcrumb')
  })

  it('writes its translucent surface against --surface, not white', () => {
    // The literal would glare across the dark canvas — the exact defect the
    // page-shell schematic shipped with.
    const source = readFileSync('src/design-system/components/shell/AppHeader.vue', 'utf8')
    expect(source).toMatch(/color-mix\(in srgb, var\(--surface\) 75%, transparent\)/)
  })
})
