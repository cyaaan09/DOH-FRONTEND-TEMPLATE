import { mount } from '@vue/test-utils'
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
    expect(mountSwitch({ modelValue: true }).get('[data-track]').classes()).toContain('bg-green-fill')
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
    // Verified against @zag-js/switch: `role` appears NOWHERE in that package,
    // and getHiddenInputProps renders a plain <input type="checkbox"> with
    // defaultChecked and no aria-checked. State therefore lives on the input's
    // own `checked` IDL property, exactly as it does for Checkbox.
    const input = mountSwitch({ modelValue: true }).get('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)
    expect(mountSwitch().get('input[type="checkbox"]').element.checked).toBe(false)
  })

  it('emits update:modelValue when toggled, and not when disabled', async () => {
    const on = mountSwitch()
    await on.get('input[type="checkbox"]').trigger('click')
    expect(on.emitted('update:modelValue')?.[0]).toEqual([true])

    const off = mountSwitch({ disabled: true })
    await off.get('input[type="checkbox"]').trigger('click')
    expect(off.emitted('update:modelValue')).toBeUndefined()
  })
})
