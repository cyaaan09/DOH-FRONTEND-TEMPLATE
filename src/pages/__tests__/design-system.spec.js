import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DesignSystemPage from '../design-system.vue'

describe('design system page', () => {
  it('renders a section per component family built so far', () => {
    const wrapper = mount(DesignSystemPage)
    for (const heading of ['Type scale', 'Buttons', 'Chips', 'Cards', 'Text fields', 'Feedback']) {
      expect(wrapper.text(), `missing section: ${heading}`).toContain(heading)
    }
  })

  it('exercises every button variant so the page is a real acceptance surface', () => {
    const wrapper = mount(DesignSystemPage)
    expect(wrapper.text()).toContain('Verify & save')
    expect(wrapper.text()).toContain('Revoke licence')
  })

  it('renders all six chip tones', () => {
    const wrapper = mount(DesignSystemPage)
    for (const tone of ['Approved', 'Pending', 'Returned', 'Closed', 'Online', 'Legacy']) {
      expect(wrapper.text(), `missing chip: ${tone}`).toContain(tone)
    }
  })
})
