import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { MenuRoot } from '@ark-ui/vue/menu'
import RowMenu from '../RowMenu.vue'
import { installArkJsdomShims, resetArkPortals } from '@/design-system/testing/ark-jsdom'

// Empirically confirmed (not assumed): running this file with neither shim
// throws "ResizeObserver is not defined" from @zag-js/popper's autoUpdate
// call, which @zag-js/menu drives through the same getPlacement() as
// @zag-js/select — see ark-jsdom.js. installArkJsdomShims() also stubs
// Element.scrollTo, which menu.machine.mjs never calls (only
// select.machine.mjs's "open" exit action does); the stub is simply unused
// here, which is harmless. Element.prototype.scrollIntoView (used by
// menu.machine.mjs's keyboard-only scrollToHighlightedItem action) needs no
// shim either: @zag-js/dom-query's scrollIntoView() wrapper gates on
// isScrollable(rootEl), which reads scrollHeight/clientHeight — both always 0
// under jsdom's layout-less environment — so it returns before ever touching
// the (jsdom-missing) native method.
installArkJsdomShims()

const ITEMS = [
  { value: 'lto', label: 'View LTO document' },
  { value: 'facility', label: 'Facility details' },
  { value: 'logs', label: 'View logs' },
  { value: 'revoke', label: 'Revoke licence', destructive: true },
]

const mountMenu = (props = {}) =>
  mount(RowMenu, {
    props: { items: ITEMS, label: 'Row actions', ...props },
    attachTo: document.body,
  })

// MenuContent/MenuPositioner mount as soon as RowMenu mounts, gated by a
// presence machine rather than open/closed state — the same structure
// ark-jsdom.js documents for Select. Confirmed empirically: without this
// reset, "separates the destructive item with a hairline" saw 4 leaked
// separators from earlier un-unmounted tests instead of 1.
afterEach(resetArkPortals)

describe('RowMenu', () => {
  it('names the trigger and hides its decorative glyph', () => {
    const trigger = mountMenu().get('[data-trigger]')
    expect(trigger.attributes('aria-label')).toBe('Row actions')
    expect(trigger.get('[data-glyph]').attributes('aria-hidden')).toBe('true')
  })

  it('gives the trigger the 8px control radius and the field border', () => {
    // Appendix D.1 — 34x34, radius 8px, 1px field border.
    const trigger = mountMenu().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-control')
    expect(trigger.classes()).toContain('border-field')
  })

  it("sets the panel gutter to the redlined 6px, not Zag's 8px default", () => {
    // Appendix D.1 — RowMenu's panel sits at top: 40px against a 34px
    // trigger, a 6px gutter. menu.machine.mjs defaults positioning.gutter
    // to 8 (verified against the installed @zag-js/menu source), which
    // would render the panel 2px low. jsdom computes no layout, so the
    // rendered offset is not assertable — but the prop that produces it is.
    const wrapper = mountMenu()
    expect(wrapper.findComponent(MenuRoot).props('positioning')).toEqual({ gutter: 6 })
  })

  it('opens on click and renders every item', async () => {
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    const items = [...document.querySelectorAll('[role="menuitem"]')]
    expect(items).toHaveLength(4)
    expect(items[0].textContent).toContain('View LTO document')
    expect(items[3].textContent).toContain('Revoke licence')
    wrapper.unmount()
  })

  it('marks only the destructive item, and only last', async () => {
    // Redline "Menu item" — destructive is red at 700 and sits last.
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    const items = [...document.querySelectorAll('[role="menuitem"]')]
    expect([...items[3].classList]).toContain('text-red-700')
    expect([...items[3].classList]).toContain('font-bold')
    expect([...items[0].classList]).toContain('text-ink-700')
    expect([...items[0].classList]).not.toContain('text-red-700')
    wrapper.unmount()
  })

  it('separates the destructive item with a hairline', async () => {
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    expect(document.querySelectorAll('[data-separator]')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits select with the chosen value', async () => {
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    const item = document.querySelectorAll('[role="menuitem"]')[2]
    // menu.machine.mjs's invokeOnSelect reads context.highlightedValue, not
    // the clicked node's own id — it early-returns when that's still null
    // (verified against the installed @zag-js/menu source). Real pointer
    // use always hovers before it clicks, which ITEM_POINTERDOWN's
    // setHighlightedItem action sets; a bare .click() with no prior pointer
    // event leaves highlightedValue null and no select fires. Dispatching
    // pointerdown first (its handler has no pointerType gate, unlike
    // pointermove/pointerleave) reproduces that real sequence.
    item.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    item.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('select')?.[0]).toEqual(['logs'])
    wrapper.unmount()
  })
})
