import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { GAPS, isGap } from '../gaps.js'
import Row from '../Row.vue'
import Column from '../Column.vue'
import Cluster from '../Cluster.vue'
import Split from '../Split.vue'
import Grid from '../Grid.vue'
import GridItem from '../GridItem.vue'
import AutoGrid from '../AutoGrid.vue'
import Sidebar from '../Sidebar.vue'
import Page from '../Page.vue'
import Section from '../Section.vue'

const SPACING_ONLY = [
  'Row',
  'Column',
  'Cluster',
  'Split',
  'Grid',
  'GridItem',
  'AutoGrid',
  'Sidebar',
]

describe('the gap scale', () => {
  it('is the redlined scale, and excludes the values a layout drifts into', () => {
    // Redline "Gap scale · 6 · 8 · 12 · 14 · 16 · 22 · 24 · 32 — no 10, 18,
    // or 20". The exclusions are the point: those are the values hand
    // measuring produces, and the scale exists to make them a failure.
    expect(GAPS).toEqual([6, 8, 12, 14, 16, 22, 24, 32])
    for (const bad of [10, 18, 20]) expect(isGap(bad), `${bad} must be rejected`).toBe(false)
    for (const good of GAPS) expect(isGap(good)).toBe(true)
  })

  it('is enforced by every primitive that takes a gap', () => {
    for (const [name, C] of Object.entries({ Row, Column, Cluster, Split, AutoGrid })) {
      const validator = C.props.gap.validator
      expect(validator, `${name} has no gap validator`).toBeTypeOf('function')
      expect(validator(20), `${name} accepted 20`).toBe(false)
      expect(validator(12), `${name} rejected 12`).toBe(true)
    }
  })
})

describe('primitives own spacing only', () => {
  it('declare no colour, border or padding of their own', () => {
    // Redline "Rule · primitives set direction, gap and alignment only — no
    // colour, border, or padding of their own". This is the whole contract:
    // the moment one grows a background it has become a card, and the rule
    // card in the section says so in as many words. Page and Section are
    // deliberately exempt — they ARE the containers.
    const banned = /^\s*(background|border(?!-box)|padding|color)\s*:/m
    for (const name of SPACING_ONLY) {
      const source = readFileSync(`src/design-system/components/layout/${name}.vue`, 'utf8')
      const styles = source.slice(source.indexOf('<style'))
      const hit = styles.match(banned)
      expect(hit?.[0], `${name} declares ${hit?.[0]?.trim()}`).toBeUndefined()
    }
  })
})

describe('Row', () => {
  it('is a centred flex row at gap 12 that does not wrap', () => {
    const style = mount(Row, { slots: { default: '<i/>' } }).attributes('style')
    expect(style).toContain('gap: 12px')
    expect(style).toContain('align-items: center')
    expect(style).toContain('flex-wrap: nowrap')
  })
})

describe('Column', () => {
  it('stacks and stretches by default', () => {
    const style = mount(Column, { slots: { default: '<i/>' } }).attributes('style')
    expect(style).toContain('gap: 12px')
    expect(style).toContain('align-items: stretch')
  })
})

describe('Cluster', () => {
  it("wraps by default, because its count is not the caller's to control", () => {
    const w = mount(Cluster, { slots: { default: '<i/>' } })
    expect(w.attributes('style')).toContain('gap: 8px')
    // wrap is in the scoped class, not inline — assert the class is present
    expect(w.classes()).toContain('ds-cluster')
  })
})

describe('Split', () => {
  it('carries the flex:1 spacer itself rather than trusting the caller', () => {
    // The spacer IS the primitive: a caller who forgets it just has a Row.
    const w = mount(Split, { slots: { default: '<i/>', end: '<b/>' } })
    expect(w.find('[data-split-start]').exists()).toBe(true)
    expect(w.find('[data-split-end]').exists()).toBe(true)
  })

  it('omits the end group entirely when nothing is slotted into it', () => {
    const w = mount(Split, { slots: { default: '<i/>' } })
    expect(w.find('[data-split-end]').exists()).toBe(false)
  })
})

