import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppShell from '../AppShell.vue'

/**
 * AppShell is exported public API with no demo, because the artifact's App
 * shell section shows three separate previews — expanded rail, collapsed rail,
 * header — rather than a composed shell, and rendering one would be inventing
 * content (spec §17.3).
 *
 * That left the one thing it owns alone untested: Appendix C's "Skip link ·
 * first tab stop jumps past the rail to <main>". A rail is 15+ tab stops, so
 * without it every keyboard user walks the whole navigation before reaching
 * the page they opened.
 */
const mountShell = (props = {}) =>
  mount(AppShell, {
    props,
    slots: { rail: '<nav>rail</nav>', header: '<header>head</header>', default: '<p>page</p>' },
  })

describe('AppShell', () => {
  it('puts the skip link before the rail, so it is the first tab stop', () => {
    // DOM order IS tab order — the redline's "first tab stop" is not a
    // property to set, it is a position to place the element in.
    const html = mountShell().html()
    expect(html.indexOf('data-skip-link')).toBeLessThan(html.indexOf('<nav>'))
  })

  it('points the skip link at a <main> that can actually take focus', () => {
    // An href to an element with no tabindex moves the scroll but not the
    // caret, so the next Tab continues from the rail — the bug the link exists
    // to fix, still there but now invisible.
    const wrapper = mountShell()
    const target = wrapper.get('[data-skip-link]').attributes('href').slice(1)
    const main = wrapper.get('main')
    expect(main.attributes('id')).toBe(target)
    expect(main.attributes('tabindex')).toBe('-1')
  })

  it('keeps the link in the tab order rather than hiding it', () => {
    // display:none or hidden would remove it from the tab order entirely,
    // which is why it is moved off-screen and back on :focus instead.
    const link = mountShell().get('[data-skip-link]')
    expect(link.attributes('hidden')).toBeUndefined()
    expect(link.element.tagName).toBe('A')
    expect(link.text()).toMatch(/skip/i)
  })

  it('lets the label be translated', () => {
    expect(mountShell({ skipLabel: 'Laktawan' }).get('[data-skip-link]').text()).toBe('Laktawan')
  })

  it('renders the rail, the header and the page in that order', () => {
    const html = mountShell().html()
    expect(html.indexOf('<nav>')).toBeLessThan(html.indexOf('<header>'))
    expect(html.indexOf('<header>')).toBeLessThan(html.indexOf('<p>page</p>'))
  })
})
