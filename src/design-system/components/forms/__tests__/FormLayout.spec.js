import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import FormField from '../FormField.vue'
import FormShell from '../FormShell.vue'
import Fieldset from '../Fieldset.vue'
import TokenField from '../TokenField.vue'
import TextField from '../TextField.vue'

describe('FormField', () => {
  const mountField = (props = {}) =>
    mount(FormField, { props: { label: 'Facility name', ...props }, slots: { default: '<input>' } })

  it('shares ONE slot between help and error, and reserves two lines', () => {
    // Redline "Help/error slot · one shared slot per field · min-height 32px
    // — reserved for two lines so validating never reflows the row". The
    // reservation is the whole point: a form that grows when a field goes
    // invalid pushes everything below it down, exactly when the user needs
    // to keep their place.
    const source = readFileSync('src/design-system/components/forms/FormField.vue', 'utf8')
    expect(source).toMatch(/min-height:\s*32px/)

    const withHint = mountField({ hint: 'As written on the registration.' })
    const withError = mountField({ hint: 'As written on the registration.', error: 'Needs all four segments.' })
    // one element in both states, never two
    expect(withHint.findAll('[data-message]')).toHaveLength(1)
    expect(withError.findAll('[data-message]')).toHaveLength(1)
    // and the error REPLACES the hint rather than joining it
    expect(withError.get('[data-message]').text()).toContain('Needs all four segments.')
    expect(withError.get('[data-message]').text()).not.toContain('As written on the registration.')
  })

  it('gives the error a filled badge the hint never gets', () => {
    expect(mountField({ hint: 'h' }).find('[data-error-badge]').exists()).toBe(false)
    const badge = mountField({ error: 'e' }).get('[data-error-badge]')
    expect(badge.text()).toBe('!')
    expect(badge.attributes('aria-hidden')).toBe('true')
  })

  it('marks required and optional, never both', () => {
    // Redline "Required mark · used on required fields only" and "Optional
    // mark" — most fields are required, so the grey word marks the few that
    // are not. The asterisk is aria-hidden: the requirement belongs on the
    // control, not read aloud mid-label.
    const req = mountField({ required: true })
    expect(req.get('[data-required]').text()).toBe('*')
    expect(req.get('[data-required]').attributes('aria-hidden')).toBe('true')
    expect(req.find('[data-optional]').exists()).toBe(false)

    const opt = mountField({ optional: true })
    expect(opt.get('[data-optional]').text()).toBe('optional')
    expect(opt.find('[data-required]').exists()).toBe(false)

    // required wins if a caller sets both, rather than drawing two marks
    const both = mountField({ required: true, optional: true })
    expect(both.find('[data-required]').exists()).toBe(true)
    expect(both.find('[data-optional]').exists()).toBe(false)
  })

  it('points the control at the message it describes', () => {
    const wrapper = mountField({ hint: 'h' })
    const id = wrapper.get('[data-message]').attributes('id')
    expect(id).toBeTruthy()
  })
})

describe('TextField bare mode', () => {
  it('drops its own label and message so FormField can own them', () => {
    // Without this the label and the help text would each render twice.
    const bare = mount(TextField, { props: { label: 'A', hint: 'h', bare: true } })
    expect(bare.find('label').exists()).toBe(false)
    expect(bare.find('p').exists()).toBe(false)
    expect(bare.find('input').exists()).toBe(true)

    const normal = mount(TextField, { props: { label: 'A', hint: 'h' } })
    expect(normal.find('label').exists()).toBe(true)
  })
})

describe('Fieldset', () => {
  it('is a label and a rule, never a card', () => {
    // Redline — nesting cards inside cards doubles the borders. The section's
    // own rule card says "Sections are rules, not cards".
    const wrapper = mount(Fieldset, { props: { label: 'IDENTIFICATION' }, slots: { default: '<i/>' } })
    expect(wrapper.get('[data-fieldset-label]').text()).toBe('IDENTIFICATION')
    // The 1px hairline IS a background, so check the fieldset's own block:
    // it must carry no card dress of its own.
    const styles = readFileSync('src/design-system/components/forms/Fieldset.vue', 'utf8')
    const rootBlock = styles.match(/\.fieldset(--spaced)?\s*\{[^}]*\}/g)?.join('\n') ?? ''
    expect(rootBlock).not.toMatch(/(background|box-shadow|border-radius|border\s*:)/)
    expect(styles).toMatch(/\.fieldset__rule\s*\{[^}]*background:\s*var\(--divider\)/)
  })

  it('drops the 24px lead-in for the first fieldset only', () => {
    expect(mount(Fieldset, { props: { label: 'A', first: true } }).classes()).not.toContain('fieldset--spaced')
    expect(mount(Fieldset, { props: { label: 'A' } }).classes()).toContain('fieldset--spaced')
  })
})

describe('FormShell', () => {
  it('renders header, body and one footer that owns the actions', () => {
    const wrapper = mount(FormShell, {
      props: { title: 'Register a facility', subtitle: 'Step 2 of 4', progress: 50, autosave: 'Draft saved' },
      slots: { default: '<i/>', actions: '<button>Continue</button>' },
    })
    expect(wrapper.get('[data-form-title]').text()).toBe('Register a facility')
    expect(wrapper.get('[data-form-progress]').exists()).toBe(true)
    expect(wrapper.get('[data-autosave]').text()).toContain('Draft saved')
    expect(wrapper.get('[data-form-footer]').text()).toContain('Continue')
  })

  it('omits the meter when no progress is given', () => {
    const wrapper = mount(FormShell, { props: { title: 'X' }, slots: { default: '<i/>' } })
    expect(wrapper.find('[data-form-progress]').exists()).toBe(false)
  })

  it('is a <form> that does not navigate on submit', () => {
    expect(mount(FormShell, { props: { title: 'X' }, slots: { default: '<i/>' } }).element.tagName).toBe('FORM')
  })
})

describe('TokenField', () => {
  it('names each remove button after its own token', () => {
    const wrapper = mount(TokenField, { props: { modelValue: ['Pharmacy', 'Birthing Home'] } })
    expect(wrapper.findAll('[data-token]')).toHaveLength(2)
    expect(wrapper.findAll('[data-token-remove]')[0].attributes('aria-label')).toBe('Remove Pharmacy')
  })

  it('emits the token it was asked to remove', async () => {
    const wrapper = mount(TokenField, { props: { modelValue: ['Pharmacy'] } })
    await wrapper.get('[data-token-remove]').trigger('click')
    expect(wrapper.emitted('remove')[0][0]).toBe('Pharmacy')
  })

  it('grows rather than scrolling, so no service is hidden', () => {
    const source = readFileSync('src/design-system/components/forms/TokenField.vue', 'utf8')
    expect(source).toMatch(/min-height:\s*var\(--h-field\)/)
    expect(source).not.toMatch(/overflow-y:\s*(auto|scroll)/)
  })
})
