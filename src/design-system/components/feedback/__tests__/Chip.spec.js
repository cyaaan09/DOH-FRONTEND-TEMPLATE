import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Chip from '../Chip.vue'
import ChipGroup from '../ChipGroup.vue'
import DismissibleChip from '../DismissibleChip.vue'

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
    expect(mount(Chip, { props: { dot: true } }).find('[data-dot]').exists()).toBe(true)
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
