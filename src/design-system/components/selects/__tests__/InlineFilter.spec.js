import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { SelectRoot } from '@ark-ui/vue/select'
import InlineFilter from '../InlineFilter.vue'
import { installArkJsdomShims, resetMountedDom } from '@/design-system/testing/ark-jsdom'

// ResizeObserver and Element.scrollTo: jsdom implements neither, and Zag's
// select machine calls both during ordinary interaction. See ark-jsdom.js
// for the full explanation, verified against the installed @zag-js/select
// and @zag-js/popper source — shared here because InlineFilter mounts the
// same select machine as Select and MultiSelect.
installArkJsdomShims()

// Properly unmounts every wrapper through Vue's own lifecycle after each
// test. See ark-jsdom.js's resetMountedDom docblock: wrapper.unmount() is
// what actually stops a still-open InlineFilter's Zag machine actor,
// including any document-level listeners it attached — the blunter reset
// below cannot do that on its own, since it only deletes DOM nodes.
enableAutoUnmount(afterEach)

const STATUSES = [
  { label: 'Active', dot: 'bg-dot-green' },
  { label: 'Expiring soon', dot: 'bg-amber-400' },
  { label: 'Expired', dot: 'bg-red-500' },
  { label: 'All', dot: 'bg-ink-200' },
]

const mountFilter = (props = {}) =>
  mount(InlineFilter, {
    props: { options: STATUSES, modelValue: 'Active', name: 'Status', ...props },
    attachTo: document.body,
  })

// SelectContent renders as an ordinary descendant of the mounted component,
// not into a document.body portal (see ark-jsdom.js), gated by a presence
// machine rather than by open/closed state. Most tests below never call
// wrapper.unmount() themselves; enableAutoUnmount above now covers that,
// and this reset stays as a defensive backstop for document-level queries
// between every test.
afterEach(resetMountedDom)

describe('InlineFilter', () => {
  it('renders the field name inline before the value', () => {
    const trigger = mountFilter().get('[data-trigger]')
    expect(trigger.get('[data-name]').text()).toBe('Status:')
    expect(trigger.get('[data-value]').text()).toBe('Active')
  })

  it('wears the soft-bordered 34px shell, not the 38px field shell', () => {
    // Redline "Inline variant" — 34px, radius 8px and the soft border, which
    // the bridge exposes as `border-soft`; `border-border-soft` emits
    // nothing. `h-compact` is the same token RowMenu's trigger uses for its
    // 34px side — without asserting it, the utility could be dropped and
    // this test's own title would keep claiming a height nothing checks.
    const trigger = mountFilter().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-control')
    expect(trigger.classes()).toContain('border-soft')
    expect(trigger.classes()).toContain('h-compact')
    expect(trigger.classes()).not.toContain('rounded-field')
    expect(trigger.classes()).not.toContain('border-field')
  })

  it('sets the inline type step', () => {
    // Redline "Inline variant" — 12.5px/700.
    const trigger = mountFilter().get('[data-trigger]')
    expect(trigger.classes()).toContain('text-field-label')
    expect(trigger.classes()).toContain('font-bold')
  })

  it("sets the panel gutter to the redlined 6px, not Zag's 8px default", () => {
    // Redline "Panel" — top 44px against a 38px trigger, so a 6px gutter.
    // jsdom computes no layout, so the rendered offset is not assertable —
    // but the prop that produces it is. Mirrors Select.spec.js's assertion:
    // this select machine is phase-wide, so the same gutter fix applies here.
    const wrapper = mountFilter()
    expect(wrapper.findComponent(SelectRoot).props('positioning')).toEqual({ gutter: 6 })
  })

  it('gives every option its status dot', async () => {
    const wrapper = mountFilter()
    await wrapper.get('[data-trigger]').trigger('click')
    const dots = [...document.querySelectorAll('[data-dot]')]
    expect(dots).toHaveLength(4)
    expect([...dots[0].classList]).toContain('bg-dot-green')
    expect([...dots[2].classList]).toContain('bg-red-500')
    // The dot carries no meaning of its own; the label beside it does.
    expect(dots[0].getAttribute('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('emits update:modelValue with the chosen label', async () => {
    const wrapper = mountFilter()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[role="option"]')[1].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Expiring soon'])
    wrapper.unmount()
  })

  it('names the control from the field name it renders', () => {
    expect(mountFilter().get('[data-trigger]').attributes('aria-label')).toBe('Status')
  })
})
