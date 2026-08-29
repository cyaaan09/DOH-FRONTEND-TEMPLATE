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
