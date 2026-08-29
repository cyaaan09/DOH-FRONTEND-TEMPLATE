import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Notice from '../Notice.vue'
import Skeleton from '../Skeleton.vue'

describe('Notice', () => {
  it('renders its label pill and body', () => {
    const wrapper = mount(Notice, {
      props: { tone: 'red', label: 'Error' },
      slots: { default: 'Inspection is overdue by 4 days.' },
    })
    expect(wrapper.text()).toContain('Error')
    expect(wrapper.text()).toContain('Inspection is overdue by 4 days.')
  })

  it('colours the body text in the tone, not grey', () => {
    // Redline "Notice text · 13px / 400 in tone colour on tone/50"
    const body = mount(Notice, { props: { tone: 'red', label: 'Error' } }).get('[data-body]')
    expect(body.classes()).toContain('text-red-700')
    expect(body.classes()).toContain('text-notice')
    expect(body.classes()).not.toContain('text-ink-700')
  })

  it('gives the shell no border and the redlined geometry', () => {
    // Redline "Notice shell · min-h 32px · radius 16px · pad 4px 10px 4px 4px · gap 12px"
    const classes = mount(Notice, { props: { tone: 'green', label: 'Success' } }).classes()
    expect(classes).toContain('min-h-notice')
    expect(classes).toContain('rounded-notice')
    expect(classes).toContain('gap-3')
    expect(classes).toContain('pl-1')
    expect(classes).toContain('pr-2.5')
    expect(classes).not.toContain('border')
  })

  it('outlines the pill in the tone border on a transparent fill', () => {
    // Redline "Notice label · 24px · radius 16px · pad 0 12px · 12.5px / 400 · 1px tone/200"
    const pill = mount(Notice, { props: { tone: 'green', label: 'Success' } }).get('[data-pill]')
    expect(pill.classes()).toContain('h-6')
    expect(pill.classes()).toContain('px-3')
    expect(pill.classes()).toContain('rounded-notice')
    expect(pill.classes()).toContain('border-notice-border-green')
    expect(pill.classes()).toContain('text-field-label')
    expect(pill.classes()).toContain('font-normal')
    expect(pill.classes()).not.toContain('bg-surface')
  })

  it('fills each tone from the tone/50 scale', () => {
    // Redline "Notice fills" — the tone/50 scale
    const fills = {
      green: 'bg-green-50',
      blue: 'bg-blue-50',
      amber: 'bg-amber-50',
      red: 'bg-red-50',
    }
    for (const [tone, fill] of Object.entries(fills)) {
      expect(mount(Notice, { props: { tone, label: 'X' } }).classes(), `tone=${tone}`).toContain(
        fill,
      )
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Notice, { props: { tone: 'nonsense', label: 'X' } }).classes()).toContain(
      'bg-neutral-100',
    )
  })

  it('interrupts for errors but stays polite otherwise', () => {
    expect(mount(Notice, { props: { tone: 'red', label: 'Error' } }).attributes('role')).toBe(
      'alert',
    )
    expect(mount(Notice, { props: { tone: 'green', label: 'Success' } }).attributes('role')).toBe(
      'status',
    )
  })
})

describe('Skeleton', () => {
  it('renders three rows by default', () => {
    expect(mount(Skeleton).findAll('[data-row]')).toHaveLength(3)
  })

  it('honours an explicit row count', () => {
    // Redline "Skeleton bar · 3 rows max" caps the count, so this now proves
    // the prop is honoured below the cap rather than at an arbitrary value.
    expect(mount(Skeleton, { props: { rows: 2 } }).findAll('[data-row]')).toHaveLength(2)
  })

  it('hides itself from assistive tech', () => {
    // Placeholder bars carry no information; the surrounding region owns any
    // loading announcement.
    expect(mount(Skeleton).attributes('aria-hidden')).toBe('true')
  })
})

describe('Skeleton — Appendix C conformance', () => {
  it('renders 11px bars at the bar radius on the canvas tint', () => {
    // Redline "Skeleton bar · 11px · radius 6px · on the canvas tint · 3 rows max"
    const row = mount(Skeleton).get('[data-row]')
    expect(row.classes()).toContain('h-2.75')
    expect(row.classes()).toContain('rounded-bar')
    expect(row.classes()).toContain('bg-neutral-100')
  })

  it('never renders more than three rows', () => {
    // Redline "3 rows max" — the source warns against a page of shimmer.
    expect(mount(Skeleton, { props: { rows: 9 } }).findAll('[data-row]')).toHaveLength(3)
    expect(mount(Skeleton, { props: { rows: 2 } }).findAll('[data-row]')).toHaveLength(2)
  })
})
