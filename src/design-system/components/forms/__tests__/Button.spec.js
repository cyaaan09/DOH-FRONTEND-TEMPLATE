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
    expect(mount(Button, { props: { variant: 'ghost' } }).classes()).toContain('text-green-text')
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

describe('Button — Appendix C conformance', () => {
  it('sets label weight to 700, not 500', () => {
    // Redline "Default · 38px · pad 0 16px · radius 9px · 13.5px / 700"
    const classes = mount(Button).classes()
    expect(classes).toContain('font-bold')
    expect(classes).not.toContain('font-medium')
  })

  it('gives compact its own padding, radius and size', () => {
    // Redline "Compact · 34px · pad 0 14px · radius 8px · 12.5px"
    const classes = mount(Button, { props: { size: 'compact' } }).classes()
    expect(classes).toContain('h-compact')
    expect(classes).toContain('px-3.5')
    expect(classes).toContain('rounded-control')
    expect(classes).toContain('text-field-label')
    expect(classes).not.toContain('rounded-field')
  })

  it('supports a square icon-only size', () => {
    // Redline "Icon only · 34×34px · radius 8px"
    const classes = mount(Button, { props: { size: 'icon' } }).classes()
    expect(classes).toContain('h-compact')
    expect(classes).toContain('w-compact')
    expect(classes).toContain('rounded-control')
  })

  it('fills primary with the flat green, not the gradient', () => {
    // Redline "Primary · #177236 bg · #FFF text · shadow 0 1px 2px rgba(20,80,40,.25)"
    expect(mount(Button).classes()).toContain('bg-green-fill')
  })

  it('colours ghost green on a green tint, not grey', () => {
    // Redline "Ghost · transparent · #15803D / 700 · hover #F2FAF4"
    const classes = mount(Button, { props: { variant: 'ghost' } }).classes()
    expect(classes).toContain('text-green-text')
    expect(classes).toContain('hover:bg-green-tint')
    expect(classes).not.toContain('text-ink-600')
  })

  it('gives disabled its own surface, border and text rather than opacity', () => {
    // Redline "Disabled · #F7F9FC bg · 1px #E4E8EF · #B9C1D1"
    const classes = mount(Button, { props: { disabled: true } }).classes()
    expect(classes).toContain('disabled:border')
    expect(classes).toContain('disabled:bg-surface-input')
    expect(classes).toContain('disabled:border-hairline')
    expect(classes).toContain('disabled:text-ink-200')
    expect(classes).not.toContain('disabled:opacity-60')
  })
})
