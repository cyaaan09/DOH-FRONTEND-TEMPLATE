import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import Tooltip from '../Tooltip.vue'
import Popover from '../Popover.vue'
import HintedText from '../HintedText.vue'

describe('Tooltip', () => {
  it('takes its label as a STRING, so it cannot grow a button', () => {
    // Redline "Rule · if it contains a button, it is a popover — a tooltip
    // holds one line of text and nothing else". A content slot would make
    // that the caller's discipline; a string prop makes it the type's.
    expect(Tooltip.props.label.type).toBe(String)
    expect(Tooltip.props.label.required).toBe(true)
    expect(Object.keys(Tooltip.props)).not.toContain('content')
  })

  it('defaults to the redlined timing and offset', () => {
    // Redline "Tooltip timing · 120ms delay in, none out · 6px offset".
    expect(Tooltip.props.openDelay.default).toBe(120)
    expect(Tooltip.props.closeDelay.default).toBe(0)
    expect(readFileSync('src/design-system/components/overlays/Tooltip.vue', 'utf8')).toContain(
      'gutter: 6',
    )
  })

  it('renders its trigger and keeps the tip out of the DOM until opened', () => {
    const wrapper = mount(Tooltip, {
      props: { label: 'Row actions' },
      slots: { default: '<button>x</button>' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(document.querySelector('[data-tooltip]')).toBeNull()
  })
})

describe('Popover', () => {
  it('defaults its dismiss to "Got it", not "Close"', () => {
    // Redline "Popover actions · dismiss reads Got it, not Close" — the
    // dismiss acknowledges the explanation rather than naming the widget, so
    // a caller has to work to make it worse.
    expect(Popover.props.dismissLabel.default).toBe('Got it')
  })

  it('requires a title and renders its trigger', () => {
    expect(Popover.props.title.required).toBe(true)
    const wrapper = mount(Popover, {
      props: { title: 'Legacy records', body: 'Migrated in 2019.' },
      slots: { default: '<button>Why?</button>' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('takes the panel shadow from the token, not a literal', () => {
    const source = readFileSync('src/design-system/components/overlays/Popover.vue', 'utf8')
    expect(source).toMatch(/box-shadow:\s*var\(--sh-panel\)/)
    expect(source).toContain('gutter: 6')
  })
})

describe('HintedText', () => {
  it("draws the dashed underline in the text's own tone", () => {
    // Redline "Hinted trigger" — a tooltip with no visible affordance is
    // invisible to anyone who does not happen to hover there.
    expect(
      mount(HintedText, { props: { tone: 'red' }, slots: { default: '36 days' } }).classes(),
    ).toContain('border-red-border')
    expect(mount(HintedText, { slots: { default: 'x' } }).classes()).toContain('border-soft')
  })

  it('sets cursor: help so the affordance survives without colour', () => {
    expect(readFileSync('src/design-system/components/overlays/HintedText.vue', 'utf8')).toMatch(
      /cursor:\s*help/,
    )
  })
})
