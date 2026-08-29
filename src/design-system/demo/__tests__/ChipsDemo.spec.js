import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChipsDemo from '../ChipsDemo.vue'

describe('ChipsDemo', () => {
  it('removes exactly the dismissed chip using the { chipKey, value } payload', async () => {
    // DismissibleChip now emits an object payload instead of a bare value
    // (Finding 9 — a bare value can't disambiguate two chips that share a
    // value under different keys). This exercises the full wiring: if
    // ChipsDemo's handler still expected the old bare-value shape, the
    // filter predicate would compare a string to an object, match nothing,
    // and the click would silently do nothing.
    const wrapper = mount(ChipsDemo)

    const removeButtons = wrapper.findAll('button[aria-label^="Remove"]')
    expect(removeButtons).toHaveLength(3)

    await removeButtons[0].trigger('click')

    expect(wrapper.text()).not.toContain('Status:')
    expect(wrapper.text()).toContain('Expiry:')
    expect(wrapper.text()).toContain('Source:')
    expect(wrapper.findAll('button[aria-label^="Remove"]')).toHaveLength(2)
  })
})
