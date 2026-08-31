import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CheckboxCard from '../CheckboxCard.vue'
import RadioCard from '../RadioCard.vue'

const CARD_OPTIONS = [
  { value: 'initial', label: 'Initial', hint: 'First licence for a newly built facility' },
  { value: 'renewal', label: 'Renewal', hint: 'Same services, new validity period' },
  { value: 'modify', label: 'Add / Modify', hint: 'Changes the services on an active licence' },
]

describe('CheckboxCard', () => {
  const mountCard = (props = {}) =>
    mount(CheckboxCard, {
      props: {
        modelValue: false,
        label: 'Pharmacy',
        hint: 'Requires a licensed pharmacist on duty',
        ...props,
      },
    })

  it('renders the label and hint inside a card surface', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Pharmacy')
    expect(wrapper.text()).toContain('Requires a licensed pharmacist on duty')
    expect(wrapper.get('[data-card]').classes()).toContain('border-hairline')
  })

  it('switches the whole surface when chosen, not just the box', () => {
    // Redline "Card selected" — green border AND tinted background. Both
    // branches set both properties, so neither is left to emit order.
    const on = mountCard({ modelValue: true }).get('[data-card]')
    expect(on.classes()).toContain('border-green-500')
    expect(on.classes()).toContain('bg-green-tint-2')
    expect(on.classes()).not.toContain('border-hairline')

    const off = mountCard().get('[data-card]')
    expect(off.classes()).toContain('border-hairline')
    expect(off.classes()).toContain('bg-surface')
    expect(off.classes()).not.toContain('bg-green-tint-2')
  })

  it('still contains a real checkbox', () => {
    // Deviates from the task brief here, which targeted `[role="checkbox"]`.
    // Confirmed against installed @zag-js/checkbox source (see Checkbox.spec.js
    // "exposes the mixed state..." for the same finding on the sibling this
    // component composes): no element Checkbox.vue renders ever carries a
    // literal `role` attribute. The only element with real checkbox semantics
    // is the native `<input type="checkbox">` from CheckboxHiddenInput.
    expect(mountCard().find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('emits when the card is chosen', async () => {
    const wrapper = mountCard()
    await wrapper.get('input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('passes disabled through to the nested checkbox', () => {
    // Beyond the brief: `disabled` is part of CheckboxCard's documented prop
    // shape, but Step 1's fixture never exercises it. Checkbox.spec.js
    // already proves the disabled DRESS on the box itself; this proves the
    // WIRING that gets `disabled` there in the first place.
    const input = mountCard({ disabled: true }).get('input[type="checkbox"]')
    expect(input.element.disabled).toBe(true)
  })
})

describe('RadioCard', () => {
  const mountCards = (props = {}) =>
    mount(RadioCard, {
      props: { options: CARD_OPTIONS, modelValue: 'renewal', label: 'Application type', ...props },
    })

  it('renders one card per option with its hint', () => {
    const wrapper = mountCards()
    expect(wrapper.findAll('[data-card]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Changes the services on an active licence')
  })

  it('names the group without drawing the name', () => {
    const wrapper = mountCards()
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Application type')
    expect(wrapper.text()).not.toContain('Application type')
    // Beyond the brief's literal Step 1 code, but required by the task's own
    // constraints: Ark's getRootProps() always sets aria-labelledby to the id
    // of a RadioGroupLabel this component never renders, which would dangle
    // if left alone. RadioCard neutralises it the same way Radio.vue does
    // (:aria-labelledby="undefined"); this is the matching assertion
    // Radio.spec.js already carries for that fix, reused here so the same
    // defect can't silently come back.
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-labelledby')).toBeUndefined()
  })

  it('marks only the chosen card', () => {
    const cards = mountCards().findAll('[data-card]')
    expect(cards[1].classes()).toContain('border-green-500')
    expect(cards[1].classes()).toContain('bg-green-tint-2')
    expect(cards[0].classes()).toContain('border-hairline')
    expect(cards[0].classes()).not.toContain('bg-green-tint-2')
  })

  it('shows the Selected marker on the chosen card only', () => {
    // Appendix D.1 — the chosen radio card carries a "Selected" marker.
    const markers = mountCards().findAll('[data-selected-marker]')
    expect(markers).toHaveLength(1)
    expect(markers[0].text()).toBe('Selected')
  })

  it('emits the chosen value', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('[data-card] input')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['modify'])
  })

  it('dresses a disabled option distinctly, like Radio', () => {
    // Beyond the brief: RadioCard reuses Radio's control VALUES but not its
    // component (each card needs its own [data-card] surface, which Radio's
    // single shared list root can't give per-option), so this controlClass
    // branch is new code Radio.spec.js's own disabled coverage cannot see.
    // Adds a disabled option the same way Radio.spec.js's own fixture does.
    const wrapper = mountCards({
      options: [...CARD_OPTIONS, { value: 'n/a', label: 'Not applicable', disabled: true }],
    })
    const control = wrapper.findAll('[data-control]')[3]
    expect(control.classes()).toContain('bg-surface-disabled')
    expect(control.classes()).toContain('border-soft')
  })
})
