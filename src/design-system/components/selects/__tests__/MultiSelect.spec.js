import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { SelectRoot } from '@ark-ui/vue/select'
import MultiSelect from '../MultiSelect.vue'
import { installArkJsdomShims, resetMountedDom } from '@/design-system/testing/ark-jsdom'

// ResizeObserver and Element.scrollTo: jsdom implements neither, and Zag's
// select machine calls both during ordinary interaction. See ark-jsdom.js
// for the full explanation, verified against the installed @zag-js/select
// and @zag-js/popper source.
installArkJsdomShims()

// Properly unmounts every wrapper through Vue's own lifecycle after each
// test. See ark-jsdom.js's resetMountedDom docblock: wrapper.unmount() is
// what actually stops a still-open MultiSelect's Zag machine actor,
// including any document-level listeners it attached — the blunter reset
// below cannot do that on its own, since it only deletes DOM nodes.
enableAutoUnmount(afterEach)

const SERVICES = [
  'Ambulance Service — Type I',
  'Birthing Home',
  'Clinical Laboratory — Limited',
  'Clinical Laboratory — Secondary',
  'Dental Clinic',
  'Pharmacy',
  'X-ray Facility',
]

const mountMulti = (props = {}) =>
  mount(MultiSelect, {
    props: {
      options: SERVICES,
      modelValue: ['Pharmacy', 'Birthing Home'],
      placeholder: 'Select services',
      label: 'Services',
      filterPlaceholder: 'Filter services',
      emptyText: 'No service matches that.',
      ...props,
    },
    attachTo: document.body,
  })

// SelectContent renders as an ordinary descendant of the mounted component,
// not into a document.body portal (see ark-jsdom.js), gated by a presence
// machine rather than by open/closed state. Most tests below call
// wrapper.unmount() themselves, and enableAutoUnmount above covers the
// rest — this reset stays as a defensive backstop so a test that forgets
// to, or a future one added here, still can't leak into the next.
afterEach(resetMountedDom)

