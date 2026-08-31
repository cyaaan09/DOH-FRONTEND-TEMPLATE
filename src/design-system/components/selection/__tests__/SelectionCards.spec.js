import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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

  it('toggles when the card padding is clicked, not just the nested checkbox', async () => {
    // Appendix D's Selection controls description — "whole row clickable".
    // RadioCard's card IS the label, so its whole padded surface is native
    // click territory; this card wraps Checkbox, whose own <label> root is
    // only as wide as its box + text, so the padding this wrapping <div>
    // adds was dead to clicks before this fix. trigger('click') dispatched
    // directly on [data-card] targets the div itself, simulating a click
    // that lands on that padding (outside the nested label) rather than on
    // any of its children.
    const wrapper = mountCard()
    await wrapper.get('[data-card]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('does not double-toggle when the click lands on the nested checkbox', async () => {
    // Regression guard for the card-padding forwarder above: a click that
    // DOES land inside the nested Checkbox's own <label> must be left to
    // toggle it natively, exactly once — not re-emitted a second time by
    // the card's own click handler.
    const wrapper = mountCard()
    await wrapper.get('input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
  })

  it('does not toggle from the card padding when disabled', async () => {
    const wrapper = mountCard({ disabled: true })
    await wrapper.get('[data-card]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
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

  it('associates a hint with its input via aria-describedby, per option', () => {
    // Redline "Fields" (ARIA & semantics) — hint via aria-describedby. Same
    // reason as Radio.spec.js's identical test: each hidden input's own
    // aria-labelledby wins over the wrapping <label> for the accessible
    // NAME, so a hint needs its own wire into the description. Adds one
    // hint-less option locally, since every CARD_OPTIONS entry carries one.
    const wrapper = mountCards({
      options: [...CARD_OPTIONS, { value: 'n/a', label: 'Not applicable' }],
    })
    const inputs = wrapper.findAll('[data-card] input')

    const describedbyId = inputs[0].attributes('aria-describedby')
    expect(describedbyId).toBeTruthy()
    expect(wrapper.get(`[id="${describedbyId}"]`).text()).toBe(
      'First licence for a newly built facility',
    )

    expect(inputs[3].attributes('aria-describedby')).toBeUndefined()
  })

  it('marks only the focused control focus-visible, for keyboard focus only', async () => {
    // Redline "Focus ring" — :focus-visible -> border/ring, never on a mouse
    // click, and scoped to the ONE item with focus. Same mechanism and same
    // reason this needs a real focus() on an attached element as
    // Checkbox.spec.js's identical test — see the comment there.
    const wrapper = mount(RadioCard, {
      props: { options: CARD_OPTIONS, modelValue: 'renewal', label: 'Application type' },
      attachTo: document.body,
    })
    const inputs = wrapper.findAll('[data-card] input')
    const controls = () => wrapper.findAll('[data-control]')

    try {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      inputs[0].element.focus()
      await nextTick()
      expect(controls()[0].attributes('data-focus-visible')).toBeUndefined()
      inputs[0].element.blur()
      await nextTick()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      inputs[2].element.focus()
      await nextTick()
      expect(controls()[2].attributes('data-focus-visible')).toBe('')
      expect(controls()[0].attributes('data-focus-visible')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('hangs the Selected marker off the card row, not inside the text column', () => {
    // Appendix D.1 — the marker is the card row's THIRD flex child at
    // flex:none, so it sits at the card's right edge. It was built as a
    // block below the text column, which is where the screenshot showed it.
    // Structure, not classes: the old build carried the same green type and
    // still rendered in the wrong place.
    const card = mountCards().findAll('[data-card]')[1]
    const marker = card.get('[data-selected-marker]')
    const text = card.get('[data-label]').element.parentElement
    expect(text.contains(marker.element)).toBe(false)
    expect(marker.element.parentElement).toBe(card.element)
    const cls = [...marker.element.classList]
    expect(cls).toContain('flex-none')
    expect(cls).toContain('bg-green-100')
  })

  it('sets a card label at the card weight, unlike a plain radio row', () => {
    // Appendix D.1's per-control type table — 13.5/500 --ink-900 in a card
    // against 13.5/400 --ink-700 in the plain list.
    const cls = [...mountCards().get('[data-label]').element.classList]
    expect(cls).toContain('font-medium')
    expect(cls).toContain('text-ink-900')
    expect(cls).not.toContain('text-ink-700')
  })
})
