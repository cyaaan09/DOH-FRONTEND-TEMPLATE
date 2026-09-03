import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Chip from '../Chip.vue'
import ChipGroup from '../ChipGroup.vue'
import DismissibleChip from '../DismissibleChip.vue'
import FilterChip from '../FilterChip.vue'

describe('Chip', () => {
  it('renders its slot content', () => {
    expect(mount(Chip, { slots: { default: 'Active' } }).text()).toBe('Active')
  })

  it('defaults to the neutral tone', () => {
    expect(mount(Chip).classes()).toContain('bg-neutral-100')
  })

  it('maps every tone to its own token pair', () => {
    const cases = {
      green: ['bg-green-100', 'text-green-text'],
      amber: ['bg-amber-100', 'text-amber-text'],
      red: ['bg-red-100', 'text-red-700'],
      blue: ['bg-blue-100', 'text-blue-700'],
      violet: ['bg-violet-100', 'text-violet-700'],
    }
    for (const [tone, classes] of Object.entries(cases)) {
      const wrapper = mount(Chip, { props: { tone } })
      for (const cls of classes) {
        expect(wrapper.classes(), `tone=${tone}`).toContain(cls)
      }
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Chip, { props: { tone: 'nonsense' } }).classes()).toContain('bg-neutral-100')
  })

  it('renders a decorative dot only when asked', () => {
    expect(
      mount(Chip, { props: { dot: true } })
        .find('[data-dot]')
        .exists(),
    ).toBe(true)
    expect(mount(Chip).find('[data-dot]').exists()).toBe(false)
  })

  it('hides the dot from assistive tech', () => {
    const dot = mount(Chip, { props: { dot: true } }).find('[data-dot]')
    expect(dot.attributes('aria-hidden')).toBe('true')
  })

  describe('prop validator', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('warns on an unknown tone but keeps the runtime fallback', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(Chip, { props: { tone: 'nonsense' } })
      expect(warn).toHaveBeenCalled()
      expect(wrapper.classes()).toContain('bg-neutral-100')
    })

    it('does not warn for a known tone', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(Chip, { props: { tone: 'green' } })
      expect(warn).not.toHaveBeenCalled()
    })
  })
})

describe('ChipGroup', () => {
  it('renders its chips in a gapped row', () => {
    const wrapper = mount(ChipGroup, {
      slots: { default: '<span class="chip-stub" />' },
    })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.find('.chip-stub').exists()).toBe(true)
  })
})

describe('DismissibleChip', () => {
  it('shows the key and value', () => {
    const wrapper = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    })
    expect(wrapper.text()).toContain('Status:')
    expect(wrapper.text()).toContain('Active')
  })

  it('emits dismiss with both its key and value when the remove button is pressed', async () => {
    // A payload of just the value is ambiguous when two chips share a value
    // under different keys — the key must travel with it.
    const wrapper = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('dismiss')).toEqual([[{ chipKey: 'Status:', value: 'Active' }]])
  })

  it('labels the remove button for screen readers', () => {
    const wrapper = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Remove Status: Active')
  })
})

describe('Chip — Appendix C conformance', () => {
  it('uses the accessible neutral text colour', () => {
    // Redline "Closed" — text-text-header, not the ink-500/text-meta colour
    // that fails AA.
    const classes = mount(Chip, { props: { tone: 'neutral' } }).classes()
    expect(classes).toContain('text-text-header')
    expect(classes).not.toContain('text-ink-600')
  })

  it('supports a filled variant', () => {
    // Redline "Active (filled)" — green-fill bg, green-on-fill text, 6.01:1.
    // States no weight, so it keeps the chip family's bundled 700 from
    // text-chip rather than inventing one.
    const classes = mount(Chip, { props: { variant: 'filled' } }).classes()
    expect(classes).toContain('bg-green-fill')
    expect(classes).toContain('text-green-on-fill')
    expect(classes).toContain('text-chip')
  })

  it('supports a service variant', () => {
    // Redline "Service chip" — 12px/400, 5px 12px padding, white surface,
    // border-soft, ink-600 text. text-hint bundles the 400 weight itself, so
    // this also confirms no stray text-chip (bundled 700) leaked in.
    const classes = mount(Chip, { props: { variant: 'service' } }).classes()
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-soft')
    expect(classes).toContain('text-ink-600')
    expect(classes).toContain('text-hint')
    expect(classes).not.toContain('text-chip')
  })

  it('falls back to the tint variant for an unknown value', () => {
    expect(mount(Chip, { props: { variant: 'nonsense' } }).classes()).toContain('bg-neutral-100')
  })
})