describe('MultiSelect', () => {
  it('summarises the chosen options in the trigger', () => {
    expect(mountMulti().get('[data-value]').text()).toContain('2')
  })

  it('falls back to the placeholder when nothing is chosen', () => {
    const wrapper = mountMulti({ modelValue: [] })
    expect(wrapper.get('[data-value]').text()).toBe('Select services')
    expect(wrapper.get('[data-value]').classes()).toContain('text-ink-500')
  })

  it('inks and bolds the value once something is chosen', () => {
    // Redline "Value" (13.5/500 ink) vs "Placeholder" (13.5/400 meta) — the
    // test above covers the empty branch's colour; this covers the other
    // branch, so an edit that drops font-medium/text-ink-900 from the
    // "chosen" class expression cannot pass silently.
    const value = mountMulti().get('[data-value]')
    expect(value.classes()).toContain('text-ink-900')
    expect(value.classes()).toContain('font-medium')
    expect(value.classes()).not.toContain('text-ink-500')
  })

  it('gives the trigger the field shell and the field border', () => {
    // Redline "Trigger" — radius 9px, 1px field border, same 38px shell as a
    // text field. `border-field` is the bridge's name for `--border-field`;
    // `border-border-field` would emit no CSS while still appearing here.
    const trigger = mountMulti().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-field')
    expect(trigger.classes()).toContain('border-field')
    expect(trigger.classes()).toContain('h-field')
  })

  it('renders a decorative caret that assistive technology ignores', () => {
    // Redline "Caret · decorative" — 9px, ink-300, hidden from the name.
    const caret = mountMulti().get('[data-caret]')
    expect(caret.attributes('aria-hidden')).toBe('true')
    expect(caret.classes()).toContain('text-ink-300')
  })

  it("sets the panel gutter to the redlined 6px, not Zag's 8px default, and matches the trigger's width", () => {
    // Redline "Panel" — top 44px against a 38px trigger, so a 6px gutter.
    // jsdom computes no layout, so the rendered offset is not assertable —
    // but the prop that produces it is. sameWidth: true is asserted here
    // too: it makes the panel match the trigger's own width instead of its
    // longest option's — see MultiSelect.vue's comment at the positioning
    // prop for the full reasoning. Mirrors Select.spec.js's assertion; this
    // one did not previously exist, leaving the positioning prop unguarded.
    const wrapper = mountMulti()
    expect(wrapper.findComponent(SelectRoot).props('positioning')).toEqual({
      gutter: 6,
      sameWidth: true,
    })
  })

  it('renders a checkbox per option and checks the chosen ones', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const boxes = [...document.querySelectorAll('[data-box]')]
    expect(boxes).toHaveLength(7)
    // Redline "Checkbox in list" — filled green when on, plain border when off.
    // The "on" assertion below uses classList, not .className: .className is
    // a plain string, and toContain() on a string is substring matching, not
    // token matching — 'border-border-field'.includes('border-field') and
    // 'bg-green-fill-hover'.includes('bg-green-fill') are both true (the
    // latter a real bridged token in this codebase), so a string-based
    // positive assertion would keep passing even if the component regressed
    // to exactly the trap it exists to catch. The "off" assertion right
    // after it is negative (not.toContain): substring matching only weakens
    // a positive containment check, so string-based stays fine there.
    expect([...boxes[1].classList]).toContain('bg-green-fill')
    expect(boxes[0].className).not.toContain('bg-green-fill')
    // The colour above is only half the redline ("white ✓"): the glyph is
    // drawn unconditionally in the template, so its visibility rides
    // entirely on text colour. Without asserting these too, text-green-on-fill
    // could be deleted and every assertion above would still pass, leaving
    // an invisible checkmark on the "on" box — the same shape as the
    // colour-asserted/width-not gap this suite's own history warns about.
    expect([...boxes[1].classList]).toContain('border-green-fill')
    expect([...boxes[1].classList]).toContain('text-green-on-fill')
    expect([...boxes[0].classList]).toContain('border-field')
    expect([...boxes[0].classList]).toContain('text-transparent')
    wrapper.unmount()
  })

  it('filters the list as the filter field is typed into', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const filter = document.querySelector('[data-filter]')
    filter.value = 'labor'
    filter.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    const labels = [...document.querySelectorAll('[data-option-label]')].map((n) => n.textContent)
    expect(labels).toEqual([
      'Clinical Laboratory — Limited',
      'Clinical Laboratory — Secondary',
    ])
    wrapper.unmount()
  })

  it('shows the empty text when the filter matches nothing', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const filter = document.querySelector('[data-filter]')
    filter.value = 'zzzz'
    filter.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('[data-empty]').textContent).toBe('No service matches that.')
    expect(document.querySelectorAll('[data-option-label]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('toggles an option on and off', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[data-option]')[4].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toContain('Dental Clinic')
    wrapper.unmount()
  })

  it('clears every choice from the footer', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelector('[data-clear]').click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual([])
    wrapper.unmount()
  })

  it('emits apply from the footer', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelector('[data-apply]').click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('apply')).toBeTruthy()
    wrapper.unmount()
  })

  it('dresses the footer as a sunken strip under a rule', async () => {
    // Redline "Panel footer" — sunken background, 1px top divider. classList,
    // not .className — see the checkbox test above for why a string-based
    // toContain() would be a substring match, not a token match.
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const footer = document.querySelector('[data-footer]')
    expect([...footer.classList]).toContain('bg-surface-sunken')
    expect([...footer.classList]).toContain('border-divider')
    wrapper.unmount()
  })

  it('styles Clear as borderless ink-500 and Apply as the fill green', async () => {
    // Appendix D.1 — Clear is "borderless, transparent, 12.5/700 #667085";
    // Apply is "#177236 on #FFF, 12.5/700". Only the click behaviour of
    // these buttons is exercised above; the redlined appearance needs its
    // own assertion or the fill/ink classes could be dropped unnoticed.
    // classList, not .className — see the checkbox test above.
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const clear = document.querySelector('[data-clear]')
    const apply = document.querySelector('[data-apply]')
    expect([...clear.classList]).toContain('text-ink-500')
    expect([...apply.classList]).toContain('bg-green-fill')
    expect([...apply.classList]).toContain('text-green-on-fill')
    wrapper.unmount()
  })

  it('names the control without drawing the name', () => {
    const wrapper = mountMulti()
    expect(wrapper.get('[data-trigger]').attributes('aria-label')).toBe('Services')
    expect(wrapper.text()).not.toContain('Services')
  })

  it('keeps Enter and Space from being swallowed by the panel on the footer buttons', async () => {
    // WCAG 2.1.1 (Level A) fix. Zag's content-level keydown handler
    // (select.connect.mjs, getContentProps().onKeyDown) intercepts Enter and
    // Space for ANY descendant of the panel and calls preventDefault before
    // the isEditableElement escape hatch is reached — that escape hatch only
    // protects the filter input's typeahead, never these buttons' own native
    // activation. Without @keydown.enter.stop/@keydown.space.stop, a keyboard
    // user could Tab to Clear/Apply but never activate them.
    //
    // jsdom does not synthesize a 'click' from a keyboard activation the way
    // a real browser does (confirmed empirically: dispatching a real
    // Enter/Space keydown at a bare <button> here never fires a 'click'
    // listener), so `wrapper.emitted('apply')` can't be the assertion — it
    // would never fire in this environment even with a correct fix. The
    // observable, mutation-testable stand-in is whether the dispatched
    // keydown's default action is still prevented once it finishes
    // propagating: false is the exact condition a real browser requires
    // before it will run the button's native Enter/Space activation.
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')

    const clear = document.querySelector('[data-clear]')
    const clearEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    clear.dispatchEvent(clearEnter)
    expect(clearEnter.defaultPrevented).toBe(false)

    const clearSpace = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    clear.dispatchEvent(clearSpace)
    expect(clearSpace.defaultPrevented).toBe(false)

    const apply = document.querySelector('[data-apply]')
    const applyEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    apply.dispatchEvent(applyEnter)
    expect(applyEnter.defaultPrevented).toBe(false)

    const applySpace = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    apply.dispatchEvent(applySpace)
    expect(applySpace.defaultPrevented).toBe(false)

    wrapper.unmount()
  })
})
