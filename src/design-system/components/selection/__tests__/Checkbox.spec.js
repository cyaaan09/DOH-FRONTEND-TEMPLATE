import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import Checkbox from '../Checkbox.vue'

const mountBox = (props = {}) =>
  mount(Checkbox, { props: { modelValue: false, label: 'Include legacy records', ...props } })

describe('Checkbox', () => {
  it('renders its label and optional hint', () => {
    const wrapper = mountBox({ hint: 'Migrated paper licences with no service list' })
    expect(wrapper.text()).toContain('Include legacy records')
    expect(wrapper.text()).toContain('Migrated paper licences with no service list')
  })

  it('omits the hint element when none is given', () => {
    expect(mountBox().find('[data-hint]').exists()).toBe(false)
  })

  it('sizes the box from the shared control token', () => {
    // Redline "Checkbox" — 17x17, radius 5px. --size-check is 17px and bridges
    // to h-check/w-check; this section is its first consumer.
    const box = mountBox().get('[data-box]')
    expect(box.classes()).toContain('h-check')
    expect(box.classes()).toContain('w-check')
    expect(box.classes()).toContain('rounded-check')
  })

  it('fills green when on and stays white when off', () => {
    // Redlines "Checkbox on" and "Checkbox off". Both branches set background
    // AND border, so neither is left to Tailwind's emit order.
    const on = mountBox({ modelValue: true }).get('[data-box]')
    expect(on.classes()).toContain('bg-green-fill')
    expect(on.classes()).toContain('border-green-fill')
    expect(on.classes()).not.toContain('bg-surface')

    const off = mountBox().get('[data-box]')
    expect(off.classes()).toContain('bg-surface')
    expect(off.classes()).toContain('border-ink-100')
    expect(off.classes()).not.toContain('bg-green-fill')
  })

  it('shows a check when on and a dash when indeterminate', () => {
    // Redline "Indeterminate" — same fill as on, glyph is a dash.
    expect(mountBox({ modelValue: true }).get('[data-glyph]').text()).toBe('✓')
    const mixed = mountBox({ indeterminate: true })
    expect(mixed.get('[data-glyph]').text()).toBe('–')
    expect(mixed.get('[data-box]').classes()).toContain('bg-green-fill')
  })

  it('exposes the mixed state to assistive technology', () => {
    // WCAG 2.1 AA: an indeterminate box must not announce as merely unchecked.
    //
    // Deviates from the task brief here, which targeted `[role="checkbox"]`
    // and `aria-checked="mixed"`. Confirmed by reading the installed
    // @zag-js/checkbox and @ark-ui/vue source (see task-1-report.md, "API
    // risk 1"): no element this component renders ever carries a literal
    // `role` attribute — CheckboxRoot is a plain `<label>`, CheckboxControl
    // is `aria-hidden="true"`, and the only element with real checkbox
    // semantics is the native `<input type="checkbox">` from
    // CheckboxHiddenInput. Ark exposes the mixed state through that input's
    // `indeterminate` IDL property (set imperatively by the zag machine's
    // `syncInputElement` action), which is how native checkboxes report
    // "mixed" to assistive technology — there is no `aria-checked` attribute
    // to read, on this element or any other.
    const input = mountBox({ indeterminate: true }).get('input[type="checkbox"]')
    expect(input.element.indeterminate).toBe(true)
  })

  it('dresses the disabled state distinctly from both on and off', () => {
    // Redline "Disabled" — its own fill, border and glyph colour.
    const box = mountBox({ disabled: true, modelValue: true }).get('[data-box]')
    expect(box.classes()).toContain('bg-surface-disabled')
    expect(box.classes()).toContain('border-soft')
    expect(box.classes()).toContain('text-ink-200')
    expect(box.classes()).not.toContain('bg-green-fill')
  })

  it('does not show a checkmark when disabled and unchecked', () => {
    // Regression test: the glyph used to render unconditionally whenever
    // `indeterminate` was false, hidden only by the off-state's boxClass
    // matching its text colour to the background (`text-transparent`). The
    // disabled branch's glyph colour (`text-ink-200`) is opaque, so a
    // disabled-and-unchecked box showed a phantom checkmark it shouldn't
    // have — this cell was never exercised by the disabled test above,
    // which mounts `{ disabled: true, modelValue: true }`. Visibility now
    // comes from CheckboxIndicator's own `hidden` prop, independent of
    // colour and of `disabled`.
    const glyph = mountBox({ disabled: true, modelValue: false }).get('[data-glyph]')
    expect(glyph.isVisible()).toBe(false)
  })

  it('emits update:modelValue when toggled', async () => {
    // Targets the native hidden input rather than `[role="checkbox"]` — see
    // "exposes the mixed state to assistive technology" above. This is the
    // element that actually carries the click handler wiring `CHECKED.SET`.
    const wrapper = mountBox()
    await wrapper.get('input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mountBox({ disabled: true })
    await wrapper.get('input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('labels at the body step in the ink-700 grey', () => {
    // Redline "Label" — 13.5/400, #344054.
    const label = mountBox().get('[data-label]')
    expect(label.classes()).toContain('text-body')
    expect(label.classes()).toContain('text-ink-700')
  })

  it('associates the hint with the input via aria-describedby', () => {
    // Redline "Fields" (ARIA & semantics) — hint via aria-describedby. The
    // hidden input already carries an explicit aria-labelledby (Ark's own
    // getHiddenInputProps(), pointed at CheckboxLabel), which wins over the
    // wrapping <label> for the accessible NAME — so without this wire, a
    // hint like "Migrated paper licences with no service list" is in
    // neither the name nor the description, and is silent on focus.
    const wrapper = mountBox({ hint: 'Migrated paper licences with no service list' })
    const input = wrapper.get('input[type="checkbox"]')
    const describedbyId = input.attributes('aria-describedby')
    expect(describedbyId).toBeTruthy()
    expect(wrapper.get(`[id="${describedbyId}"]`).text()).toBe(
      'Migrated paper licences with no service list',
    )
  })

  it('omits aria-describedby when there is no hint', () => {
    expect(mountBox().get('input[type="checkbox"]').attributes('aria-describedby')).toBeUndefined()
  })

  it('marks the box focus-visible for keyboard focus, not a mouse click', async () => {
    // Redline "Focus ring" — :focus-visible -> border + ring; the artifact
    // never shows this on a mouse click. Zag's isFocusVisible() reads a
    // module-level modality flag set by a real keydown/mousedown on
    // `document` (the machine's own effect wires that listener there on
    // mount). Needs a REAL focus(), not Test Utils' synthetic
    // trigger('focus'): focus/blur do not bubble and jsdom only runs the
    // browser's real focus machinery — which is what actually drives Ark's
    // context update here — for a connected, attached element, so this
    // mount uses attachTo and is unmounted again at the end.
    const wrapper = mount(Checkbox, {
      props: { modelValue: false, label: 'Include legacy records' },
      attachTo: document.body,
    })
    const input = wrapper.get('input[type="checkbox"]')
    const box = () => wrapper.get('[data-box]')

    try {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      input.element.focus()
      await nextTick()
      expect(box().attributes('data-focus-visible')).toBeUndefined()
      input.element.blur()
      await nextTick()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      input.element.focus()
      await nextTick()
      expect(box().attributes('data-focus-visible')).toBe('')
    } finally {
      wrapper.unmount()
    }
  })

  it('dims the label when disabled and lifts it inside a card', () => {
    // Appendix D.1's per-control type table. Both were previously fixed at
    // text-body/text-ink-700 regardless of state, so a disabled row kept a
    // full-strength label beside its dimmed box, and a card label sat a
    // weight and a step lighter than the artifact's.
    const plain = [...mountBox().get('[data-label]').element.classList]
    expect(plain).toContain('text-ink-700')
    expect(plain).not.toContain('font-medium')

    expect([...mountBox({ disabled: true }).get('[data-label]').element.classList]).toContain(
      'text-ink-200',
    )

    const card = [...mountBox({ emphasis: true }).get('[data-label]').element.classList]
    expect(card).toContain('font-medium')
    expect(card).toContain('text-ink-900')
  })

  it('grows the row to a 44px tap target on a coarse pointer', () => {
    // Appendix C, Responsive & touch — "17px box inside a 44px tappable row
    // on touch". --h-touch has existed since Phase 1 for exactly this and
    // nothing used it. min-height, not height: a row carrying a hint is
    // already taller and must not be squashed back to 44.
    const source = readFileSync('src/design-system/components/selection/Checkbox.vue', 'utf8')
    expect(source).toMatch(/@media \(pointer: coarse\)/)
    expect(source).toMatch(/min-height:\s*var\(--h-touch\)/)
    expect(source).not.toMatch(/\n\s+height:\s*var\(--h-touch\)/)
  })
})