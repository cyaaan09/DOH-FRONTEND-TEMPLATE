import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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
    // Ark's own getRootProps() always sets aria-labelledby to an id that
    // only resolves if RadioGroupLabel is rendered, which this component
    // deliberately never does (label is aria-label only, per §8.1). Left
    // alone that reference would dangle — flagged by automated a11y
    // rubrics by default, even though the WAI-ARIA accname algorithm itself
    // falls back to aria-label when aria-labelledby does not resolve.
    // Radio.vue neutralises it via :aria-labelledby="undefined".
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-labelledby')).toBeUndefined()
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

  it('associates a hint with its input via aria-describedby, per option', () => {
    // Redline "Fields" (ARIA & semantics) — hint via aria-describedby. Same
    // reason as Checkbox.spec.js's identical test: each hidden input's own
    // aria-labelledby wins over the wrapping <label> for the accessible
    // NAME, so a hint needs its own wire into the description. This file's
    // own OPTIONS fixture carries no hints, so this test supplies one
    // locally rather than widening the shared fixture other tests rely on.
    const withHint = [
      { value: 'as-plan', label: 'As-plan', hint: 'Drawn but not yet built' },
      { value: 'as-built', label: 'As-built' },
    ]
    const wrapper = mountRadio({ options: withHint, modelValue: 'as-plan' })
    const inputs = wrapper.findAll('[data-item] input')

    const describedbyId = inputs[0].attributes('aria-describedby')
    expect(describedbyId).toBeTruthy()
    expect(wrapper.get(`[id="${describedbyId}"]`).text()).toBe('Drawn but not yet built')

    expect(inputs[1].attributes('aria-describedby')).toBeUndefined()
  })

  it('marks only the focused control focus-visible, for keyboard focus only', async () => {
    // Redline "Focus ring" — :focus-visible -> border/ring, never on a mouse
    // click, and scoped to the ONE item with focus (Zag's
    // getItemControlProps() computes focusVisible per item). Same reason
    // this needs a real focus() on an attached element as Checkbox.spec.js's
    // identical test — see the comment there.
    const wrapper = mount(Radio, {
      props: { options: OPTIONS, modelValue: 'as-plan', label: 'Drawing type' },
      attachTo: document.body,
    })
    const inputs = wrapper.findAll('[data-item] input')
    const controls = () => wrapper.findAll('[data-control]')

    try {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      inputs[0].element.focus()
      await nextTick()
      expect(controls()[0].attributes('data-focus-visible')).toBeUndefined()
      inputs[0].element.blur()
      await nextTick()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      inputs[1].element.focus()
      await nextTick()
      expect(controls()[1].attributes('data-focus-visible')).toBe('')
      expect(controls()[0].attributes('data-focus-visible')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })
})
