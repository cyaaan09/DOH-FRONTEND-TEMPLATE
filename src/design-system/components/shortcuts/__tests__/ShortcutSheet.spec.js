import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ShortcutSheet from '../ShortcutSheet.vue'

const GROUPS = [
  {
    label: 'GLOBAL',
    rows: [
      { keys: ['/'], label: 'Search' },
      { keys: ['⌘', 'K'], joiner: 'chord', label: 'Command palette' },
    ],
  },
  {
    label: 'NAVIGATE',
    rows: [
      { keys: ['g', 'l'], joiner: 'then', label: 'Issued LTO' },
      { keys: ['↑', '↓'], joiner: 'or', label: 'Move between rows' },
    ],
  },
]

const open = () =>
  mount(ShortcutSheet, { props: { groups: GROUPS, modelValue: true }, attachTo: document.body })

// The sheet teleports to document.body, so an unmounted wrapper can still
// leave nodes behind and the next test counts them. Clear between tests.
afterEach(() => {
  document.body.innerHTML = ''
})

describe('ShortcutSheet', () => {
  it('encodes the relationship between keys, not just the keys', () => {
    // Redline "Separator · + for a true chord, italic `then` for a sequence,
    // italic `or` for alternatives". One separator would flatten three
    // different instructions into one shape — "g + l" is a lie about how the
    // navigation binding is pressed.
    const wrapper = open()
    const joiners = [...document.querySelectorAll('[data-joiner]')].map((j) => j.textContent.trim())
    expect(joiners).toEqual(['+', 'then', 'or'])
    wrapper.unmount()
  })

  it('marks word joiners differently from the chord symbol', () => {
    const wrapper = open()
    const nodes = [...document.querySelectorAll('[data-joiner]')]
    expect(nodes[0].className).not.toContain('sheet__joiner--word')
    expect(nodes[1].className).toContain('sheet__joiner--word')
    wrapper.unmount()
  })

  it('renders every binding as a <kbd>', () => {
    const wrapper = open()
    const caps = [...document.querySelectorAll('[data-keycap]')]
    // 1 + 2 + 2 + 2 across the two groups
    expect(caps.length).toBe(7)
    expect(caps.every((c) => c.tagName === 'KBD')).toBe(true)
    wrapper.unmount()
  })

  it('states the platform difference in the footer', () => {
    // Redline "Platform · ⌘ is Ctrl and ⌥ is Alt on Windows, stated in the
    // footer" — the sheet is the contract, so it cannot be Mac-only.
    const wrapper = open()
    expect(document.querySelector('[data-platform-note]').textContent).toContain('Ctrl')
    wrapper.unmount()
  })

  it('stays out of the DOM until opened', () => {
    const wrapper = mount(ShortcutSheet, { props: { groups: GROUPS }, attachTo: document.body })
    expect(document.querySelector('[data-shortcut-sheet]')).toBeNull()
    wrapper.unmount()
  })
})
