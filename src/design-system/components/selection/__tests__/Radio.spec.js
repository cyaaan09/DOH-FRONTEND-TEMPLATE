import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Radio from '../Radio.vue'

const OPTIONS = [
  { value: 'as-plan', label: 'As-plan' },
  { value: 'as-built', label: 'As-built' },
  { value: 'n/a', label: 'Not applicable', disabled: true },
]

const mountRadio = (props = {}) =>
  mount(Radio, {
    props: { options: OPTIONS, modelValue: 'as-plan', label: 'Drawing type', ...props },
  })

describe('Radio', () => {
  it('renders one item per option', () => {
    const wrapper = mountRadio()
    expect(wrapper.findAll('[data-item]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Not applicable')
  })

  it('names the group without drawing the name', () => {
    const wrapper = mountRadio()
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Drawing type')
    expect(wrapper.text()).not.toContain('Drawing type')
  })

  it('marks the chosen option and only that one', () => {
    const items = mountRadio().findAll('[data-item]')
    expect(items[0].attributes('data-state')).toBe('checked')
    expect(items[1].attributes('data-state')).not.toBe('checked')
  })

  it('gives the dot the fill green only when chosen', () => {
    // Redline "Radio" — 8px inner dot in the fill green.
    const dots = mountRadio().findAll('[data-dot]')
    expect(dots[0].classes()).toContain('bg-green-fill')
    expect(dots[1].classes()).toContain('bg-transparent')
    expect(dots[1].classes()).not.toContain('bg-green-fill')
  })

  it('rounds the control fully, unlike the checkbox', () => {
    // Redline "Radio" — 17x17 circle. Same size token, different radius.
    const control = mountRadio().get('[data-control]')
    expect(control.classes()).toContain('h-check')
    expect(control.classes()).toContain('rounded-pill')
    expect(control.classes()).not.toContain('rounded-check')
  })

  it('emits the chosen value', async () => {
    const wrapper = mountRadio()
    await wrapper.findAll('[data-item] input')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['as-built'])
  })

  it('dresses a disabled option distinctly', () => {
    const control = mountRadio().findAll('[data-control]')[2]
    expect(control.classes()).toContain('bg-surface-disabled')
    expect(control.classes()).toContain('border-soft')
  })

  it('uses the disabled glyph colour for a chosen-but-disabled dot, not green', () => {
    // Beyond the brief: OPTIONS' disabled option ("n/a") is never the
    // fixture's modelValue, so none of the tests above exercise a disabled
    // item that is also the chosen one. Redline "Disabled" (its own fill,
    // border AND glyph colour) is one of this task's named rows, and
    // Checkbox already sets the precedent for this exact cell — its
    // "dresses the disabled state distinctly" test mounts
    // { disabled: true, modelValue: true } specifically to prove disabled
    // wins over the on-colour, never showing the vivid green when a control
    // cannot be interacted with.
    const dot = mountRadio({ modelValue: 'n/a' }).findAll('[data-dot]')[2]
    expect(dot.classes()).toContain('bg-ink-200')
    expect(dot.classes()).not.toContain('bg-green-fill')
  })
})
