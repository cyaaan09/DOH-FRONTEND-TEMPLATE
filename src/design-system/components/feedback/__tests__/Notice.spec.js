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

  it('carries the tone on the pill, keeping the surface almost white', () => {
    const wrapper = mount(Notice, { props: { tone: 'red', label: 'Error' } })
    expect(wrapper.get('[data-pill]').classes()).toContain('text-red-700')
    expect(wrapper.classes()).toContain('bg-red-50')
  })

  it('supports every tone Chip supports', () => {
    for (const tone of ['neutral', 'green', 'amber', 'red', 'blue', 'violet']) {
      expect(() => mount(Notice, { props: { tone, label: 'X' } })).not.toThrow()
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Notice, { props: { tone: 'nonsense', label: 'X' } }).classes()).toContain(
      'bg-neutral-100',
    )
  })

  it('announces errors politely to assistive tech', () => {
    expect(mount(Notice, { props: { tone: 'red', label: 'Error' } }).attributes('role')).toBe(
      'status',
    )
  })
})

describe('Skeleton', () => {
  it('renders three rows by default', () => {
    expect(mount(Skeleton).findAll('[data-row]')).toHaveLength(3)
  })

  it('honours an explicit row count', () => {
    expect(mount(Skeleton, { props: { rows: 5 } }).findAll('[data-row]')).toHaveLength(5)
  })

  it('hides itself from assistive tech', () => {
    // Placeholder bars carry no information; the surrounding region owns any
    // loading announcement.
    expect(mount(Skeleton).attributes('aria-hidden')).toBe('true')
  })
})
