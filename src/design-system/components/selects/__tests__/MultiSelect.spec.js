import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import MultiSelect from '../MultiSelect.vue'
import { installArkJsdomShims, resetArkPortals } from '@/design-system/testing/ark-jsdom'

// ResizeObserver and Element.scrollTo: jsdom implements neither, and Zag's
// select machine calls both during ordinary interaction. See ark-jsdom.js
// for the full explanation, verified against the installed @zag-js/select
// and @zag-js/popper source.
installArkJsdomShims()

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

// Ark mounts SelectContent's portal into document.body gated by a presence
// machine rather than by open/closed state (see ark-jsdom.js). Most tests
// below call wrapper.unmount() themselves, but reset defensively so a test
// that forgets to, or a future one added here, can't leak into the next.
afterEach(resetArkPortals)

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

  it('renders a checkbox per option and checks the chosen ones', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const boxes = [...document.querySelectorAll('[data-box]')]
    expect(boxes).toHaveLength(7)
    // Redline "Checkbox in list" — filled green when on, plain border when off.
    expect(boxes[1].className).toContain('bg-green-fill')
    expect(boxes[0].className).not.toContain('bg-green-fill')
    // The colour above is only half the redline ("white ✓"): the glyph is
    // drawn unconditionally in the template, so its visibility rides
    // entirely on text colour. Without asserting these too, text-green-on-fill
    // could be deleted and every assertion above would still pass, leaving
    // an invisible checkmark on the "on" box — the same shape as the
    // colour-asserted/width-not gap this suite's own history warns about.
    expect(boxes[1].className).toContain('border-green-fill')
    expect(boxes[1].className).toContain('text-green-on-fill')
    expect(boxes[0].className).toContain('border-field')
    expect(boxes[0].className).toContain('text-transparent')
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
    // Redline "Panel footer" — sunken background, 1px top divider.
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const footer = document.querySelector('[data-footer]')
    expect(footer.className).toContain('bg-surface-sunken')
    expect(footer.className).toContain('border-divider')
    wrapper.unmount()
  })

  it('styles Clear as borderless ink-500 and Apply as the fill green', async () => {
    // Appendix D.1 — Clear is "borderless, transparent, 12.5/700 #667085";
    // Apply is "#177236 on #FFF, 12.5/700". Only the click behaviour of
    // these buttons is exercised above; the redlined appearance needs its
    // own assertion or the fill/ink classes could be dropped unnoticed.
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const clear = document.querySelector('[data-clear]')
    const apply = document.querySelector('[data-apply]')
    expect(clear.className).toContain('text-ink-500')
    expect(apply.className).toContain('bg-green-fill')
    expect(apply.className).toContain('text-green-on-fill')
    wrapper.unmount()
  })

  it('names the control without drawing the name', () => {
    const wrapper = mountMulti()
    expect(wrapper.get('[data-trigger]').attributes('aria-label')).toBe('Services')
    expect(wrapper.text()).not.toContain('Services')
  })
})
