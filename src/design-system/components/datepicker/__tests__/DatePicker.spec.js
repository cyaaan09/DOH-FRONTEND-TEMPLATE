import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import DatePicker from '../DatePicker.vue'

const mountDP = (props = {}) => mount(DatePicker, { props: { label: 'Date issued', ...props } })

describe('DatePicker', () => {
  it('keeps the field editable — the calendar is the assist, not the only path', () => {
    // Redline "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04 ·
    // calendar is never the only path". Typing beats clicking for a date
    // three years out, so there IS a real input.
    const input = mountDP().get('[data-dp-input]')
    expect(input.element.tagName).toBe('INPUT')
    expect(input.attributes('aria-label')).toBe('Date issued')
  })

  it('names the glyph that opens the calendar', () => {
    // It is a control, not decoration, so it carries a name and a tooltip.
    const trigger = mountDP().get('[data-dp-trigger]')
    expect(trigger.attributes('aria-label')).toBe('Open calendar')
    expect(trigger.attributes('title')).toBe('Open calendar')
  })

  it('parses min and max into DateValues rather than passing strings', () => {
    // Zag rejects a raw string, and the failure surfaces as the ROOT being
    // "missing template or render function" — which points nowhere near the
    // cause. This is why the section broke and the component alone did not.
    expect(() => mountDP({ min: '2026-09-03' })).not.toThrow()
    const source = readFileSync('src/design-system/components/datepicker/DatePicker.vue', 'utf8')
    expect(source).toMatch(/parseDate\(props\.min\)/)
    expect(source).toMatch(/parseDate\(props\.max\)/)
  })

  it('accepts a range over two months', () => {
    expect(() =>
      mountDP({ selectionMode: 'range', numOfMonths: 2 }),
    ).not.toThrow()
  })

  it('validates its selection mode', () => {
    const v = DatePicker.props.selectionMode.validator
    expect(v('single')).toBe(true)
    expect(v('range')).toBe(true)
    expect(v('multiple')).toBe(false)
  })

  it('strikes unavailable days rather than hiding them', () => {
    // Redline "Day states · unavailable --border-soft struck". The rule card
    // is explicit that a hidden day teaches nothing — the user hunts for a
    // date that is simply absent instead of learning the constraint.
    const source = readFileSync('src/design-system/components/datepicker/DatePicker.vue', 'utf8')
    const disabled = source.match(/\.dp__day\[data-disabled\]\s*\{[^}]*\}/)[0]
    expect(disabled).toMatch(/text-decoration:\s*line-through/)
    expect(disabled).not.toMatch(/display:\s*none|visibility:\s*hidden/)
  })

  it('grows its cells to 44px on a narrow viewport', () => {
    // Redline "Mobile · 44px cells" — a 32px target is unusable by thumb.
    const source = readFileSync('src/design-system/components/datepicker/DatePicker.vue', 'utf8')
    expect(source).toMatch(/@media \(max-width: 419px\)[\s\S]*?44px/)
  })
})