describe('Grid', () => {
  it('runs 12 tracks at the redlined asymmetric gap', () => {
    const style = mount(Grid, { slots: { default: '<i/>' } }).attributes('style')
    expect(style).toContain('gap: 16px 24px')
    expect(style).toContain('--ds-grid-cols: 12')
  })

  it('uses minmax(0,1fr), not 1fr, so one long string cannot widen the grid', () => {
    // A bare 1fr track has an `auto` minimum: the same failure the
    // "Flex children · min-width: 0" redline names, baked in rather than
    // left to the caller.
    const styles = readFileSync('src/design-system/components/layout/Grid.vue', 'utf8')
    expect(styles).toContain('minmax(0, 1fr)')
  })

  it('establishes the container GridItem measures its floor against', () => {
    // GridItem's floor query is against the GRID's width. Queried against
    // itself the item IS the track, so the condition could never be false
    // and the rule was dead CSS in the first draft.
    const grid = readFileSync('src/design-system/components/layout/Grid.vue', 'utf8')
    const item = readFileSync('src/design-system/components/layout/GridItem.vue', 'utf8')
    expect(grid).toMatch(/container-type:\s*inline-size/)
    expect(grid).toMatch(/container-name:\s*ds-grid/)
    expect(item).toMatch(/@container ds-grid \(max-width: 780px\)/)
  })
})

describe('GridItem', () => {
  it('spans the redlined widths and refuses the rest', () => {
    expect(mount(GridItem, { slots: { default: '<i/>' } }).attributes('style')).toContain(
      '--ds-span: 12',
    )
    const v = GridItem.props.span.validator
    for (const good of [3, 4, 6, 8, 12]) expect(v(good), `${good}`).toBe(true)
    for (const bad of [5, 7, 9, 11]) expect(v(bad), `${bad}`).toBe(false)
  })
})

describe('AutoGrid', () => {
  it('reflows from a track minimum rather than a media query', () => {
    const style = mount(AutoGrid, {
      props: { min: '190px' },
      slots: { default: '<i/>' },
    }).attributes('style')
    expect(style).toContain('--ds-autogrid-min: 190px')
    expect(style).toContain('gap: 12px')
  })
})

describe('Sidebar', () => {
  it('renders a rail and a main column, and gives main min-width: 0', () => {
    const w = mount(Sidebar, { slots: { rail: '<i/>', default: '<b/>' } })
    expect(w.find('[data-sidebar-rail]').exists()).toBe(true)
    expect(w.find('[data-sidebar-main]').exists()).toBe(true)
    // Redline "Flex children · min-width: 0" — main always clips, so it is
    // built in rather than left to every caller.
    expect(readFileSync('src/design-system/components/layout/Sidebar.vue', 'utf8')).toMatch(
      /\.ds-sidebar__main\s*\{[^}]*min-width:\s*0/,
    )
  })

  it('takes the collapsed rail width on demand', () => {
    expect(
      mount(Sidebar, { props: { collapsed: true }, slots: { rail: '<i/>' } }).classes(),
    ).toContain('ds-sidebar--collapsed')
  })
})

describe('Page and Section', () => {
  it('are the two primitives that DO own colour and padding', () => {
    // The Rule row governs the spacing primitives; these are containers.
    expect(mount(Page, { slots: { default: '<i/>' } }).classes()).toContain('bg-canvas')
    expect(mount(Section, { slots: { default: '<i/>' } }).classes()).toContain('bg-surface')
  })

  it('caps width per the redline, wider for tables', () => {
    expect(mount(Page, { slots: { default: '<i/>' } }).classes()).toContain('ds-page--detail')
    expect(
      mount(Page, { props: { width: 'table' }, slots: { default: '<i/>' } }).classes(),
    ).toContain('ds-page--table')
  })

  it('renders Section as a <section>, so a card cannot nest inside a card by accident', () => {
    expect(mount(Section, { slots: { default: '<i/>' } }).element.tagName).toBe('SECTION')
  })
})
