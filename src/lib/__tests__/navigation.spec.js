import { describe, expect, it } from 'vitest'
import { NAV_GROUPS, NAV_ITEMS, navItemForPath } from '../navigation'

/**
 * The sidebar renders this, the header derives its breadcrumb from it, and the
 * router pushes its `to`. One source, so the three cannot disagree — which is
 * the whole reason the file exists rather than three literal lists.
 */
describe('navigation', () => {
  it('gives every item a key and a route', () => {
    expect(NAV_ITEMS.filter((item) => !item.key || !item.to?.startsWith('/'))).toEqual([])
  })

  it('keeps keys unique, since the active state is matched on them', () => {
    const keys = NAV_ITEMS.map((item) => item.key)
    expect(keys).toEqual([...new Set(keys)])
  })

  it('finds the item for a path, including a nested one', () => {
    expect(navItemForPath('/dashboard').key).toBe('dashboard')
    expect(navItemForPath('/second-page').key).toBe('second')
    // a detail route under a section still highlights that section
    expect(navItemForPath('/second-page/42').key).toBe('second')
  })

  it('returns null off the nav rather than guessing', () => {
    // The breadcrumb reads this; guessing would label an unrelated page with
    // whichever item happened to match first.
    expect(navItemForPath('/design-system')).toBeNull()
    expect(navItemForPath('/nope')).toBeNull()
  })

  it('does not match a path that merely starts with the same characters', () => {
    // '/second-page-two' is not under '/second-page'; only a '/' boundary is.
    expect(navItemForPath('/second-page-two')).toBeNull()
  })

  it('carries its group, so the breadcrumb needs no second source', () => {
    expect(NAV_ITEMS.every((item) => NAV_GROUPS.some((g) => g.label === item.group))).toBe(true)
  })
})
