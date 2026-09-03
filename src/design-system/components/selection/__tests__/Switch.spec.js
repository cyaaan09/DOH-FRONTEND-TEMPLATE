import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import Switch from '../Switch.vue'

const mountSwitch = (props = {}) =>
  mount(Switch, { props: { modelValue: false, label: 'Email me on returns', ...props } })

describe('Switch', () => {
  it('renders its label and hint', () => {
    const wrapper = mountSwitch({ hint: 'Digest at 6 PM, weekdays only' })
    expect(wrapper.text()).toContain('Email me on returns')
    expect(wrapper.text()).toContain('Digest at 6 PM, weekdays only')
  })

  it('greens the track when on and greys it when off', () => {
    // Redline "Track on / off" — the off colour is the field border token,
    // which the bridge exposes as `bg-field`; `bg-border-field` emits nothing.
    expect(mountSwitch({ modelValue: true }).get('[data-track]').classes()).toContain(
      'bg-green-fill',
    )
    const off = mountSwitch().get('[data-track]')
    expect(off.classes()).toContain('bg-field')
    expect(off.classes()).not.toContain('bg-green-fill')
  })

  it('greys the track differently when disabled', () => {
    // Redline "Track on / off" — disabled is its own colour, not the off colour.
    const track = mountSwitch({ disabled: true, modelValue: true }).get('[data-track]')
    expect(track.classes()).toContain('bg-ink-100')
    expect(track.classes()).not.toContain('bg-green-fill')
    expect(track.classes()).not.toContain('bg-field')
  })

  it('rounds the track fully and keeps the knob on the surface colour', () => {
    // Redlines "Switch track" and "Knob". The knob is a surface, not a label
    // on green — the two whites diverge in dark mode.
    const wrapper = mountSwitch()
    expect(wrapper.get('[data-track]').classes()).toContain('rounded-pill')
    const knob = wrapper.get('[data-knob]')
    expect(knob.classes()).toContain('bg-surface')
    expect(knob.classes()).toContain('rounded-pill')
  })

  it('exposes its state through the native input', () => {
    // Verified against @zag-js/switch: `role` appears NOWHERE in that
    // package's own output (see the dedicated "announces as a switch" test
    // below for the role Switch.vue adds itself), and getHiddenInputProps
    // renders a plain <input type="checkbox"> with defaultChecked and no
    // aria-checked. State therefore lives on the input's own `checked` IDL
    // property, exactly as it does for Checkbox.
    const input = mountSwitch({ modelValue: true }).get('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)
    expect(mountSwitch().get('input[type="checkbox"]').element.checked).toBe(false)
  })

  it('announces as a switch, not a checkbox', () => {
    // Redline "Switch" (ARIA & semantics) — role=switch aria-checked, not a
    // checkbox. Ark never sets a role on this input (see the test above) —
    // role="switch" is added directly in Switch.vue's template and reaches
    // the real input through the same consumer-attrs-fallthrough path
    // Checkbox.vue's :indeterminate binding proves. With native checked
    // already wired (test above), the native `checked` IDL property maps
    // to aria-checked automatically once role=switch is present — ARIA-in-
    // HTML explicitly permits role="switch" on input[type=checkbox].
    const input = mountSwitch().get('input[type="checkbox"]')
    expect(input.attributes('role')).toBe('switch')
  })

  it('associates the hint with the input via aria-describedby', () => {
    // Redline "Fields" (ARIA & semantics) — hint via aria-describedby. Same
    // reason as Checkbox.spec.js's identical test: the hidden input's own
    // aria-labelledby wins over the wrapping <label> for the accessible
    // NAME, so the hint needs its own wire into the description.
    const wrapper = mountSwitch({ hint: 'Digest at 6 PM, weekdays only' })
    const input = wrapper.get('input[type="checkbox"]')
    const describedbyId = input.attributes('aria-describedby')
    expect(describedbyId).toBeTruthy()
    expect(wrapper.get(`[id="${describedbyId}"]`).text()).toBe('Digest at 6 PM, weekdays only')
  })

  it('omits aria-describedby when there is no hint', () => {
    expect(
      mountSwitch().get('input[type="checkbox"]').attributes('aria-describedby'),
    ).toBeUndefined()
  })

  it('marks the track focus-visible for keyboard focus, not a mouse click', async () => {
    // Redline "Focus ring" — :focus-visible -> border/ring, never on a mouse
    // click. Same mechanism and same reason this needs a real focus() on an
    // attached element as Checkbox.spec.js's identical test — see the
    // comment there.
    const wrapper = mount(Switch, {
      props: { modelValue: false, label: 'Email me on returns' },
      attachTo: document.body,
    })
    const input = wrapper.get('input[type="checkbox"]')
    const track = () => wrapper.get('[data-track]')

    try {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      input.element.focus()
      await nextTick()
      expect(track().attributes('data-focus-visible')).toBeUndefined()
      input.element.blur()
      await nextTick()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      input.element.focus()
      await nextTick()
      expect(track().attributes('data-focus-visible')).toBe('')
    } finally {
      wrapper.unmount()
    }
  })

  it('emits update:modelValue when toggled, and not when disabled', async () => {
    const on = mountSwitch()
    await on.get('input[type="checkbox"]').trigger('click')
    expect(on.emitted('update:modelValue')?.[0]).toEqual([true])

    const off = mountSwitch({ disabled: true })
    await off.get('input[type="checkbox"]').trigger('click')
    expect(off.emitted('update:modelValue')).toBeUndefined()
  })

  it('puts the label before the track in DOM order', () => {
    // Appendix D.1 — the artifact's own footnote under this sub-block states
    // the rule: "Switch sits right of its label". It was built control-first
    // (mirroring Checkbox and Radio), which inverts the row, and every
    // existing assertion above still passed because none of them looks at
    // order. compareDocumentPosition is the direct expression of the rule;
    // asserting on classes would not have caught it.
    const wrapper = mountSwitch({ hint: 'Digest at 6 PM, weekdays only' })
    const label = wrapper.get('[data-label]').element
    const track = wrapper.get('[data-track]').element

    const labelPrecedesTrack = Boolean(
      label.compareDocumentPosition(track) & Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(labelPrecedesTrack).toBe(true)
  })

  it('sets the label at the switch weight, and dims it when disabled', () => {
    // Appendix D.1's per-control type table — a switch label is 13.5/500
    // --ink-900, NOT the 13.5/400 --ink-700 the plain checkbox and radio
    // rows use, and drops to --ink-200 disabled. Spread to classList rather
    // than substring-matching className: 'text-ink-900'.includes('text-ink-9')
    // style false positives are a live hazard in this repo.
    const on = [...mountSwitch().get('[data-label]').element.classList]
    expect(on).toContain('font-medium')
    expect(on).toContain('text-ink-900')
    expect(on).not.toContain('text-ink-700')

    const off = [...mountSwitch({ disabled: true }).get('[data-label]').element.classList]
    expect(off).toContain('text-ink-200')
    expect(off).not.toContain('text-ink-900')
  })
})
