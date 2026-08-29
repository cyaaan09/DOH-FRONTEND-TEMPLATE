import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextField from '../TextField.vue'
import Textarea from '../Textarea.vue'
import SearchField from '../SearchField.vue'

describe('TextField', () => {
  it('associates its label with its input', () => {
    const wrapper = mount(TextField, { props: { label: 'Facility name' } })
    const id = wrapper.get('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(TextField, { props: { label: 'A', modelValue: '' } })
    await wrapper.get('input').setValue('Carmen RHU')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Carmen RHU']])
  })

  it('shows a hint when there is no error', () => {
    const wrapper = mount(TextField, { props: { label: 'A', hint: 'Must be at least 1' } })
    expect(wrapper.text()).toContain('Must be at least 1')
  })

  it('replaces the hint with the error and marks the input invalid', () => {
    const wrapper = mount(TextField, {
      props: { label: 'A', hint: 'a hint', error: 'Required' },
    })
    expect(wrapper.text()).toContain('Required')
    expect(wrapper.text()).not.toContain('a hint')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('points aria-describedby at whichever message is showing', () => {
    const wrapper = mount(TextField, { props: { label: 'A', error: 'Required' } })
    const describedBy = wrapper.get('input').attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.get(`#${describedBy}`).text()).toBe('Required')
  })

  it('switches to the mono face for reference numbers', () => {
    const wrapper = mount(TextField, { props: { label: 'A', mono: true } })
    expect(wrapper.get('input').classes()).toContain('font-mono')
  })

  it('renders a suffix when given one', () => {
    const wrapper = mount(TextField, { props: { label: 'A', suffix: 'beds' } })
    expect(wrapper.text()).toContain('beds')
  })

  it('keeps its border but loses its white surface when disabled', () => {
    const wrapper = mount(TextField, { props: { label: 'A', disabled: true } })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('input').classes()).toContain('bg-surface-input')
  })
})

describe('Textarea', () => {
  it('associates its label and emits on input', async () => {
    const wrapper = mount(Textarea, { props: { label: 'Remarks', modelValue: '' } })
    const id = wrapper.get('textarea').attributes('id')
    expect(wrapper.get('label').attributes('for')).toBe(id)
    await wrapper.get('textarea').setValue('Looks good')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Looks good']])
  })

  it('shows a character counter only when maxlength is set', () => {
    const counted = mount(Textarea, {
      props: { label: 'A', modelValue: 'abc', maxlength: 400 },
    })
    expect(counted.text()).toContain('3 / 400')
    expect(mount(Textarea, { props: { label: 'A' } }).text()).not.toContain('/')
  })

  it('defaults to three rows', () => {
    expect(mount(Textarea, { props: { label: 'A' } }).get('textarea').attributes('rows')).toBe('3')
  })

  it('shows a hint when there is no error', () => {
    const wrapper = mount(Textarea, { props: { label: 'A', hint: 'Must be at least 1' } })
    expect(wrapper.text()).toContain('Must be at least 1')
  })

  it('replaces the hint with the error and marks the textarea invalid', () => {
    const wrapper = mount(Textarea, {
      props: { label: 'A', hint: 'a hint', error: 'Required' },
    })
    expect(wrapper.text()).toContain('Required')
    expect(wrapper.text()).not.toContain('a hint')
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('points aria-describedby at whichever message is showing', () => {
    const wrapper = mount(Textarea, { props: { label: 'A', error: 'Required' } })
    const describedBy = wrapper.get('textarea').attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.get(`#${describedBy}`).text()).toBe('Required')
  })

  it('renders a placeholder when given one', () => {
    const wrapper = mount(Textarea, { props: { label: 'A', placeholder: 'Add remarks…' } })
    expect(wrapper.get('textarea').attributes('placeholder')).toBe('Add remarks…')
  })

  it('keeps its border but loses its white surface when disabled', () => {
    const wrapper = mount(Textarea, { props: { label: 'A', disabled: true } })
    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.get('textarea').classes()).toContain('bg-surface-input')
    expect(wrapper.get('textarea').classes()).toContain('border-field')
  })

  it('keeps its border but loses its white surface when readonly', () => {
    const wrapper = mount(Textarea, { props: { label: 'A', readonly: true } })
    expect(wrapper.get('textarea').attributes('readonly')).toBeDefined()
    expect(wrapper.get('textarea').classes()).toContain('bg-surface-input')
    expect(wrapper.get('textarea').classes()).toContain('border-field')
  })
})

describe('TextField — Appendix C conformance', () => {
  it('uses the strong red for an error border, not the pale tint', () => {
    // Redline "Error" — strong red border, not the pale tint used for
    // toast and notice outlines.
    const classes = mount(TextField, { props: { label: 'A', error: 'Required' } })
      .get('input')
      .classes()
    expect(classes).toContain('border-red-700')
    expect(classes).not.toContain('border-red-border')
  })

  it('gives read-only fields the hairline border and muted text', () => {
    // Redline "Read only" — input well surface, hairline border, muted text.
    const classes = mount(TextField, { props: { label: 'A', readonly: true } })
      .get('input')
      .classes()
    expect(classes).toContain('bg-surface-input')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('text-ink-400')
  })

  it('spaces the label 6px above and the message 5px below', () => {
    // Redline "Label" (6px below) and "Hint" (5px above).
    const wrapper = mount(TextField, { props: { label: 'A', hint: 'h' } })
    expect(wrapper.get('label').classes()).toContain('mb-1.5')
    expect(wrapper.get('p').classes()).toContain('mt-1.25')
  })
})

describe('Textarea — Appendix C conformance', () => {
  it('uses the taller textarea padding', () => {
    // Redline "Textarea" — 11px/12px padding, resize vertical.
    const classes = mount(Textarea, { props: { label: 'A' } }).get('textarea').classes()
    expect(classes).toContain('py-2.75')
    expect(classes).toContain('px-3')
    expect(classes).toContain('resize-y')
  })

  it('matches the read-only treatment TextField uses', () => {
    const classes = mount(Textarea, { props: { label: 'A', readonly: true } })
      .get('textarea')
      .classes()
    expect(classes).toContain('bg-surface-input')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('text-ink-400')
  })
})

describe('SearchField', () => {
  it('shows the clear button only once there is a value', () => {
    expect(mount(SearchField, { props: { modelValue: '' } }).find('[data-clear]').exists()).toBe(false)
    expect(mount(SearchField, { props: { modelValue: 'rhu' } }).find('[data-clear]').exists()).toBe(true)
  })

  it('emits an empty string when cleared', async () => {
    const wrapper = mount(SearchField, { props: { modelValue: 'rhu' } })
    await wrapper.get('[data-clear]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  it('labels the clear button for screen readers', () => {
    const wrapper = mount(SearchField, { props: { modelValue: 'rhu' } })
    expect(wrapper.get('[data-clear]').attributes('aria-label')).toBe('Clear search')
  })

  it('exposes an accessible name by default', () => {
    const wrapper = mount(SearchField, { props: { modelValue: '' } })
    expect(wrapper.get('input').attributes('aria-label')).toBe('Search')
  })

  it('lets a custom label override the accessible name', () => {
    const wrapper = mount(SearchField, {
      props: { modelValue: '', label: 'Search facilities' },
    })
    expect(wrapper.get('input').attributes('aria-label')).toBe('Search facilities')
  })

  it('keeps the accessible name once the field has a value', () => {
    const wrapper = mount(SearchField, { props: { modelValue: 'rhu' } })
    expect(wrapper.get('input').attributes('aria-label')).toBe('Search')
  })
})
