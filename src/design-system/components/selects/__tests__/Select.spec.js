import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { SelectRoot } from '@ark-ui/vue/select'
import Select from '../Select.vue'
import { installArkJsdomShims, resetMountedDom } from '@/design-system/testing/ark-jsdom'

// ResizeObserver and Element.scrollTo: jsdom implements neither, and Zag's
// select machine calls both during ordinary interaction. See ark-jsdom.js
// for the full explanation (verified against the installed @zag-js/select
// and @zag-js/popper source) — shared here because MultiSelect needs the
// identical shim.
installArkJsdomShims()

// Properly unmounts every wrapper through Vue's own lifecycle after each
// test. See ark-jsdom.js's resetMountedDom docblock: wrapper.unmount() is
// what actually stops a still-open Select's Zag machine actor, including
// any document-level listeners it attached — the blunter reset below
// cannot do that on its own, since it only deletes DOM nodes.
enableAutoUnmount(afterEach)

const OPTIONS = [
  'Hospital · Level 1',
  'Hospital · Level 2',
  'Infirmary',
  'Primary Care Facility',
  'Birthing Home',
  'Clinical Laboratory',
  'X-ray Facility',
]

const mountSelect = (props = {}) =>
  mount(Select, {
    props: {
      options: OPTIONS,
      modelValue: '',
      placeholder: 'Select a facility type',
      label: 'Facility type',
      ...props,
    },
    attachTo: document.body,
  })

// SelectContent renders as an ordinary descendant of the mounted component,
// not into a document.body portal (see ark-jsdom.js), gated by a presence
// machine rather than by open/closed state. enableAutoUnmount above already
// unmounts every wrapper, which removes this subtree too; this reset is a
// backstop for document-level queries — most tests here never call
// wrapper.unmount() themselves mid-test, and without either cleanup an
// `it('opens on click...')` run right after another mount would see 14
// `[role="option"]` nodes, not 7.
afterEach(resetMountedDom)

describe('Select', () => {
  it('shows the placeholder while nothing is chosen', () => {
    const wrapper = mountSelect()
    expect(wrapper.get('[data-value]').text()).toBe('Select a facility type')
  })

  it('greys the placeholder and inks a real value', () => {
    // Redline "Placeholder" (13.5/400 meta) vs "Value" (13.5/500 ink).
    // Both branches set colour AND weight, so neither is left to emit order.
    const empty = mountSelect().get('[data-value]')
    expect(empty.classes()).toContain('text-ink-500')
    expect(empty.classes()).not.toContain('text-ink-900')

    const filled = mountSelect({ modelValue: 'Infirmary' }).get('[data-value]')
    expect(filled.text()).toBe('Infirmary')
    expect(filled.classes()).toContain('text-ink-900')
    expect(filled.classes()).toContain('font-medium')
    expect(filled.classes()).not.toContain('text-ink-500')
  })

  it('names the control for assistive technology without drawing the name', () => {
    const wrapper = mountSelect()
    expect(wrapper.get('[data-trigger]').attributes('aria-label')).toBe('Facility type')
    expect(wrapper.text()).not.toContain('Facility type')
  })

  it('gives the trigger the field shell and the field border', () => {
    // Redline "Trigger" — radius 9px, 1px field border. `border-field` is the
    // bridge's name for it; `border-border-field` emits nothing.
    const trigger = mountSelect().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-field')
    expect(trigger.classes()).toContain('border-field')
    // Appendix D calls this section "the same 38px shell as a text field" —
    // `h-field` is the token TextField itself uses for that height, and
    // without this assertion the utility could be dropped silently, same as
    // the checkmark/tint gap on the selected-option test below.
    expect(trigger.classes()).toContain('h-field')
  })

  it("sets the panel gutter to the redlined 6px, not Zag's 8px default", () => {
    // Redline "Panel" — top 44px against a 38px trigger, so a 6px gutter.
    // jsdom computes no layout, so the rendered offset is not assertable —
    // but the prop that produces it is. sameWidth: true is asserted here
    // too — it's the same positioning object — and makes the panel match
    // the trigger's width instead of its longest option's; see
    // Select.vue's comment at the positioning prop for the full reasoning.
    const wrapper = mountSelect()
    expect(wrapper.findComponent(SelectRoot).props('positioning')).toEqual({
      gutter: 6,
      sameWidth: true,
    })
  })

  it('renders a decorative caret that assistive technology ignores', () => {
    // Redline "Caret · decorative"
    const caret = mountSelect().get('[data-caret]')
    expect(caret.attributes('aria-hidden')).toBe('true')
    expect(caret.classes()).toContain('text-ink-300')
  })

  it('opens on click and lists every option', async () => {
    const wrapper = mountSelect()
    await wrapper.get('[data-trigger]').trigger('click')
    const items = document.querySelectorAll('[role="option"]')
    expect(items).toHaveLength(7)
    expect(items[0].textContent).toContain('Hospital · Level 1')
    wrapper.unmount()
  })

  it('emits update:modelValue with the chosen option', async () => {
    const wrapper = mountSelect()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[role="option"]')[2].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Infirmary'])
    wrapper.unmount()
  })

  it('marks the chosen option selected', async () => {
    const wrapper = mountSelect({ modelValue: 'Infirmary' })
    await wrapper.get('[data-trigger]').trigger('click')
    const items = [...document.querySelectorAll('[role="option"]')]
    expect(items[2].getAttribute('aria-selected')).toBe('true')
    expect(items[0].getAttribute('aria-selected')).toBe('false')

    // Redline "Option selected" — #F2FAF4 bg, #15803D/700 text, ✓ 12px. Ark
    // drives aria-selected off its own internal state regardless of these
    // classes, so the two checks above would keep passing even if the tint,
    // text colour and checkmark were deleted entirely — the same shape as
    // the prior marker-width gap (colour asserted, width not, so the width
    // utility could vanish silently). Assert the visual redline directly.
    expect(items[2].classList.contains('bg-green-tint')).toBe(true)
    expect(items[2].classList.contains('text-green-text')).toBe(true)
    expect(items[0].classList.contains('bg-green-tint')).toBe(false)
    expect(items[2].textContent).toContain('✓')
    expect(items[0].textContent).not.toContain('✓')

    wrapper.unmount()
  })
})
