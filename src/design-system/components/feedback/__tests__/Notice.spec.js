import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

  it('maps every tone to its own surface/pill class pair', () => {
    const cases = {
      neutral: { surface: 'bg-neutral-100', pill: 'text-ink-600' },
      green: { surface: 'bg-green-50', pill: 'text-green-text' },
      amber: { surface: 'bg-amber-50', pill: 'text-amber-text' },
      red: { surface: 'bg-red-50', pill: 'text-red-700' },
      blue: { surface: 'bg-blue-50', pill: 'text-blue-700' },
      violet: { surface: 'bg-violet-100', pill: 'text-violet-700' },
    }
    for (const [tone, { surface, pill }] of Object.entries(cases)) {
      const wrapper = mount(Notice, { props: { tone, label: 'X' } })
      expect(wrapper.classes(), `tone=${tone} surface`).toContain(surface)
      expect(wrapper.get('[data-pill]').classes(), `tone=${tone} pill`).toContain(pill)
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Notice, { props: { tone: 'nonsense', label: 'X' } }).classes()).toContain(
      'bg-neutral-100',
    )
  })

  it('interrupts assistive tech for an error tone but stays polite otherwise', () => {
    expect(mount(Notice, { props: { tone: 'red', label: 'Error' } }).attributes('role')).toBe(
      'alert',
    )
    expect(mount(Notice, { props: { tone: 'green', label: 'OK' } }).attributes('role')).toBe(
      'status',
    )
  })

  describe('prop validator', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('warns on an unknown tone but keeps the runtime fallback', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(Notice, { props: { tone: 'nonsense', label: 'X' } })
      expect(warn).toHaveBeenCalled()
      expect(wrapper.classes()).toContain('bg-neutral-100')
    })

    it('does not warn for a known tone', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(Notice, { props: { tone: 'blue', label: 'X' } })
      expect(warn).not.toHaveBeenCalled()
    })
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
