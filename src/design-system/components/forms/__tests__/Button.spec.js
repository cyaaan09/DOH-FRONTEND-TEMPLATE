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
    // Driven from the `disabled` prop directly (not a `disabled:` variant) so
    // it does not also fire for a busy-but-not-disabled button — see the
    // "Pending state" tests below for why that distinction matters.
    const classes = mount(Button, { props: { disabled: true } }).classes()
    expect(classes).toContain('border')
    expect(classes).toContain('bg-surface-input')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('text-ink-200')
    expect(classes).not.toContain('disabled:opacity-60')
    expect(classes).not.toContain('btn--busy')
  })

  describe('Disabled overrides every variant, not just the default', () => {
    // The bug this guards: stateClass used to APPEND the disabled colours
    // alongside the variant's own, so the winner depended on Tailwind's
    // compile order rather than the code. That only happened to render
    // correctly for primary and ghost — a disabled secondary button kept
    // its dark text, and a disabled destructive button kept its red text
    // and border. Asserting only the disabled classes (as the pre-existing
    // "gives disabled its own surface..." test above does, for the default
    // variant alone) would not have caught that: the negative assertions
    // below — that the variant's own colour classes are gone — are the
    // actual regression check.
    const VARIANT_OWN_COLOR_CLASSES = {
      primary: ['bg-green-fill', 'text-green-on-fill'],
      secondary: ['text-ink-700', 'border-field', 'hover:bg-surface-muted'],
      destructive: ['text-red-700', 'border-red-border-btn', 'hover:bg-red-50'],
      ghost: ['text-green-text', 'hover:bg-green-tint'],
    }

    it.each(Object.keys(VARIANT_OWN_COLOR_CLASSES))(
      'gives disabled %s the disabled surface/border/text and drops its own colours',
      (variant) => {
        const classes = mount(Button, { props: { variant, disabled: true } }).classes()

        expect(classes).toContain('bg-surface-input')
        expect(classes).toContain('border-hairline')
        expect(classes).toContain('text-ink-200')

        for (const ownClass of VARIANT_OWN_COLOR_CLASSES[variant]) {
          expect(classes).not.toContain(ownClass)
        }
      },
    )
  })

  describe('Pending state (busy) must not collapse into Disabled', () => {
    // The native `disabled` attribute is set for two different reasons —
    // the `disabled` prop and the `busy` prop — but redline "Pending" and
    // redline "Disabled" are two different looks. A busy primary button
    // must stay on the primary-hover green, not fall back to the Disabled
    // row's grey surface/border/text.
    it('keeps its green fill while busy and does not take on the disabled look', () => {
      const classes = mount(Button, { props: { busy: true } }).classes()
      expect(classes).toContain('bg-green-fill')
      expect(classes).toContain('btn--busy')
      expect(classes).not.toContain('bg-surface-input')
      expect(classes).not.toContain('border-hairline')
      expect(classes).not.toContain('text-ink-200')
    })

    it('stays non-interactive while busy: disabled attribute and aria-busy are unchanged', () => {
      const wrapper = mount(Button, { props: { busy: true } })
      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.attributes('aria-busy')).toBe('true')
    })

    it('still gives a disabled-only button the full Disabled row appearance', () => {
      const classes = mount(Button, { props: { disabled: true } }).classes()
      expect(classes).toContain('bg-surface-input')
      expect(classes).toContain('border-hairline')
      expect(classes).toContain('text-ink-200')
      expect(classes).not.toContain('btn--busy')
    })

    it('prioritises the Pending look when both disabled and busy are set', () => {
      // Implementation choice: busy wins. A caller setting both is asking
      // for a submit-in-flight button, which is the busy case; disabled is
      // implied by busy already forcing the native attribute.
      const wrapper = mount(Button, { props: { disabled: true, busy: true } })
      const classes = wrapper.classes()
      expect(classes).toContain('btn--busy')
      expect(classes).not.toContain('bg-surface-input')
      expect(classes).not.toContain('text-ink-200')
      expect(wrapper.attributes('disabled')).toBeDefined()
    })
  })
})
