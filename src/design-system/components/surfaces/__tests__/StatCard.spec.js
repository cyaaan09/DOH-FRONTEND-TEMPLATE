import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatCard from '../StatCard.vue'
import Meter from '../Meter.vue'

describe('StatCard', () => {
  it('renders label, value and hint', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Active LTOs', value: '211', hint: '2 due within 7 days' },
    })
    expect(wrapper.text()).toContain('Active LTOs')
    expect(wrapper.text()).toContain('211')
    expect(wrapper.text()).toContain('2 due within 7 days')
  })

  it('renders the figure at card-figure scale', () => {
    const wrapper = mount(StatCard, { props: { label: 'A', value: '211' } })
    expect(wrapper.get('[data-figure]').classes()).toContain('text-card-figure')
  })

  it('renders the label at column-header scale', () => {
    const wrapper = mount(StatCard, { props: { label: 'A', value: '1' } })
    expect(wrapper.get('[data-label]').classes()).toContain('text-column-header')
  })

  it('uses the muted surface for closed or archived stats', () => {
    expect(mount(StatCard, { props: { label: 'A', value: '1', muted: true } }).classes()).toContain(
      'bg-surface-card-muted',
    )
    expect(mount(StatCard, { props: { label: 'A', value: '1' } }).classes()).toContain('bg-surface')
  })

  it('omits the hint element entirely when there is no hint', () => {
    expect(mount(StatCard, { props: { label: 'A', value: '1' } }).find('[data-hint]').exists()).toBe(
      false,
    )
  })
})

describe('Meter', () => {
  it('exposes progressbar semantics with its current and max values', () => {
    const wrapper = mount(Meter, { props: { value: 62, max: 100, label: 'Upload' } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('62')
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(bar.attributes('aria-label')).toBe('Upload')
  })

  it('sets the fill width from the ratio', () => {
    const wrapper = mount(Meter, { props: { value: 25, max: 50, label: 'A' } })
    expect(wrapper.get('[data-fill]').attributes('style')).toContain('width: 50%')
  })

  it('clamps out-of-range values instead of overflowing', () => {
    expect(mount(Meter, { props: { value: 150, max: 100, label: 'A' } }).get('[data-fill]').attributes('style')).toContain('width: 100%')
    expect(mount(Meter, { props: { value: -5, max: 100, label: 'A' } }).get('[data-fill]').attributes('style')).toContain('width: 0%')
  })

  it('clamps the announced aria-valuenow instead of reporting an out-of-range value', () => {
    // A screen reader computes a percentage from valuenow/min/max; an
    // unclamped valuenow of 150 (max 100) or -5 announces nonsense even
    // though the visual fill is already clamped.
    const over = mount(Meter, { props: { value: 150, max: 100, label: 'A' } })
    expect(over.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')

    const under = mount(Meter, { props: { value: -5, max: 100, label: 'A' } })
    expect(under.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })
})
