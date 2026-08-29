import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from '../Card.vue'
import CardHeader from '../CardHeader.vue'
import CardBody from '../CardBody.vue'
import CardFooter from '../CardFooter.vue'

describe('Card', () => {
  it('renders a hairline surface at card radius', () => {
    const wrapper = mount(Card, { slots: { default: 'content' } })
    expect(wrapper.classes()).toContain('bg-surface')
    expect(wrapper.classes()).toContain('border-hairline')
    expect(wrapper.classes()).toContain('rounded-card')
    expect(wrapper.classes()).toContain('shadow-card')
    expect(wrapper.text()).toBe('content')
  })
})

describe('CardHeader', () => {
  it('renders the title at section-title scale', () => {
    const wrapper = mount(CardHeader, { props: { title: 'Certificate' } })
    const heading = wrapper.get('h2')
    expect(heading.text()).toBe('Certificate')
    expect(heading.classes()).toContain('text-section-title')
  })

  it('renders a subtitle only when given one', () => {
    const withSub = mount(CardHeader, { props: { title: 'A', subtitle: 'B' } })
    expect(withSub.text()).toContain('B')
    expect(mount(CardHeader, { props: { title: 'A' } }).findAll('p')).toHaveLength(0)
  })

  it('renders an actions slot', () => {
    const wrapper = mount(CardHeader, {
      props: { title: 'A' },
      slots: { actions: '<button class="act">Go</button>' },
    })
    expect(wrapper.find('.act').exists()).toBe(true)
  })

  it('gives the actions row an 8px gap, not the default 10px button-row gap', () => {
    // Redline "Row gap · 10px (8px in dialogs and cards)" — this row is
    // inside a card, so it takes the 8px figure. There is no 8px token;
    // gap-2 is Tailwind's built-in 8px step.
    const wrapper = mount(CardHeader, {
      props: { title: 'A' },
      slots: { actions: '<button class="act">Go</button>' },
    })
    const actionsRow = wrapper.get('.act').element.parentElement
    expect(actionsRow.classList.contains('gap-2')).toBe(true)
    expect(actionsRow.classList.contains('gap-btn-row')).toBe(false)
  })
})

describe('CardBody', () => {
  it('applies the card gutter', () => {
    expect(mount(CardBody).classes()).toContain('px-card-x')
  })

  it('sets body text to the redlined body grey, one step lighter than ink-700', () => {
    // Redline "Body" (Type & layout) · 13.5px / 400 / 1.55 · body grey.
    const classes = mount(CardBody).classes()
    expect(classes).toContain('text-ink-600')
    expect(classes).not.toContain('text-ink-700')
  })
})

describe('CardFooter', () => {
  it('sits on the sunken strip above a divider', () => {
    const wrapper = mount(CardFooter)
    expect(wrapper.classes()).toContain('bg-surface-sunken')
    expect(wrapper.classes()).toContain('border-divider')
  })

  it('gives its button row an 8px gap, not the default 10px button-row gap', () => {
    // Redline "Row gap · 10px (8px in dialogs and cards)" — this row is
    // inside a card, so it takes the 8px figure. There is no 8px token;
    // gap-2 is Tailwind's built-in 8px step.
    const classes = mount(CardFooter).classes()
    expect(classes).toContain('gap-2')
    expect(classes).not.toContain('gap-btn-row')
  })
})
