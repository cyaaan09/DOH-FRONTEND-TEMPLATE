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

  it('renders the label at 12px medium, not column-header scale', () => {
    // Redline "Label" — 12px/500, not the 10.5px/700 uppercase column-header style.
    const wrapper = mount(StatCard, { props: { label: 'A', value: '1' } })
    expect(wrapper.get('[data-label]').classes()).toContain('text-hint')
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

describe('StatCard — Appendix C conformance', () => {
  it('uses the panel radius and the redlined padding', () => {
    // Redline "Card" — pad 14px 16px, radius 12px, white surface, hairline border.
    const classes = mount(StatCard, { props: { label: 'A', value: '1' } }).classes()
    expect(classes).toContain('rounded-panel')
    expect(classes).toContain('px-4')
    expect(classes).toContain('py-3.5')
    expect(classes).not.toContain('rounded-card')
  })

  it('renders the label at 12px medium, not as an uppercase column header', () => {
    // Redline "Label" — 12px/500.
    const label = mount(StatCard, { props: { label: 'A', value: '1' } }).get('[data-label]')
    expect(label.classes()).toContain('text-hint')
    expect(label.classes()).toContain('font-medium')
    expect(label.classes()).not.toContain('text-column-header')
    expect(label.classes()).not.toContain('uppercase')
  })

  it('renders the hint at 11.5px', () => {
    // Redline "Hint" — 11.5px/400, urgent variant 700 weight.
    const hint = mount(StatCard, { props: { label: 'A', value: '1', hint: 'h' } }).get('[data-hint]')
    expect(hint.classes()).toContain('text-stat-hint')
  })

  it('turns the hint red and bold when urgent', () => {
    const hint = mount(StatCard, {
      props: { label: 'A', value: '1', hint: '2 due within 7 days', urgent: true },
    }).get('[data-hint]')
    expect(hint.classes()).toContain('text-red-700')
    expect(hint.classes()).toContain('font-bold')
  })

  it('mutes the figure colour on a muted card', () => {
    // Redline "Muted card" — muted surface, header-grey figure (data, so AA applies).
    const figure = mount(StatCard, {
      props: { label: 'A', value: '1', muted: true },
    }).get('[data-figure]')
    expect(figure.classes()).toContain('text-text-header')
  })

  it('renders an optional tone dot beside the label', () => {
    // Redline "Label" — dot 8px, gap 7px.
    expect(
      mount(StatCard, { props: { label: 'A', value: '1', dot: 'green' } })
        .find('[data-dot]')
        .exists(),
    ).toBe(true)
    expect(mount(StatCard, { props: { label: 'A', value: '1' } }).find('[data-dot]').exists()).toBe(
      false,
    )
  })
})

describe('StatCard — selected state (Card selected redline)', () => {
  it('is unselected by default: hairline border and card shadow, no green border or ring', () => {
    const classes = mount(StatCard, { props: { label: 'A', value: '1' } }).classes()
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('shadow-card')
    expect(classes).not.toContain('border-green-500')
    expect(classes).not.toContain('statcard--selected')
  })

  it('shows the green border and ring shadow when selected, dropping the hairline/card-shadow pair', () => {
    // Redline "Card selected · 1px green + ring shadow" — border and shadow
    // are one state, never layered alongside the default hairline border
    // and card shadow.
    const classes = mount(StatCard, {
      props: { label: 'A', value: '1', selected: true },
    }).classes()
    expect(classes).toContain('border-green-500')
    expect(classes).toContain('statcard--selected')
    expect(classes).not.toContain('border-hairline')
    expect(classes).not.toContain('shadow-card')
  })

  it('combines selected with muted: green border plus the muted surface', () => {
    const classes = mount(StatCard, {
      props: { label: 'A', value: '1', selected: true, muted: true },
    }).classes()
    expect(classes).toContain('border-green-500')
    expect(classes).toContain('statcard--selected')
    expect(classes).toContain('bg-surface-card-muted')
    expect(classes).not.toContain('border-hairline')
  })
})

describe('Meter — Appendix C conformance', () => {
  it('uses the redlined track fill', () => {
    // Redline "Meter track" — 6px, radius 999px, neutral-100 fill.
    // The track is no longer the component root — a caption may sit above it —
    // so query the progressbar element rather than the wrapper.
    const track = mount(Meter, { props: { value: 50, label: 'A' } }).get('[role="progressbar"]')
    expect(track.classes()).toContain('bg-neutral-100')
    expect(track.classes()).not.toContain('bg-surface-muted')
  })

  it('renders an optional caption', () => {
    // Redline "Meter caption" — 12px/400, value at 700 weight, 7px above.
    const wrapper = mount(Meter, { props: { value: 50, label: 'A', caption: 'Uploaded' } })
    expect(wrapper.text()).toContain('Uploaded')
    expect(wrapper.find('[data-caption]').exists()).toBe(true)
  })

  it('omits the caption element when there is none', () => {
    expect(
      mount(Meter, { props: { value: 50, label: 'A' } }).find('[data-caption]').exists(),
    ).toBe(false)
  })
})
