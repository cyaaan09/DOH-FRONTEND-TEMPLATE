import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import PrintPreview from '../PrintPreview.vue'

const mountP = (props = {}) => mount(PrintPreview, { props, slots: { default: '<i/>' } })

describe('PrintPreview', () => {
  it('holds the true A4 aspect at any scale', () => {
    // Redline "Page · A4 portrait at TRUE 210:297 aspect, any scale". Fixed
    // pixels would drift from true at other zooms, and a certificate preview
    // at the wrong proportions teaches the wrong thing about where the
    // signature lands.
    const source = readFileSync('src/design-system/components/print/PrintPreview.vue', 'utf8')
    expect(source).toMatch(/aspect-ratio:\s*210 \/ 297/)
  })

  it('scales the 20mm margin guide with the sheet', () => {
    // 20mm of 210mm is 9.52% — a percentage stays true at every zoom where a
    // pixel inset would not.
    const source = readFileSync('src/design-system/components/print/PrintPreview.vue', 'utf8')
    expect(source).toMatch(/inset:\s*9\.52%/)
  })

  it('gives the sheet square corners, because paper has no radius', () => {
    const source = readFileSync('src/design-system/components/print/PrintPreview.vue', 'utf8')
    const sheet = source.match(/\.print__sheet\s*\{[^}]*\}/)[0]
    expect(sheet).not.toMatch(/border-radius/)
  })

  it('shows the blocking notice and watermark only when unsigned', () => {
    // Redline "Blocking · unsigned certificates cannot reach the tray; the
    // fix is one button away in the notice".
    expect(mountP({ signed: true }).find('[data-blocked-notice]').exists()).toBe(false)
    expect(mountP({ signed: true }).find('[data-watermark]').exists()).toBe(false)

    const blocked = mountP({ signed: false })
    expect(blocked.get('[data-blocked-notice]').text()).toContain('Not signed yet')
    expect(blocked.get('[data-sign-now]').text()).toBe('Sign now')
    expect(blocked.get('[data-watermark]').text()).toBe('UNSIGNED')
  })

  it('hides the watermark from assistive tech', () => {
    expect(mountP({ signed: false }).get('[data-watermark]').attributes('aria-hidden')).toBe('true')
  })

  it('emits sign from the notice', async () => {
    const wrapper = mountP({ signed: false })
    await wrapper.get('[data-sign-now]').trigger('click')
    expect(wrapper.emitted('sign')).toHaveLength(1)
  })
})
