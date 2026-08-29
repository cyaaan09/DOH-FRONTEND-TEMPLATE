import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Verify & save' } })
    expect(wrapper.text()).toBe('Verify & save')
  })

  it('defaults to a primary button of field height', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('btn--primary')
    expect(wrapper.classes()).toContain('h-field')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('maps each variant to its own token classes', () => {
    expect(mount(Button, { props: { variant: 'secondary' } }).classes()).toContain('border-field')
    expect(mount(Button, { props: { variant: 'destructive' } }).classes()).toContain('text-red-700')
    expect(mount(Button, { props: { variant: 'ghost' } }).classes()).toContain('text-ink-600')
  })

  it('maps each size to a geometry token, never a raw pixel value', () => {
    expect(mount(Button, { props: { size: 'compact' } }).classes()).toContain('h-compact')
    expect(mount(Button, { props: { size: 'touch' } }).classes()).toContain('h-touch')
  })

  it('disables itself and announces busy while busy', () => {
    const wrapper = mount(Button, { props: { busy: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-spinner]').exists()).toBe(true)
  })

  it('has no spinner and no aria-busy when idle', () => {
    const wrapper = mount(Button)
    expect(wrapper.find('[data-spinner]').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('falls back to primary when handed an unknown variant', () => {
    // Guards against a typo silently rendering an unstyled button.
    const wrapper = mount(Button, { props: { variant: 'nonsense' } })
    expect(wrapper.classes()).toContain('btn--primary')
  })

  describe('prop validators', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('warns on an unknown variant but keeps the runtime fallback', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(Button, { props: { variant: 'nonsense' } })
      expect(warn).toHaveBeenCalled()
      expect(wrapper.classes()).toContain('btn--primary')
    })

    it('warns on an unknown size but keeps the runtime fallback', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(Button, { props: { size: 'nonsense' } })
      expect(warn).toHaveBeenCalled()
      expect(wrapper.classes()).toContain('h-field')
    })

    it('does not warn for a known variant or size', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(Button, { props: { variant: 'secondary', size: 'compact' } })
      expect(warn).not.toHaveBeenCalled()
    })
  })
})