describe('FilterChip', () => {
  it('renders unselected by default', () => {
    // Redline "Filter chip off" — white surface, border-field, ink-600 text.
    const classes = mount(FilterChip, { slots: { default: 'Hospital' } }).classes()
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-field')
    expect(classes).toContain('text-ink-600')
  })

  it('fills green when selected', () => {
    // Redline "Filter chip on" — green-fill bg, green-on-fill text, 7px 13px, shadow.
    const classes = mount(FilterChip, { props: { selected: true } }).classes()
    expect(classes).toContain('bg-green-fill')
    expect(classes).toContain('text-green-on-fill')
  })

  it('is a real button and emits toggle when pressed', async () => {
    const wrapper = mount(FilterChip, { slots: { default: 'Hospital' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    await wrapper.trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('reports its selected state to assistive tech', () => {
    expect(mount(FilterChip, { props: { selected: true } }).attributes('aria-pressed')).toBe('true')
    expect(mount(FilterChip).attributes('aria-pressed')).toBe('false')
  })

  it('renders the unselected/selected weight asymmetry the redline states', () => {
    // Redline "Filter chip off" states weight 500 explicitly, so font-medium
    // overrides text-chip's bundled 700. "Filter chip on" states no weight,
    // so it is left at the bundled 700 rather than having one invented for
    // it — the asymmetry is intentional, not a missed case.
    const off = mount(FilterChip, { slots: { default: 'Hospital' } }).classes()
    expect(off).toContain('font-medium')

    const on = mount(FilterChip, { props: { selected: true } }).classes()
    expect(on).not.toContain('font-medium')
  })
})

describe('DismissibleChip — Appendix C conformance', () => {
  it('gives the dismiss button a filled 17px circle', () => {
    // Redline "Dismiss ×" — a filled 17px circle, not a bare glyph.
    const button = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    }).get('button')
    expect(button.classes()).toContain('chip__remove')
  })

  it('renders a quiet count badge distinct from the neutral tone', () => {
    // Appendix D.1's COUNT & OVERFLOW set — a count that is not work waiting
    // on you recedes onto --surface-muted in --text-meta. The `neutral` tone
    // is a full step darker in both and reads as a status chip, so the two
    // must not resolve to the same classes.
    const count = [...mount(Chip, { props: { variant: 'count' } }).element.classList]
    expect(count).toContain('bg-surface-muted')
    expect(count).toContain('text-text-meta')
    expect(count).toContain('text-chip')

    const neutral = [...mount(Chip, { props: { tone: 'neutral' } }).element.classList]
    expect(neutral).toContain('bg-neutral-100')
    expect(neutral).not.toContain('bg-surface-muted')
  })

  it('keeps a filter chip the same size selected and unselected', () => {
    // Both states carry a 1px border in the artifact. Only the unselected
    // one did, so a chip lost 2px in each dimension the moment it was picked
    // and the whole row reflowed. No wrong value was needed for this — just
    // a missing one, which is why no colour assertion caught it.
    const on = [...mount(FilterChip, { props: { selected: true } }).element.classList]
    const off = [...mount(FilterChip, { props: { selected: false } }).element.classList]
    expect(on).toContain('border')
    expect(off).toContain('border')
    expect(on).toContain('border-green-fill')
    expect(off).toContain('border-field')
  })

  it('gives a filter chip the mark glyph, dressed per state', () => {
    // Redline "Filter chip" — a 13px checkbox-style mark ahead of the label.
    const on = mount(FilterChip, { props: { selected: true } }).get('[data-mark]')
    const off = mount(FilterChip, { props: { selected: false } }).get('[data-mark]')
    expect(on.classes()).toContain('filter-chip__mark--on')
    expect(off.classes()).toContain('filter-chip__mark--off')
    expect(on.attributes('aria-hidden')).toBe('true')
  })
})
