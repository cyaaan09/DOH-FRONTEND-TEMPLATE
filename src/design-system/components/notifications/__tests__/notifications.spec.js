import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import NotificationCentre from '../NotificationCentre.vue'
import ActivityFeed from '../ActivityFeed.vue'

const ITEMS = [
  {
    id: '1',
    tone: 'error',
    glyph: '!',
    subject: 'Hipol',
    body: 'expires soon.',
    time: '12 min ago',
    action: 'Open record',
    unread: true,
  },
  {
    id: '2',
    tone: 'done',
    glyph: '✓',
    body: 'Inspection recorded.',
    time: '3 hours ago',
    unread: true,
  },
  {
    id: '3',
    tone: 'system',
    glyph: '◔',
    body: 'Certificate expires in 60 days.',
    time: 'Yesterday',
  },
]

describe('NotificationCentre', () => {
  const mountC = (props = {}) => mount(NotificationCentre, { props: { items: ITEMS, ...props } })

  it('counts only the unread', () => {
    expect(mountC().get('[data-unread-count]').text()).toBe('2')
  })

  it('marks unread with a tint and a dot, never bold text', () => {
    // Redline "Unread · row tint + 7px dot right — never bold text".
    // Bolding makes unread a typographic state that cannot be cleared
    // without reflowing the panel.
    const items = mountC().findAll('[data-notif-item]')
    expect(items[0].classes()).toContain('notif__item--unread')
    expect(items[2].classes()).not.toContain('notif__item--unread')
    expect(mountC().findAll('[data-unread-dot]')).toHaveLength(2)

    const source = readFileSync(
      'src/design-system/components/notifications/NotificationCentre.vue',
      'utf8',
    )
    const unread = source.match(/\.notif__item--unread\s*\{[^}]*\}/)[0]
    expect(unread).not.toMatch(/font-weight/)
  })

  it('announces arrivals politely rather than stealing focus', () => {
    // Redline "Live region · aria-live=polite; the panel itself is
    // role=dialog".
    const wrapper = mountC()
    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.html()).toContain('aria-live="polite"')
  })

  it('allows at most one inline action per item', () => {
    // Redline "Item meta · inline action, one per item at most".
    for (const item of mountC().findAll('[data-notif-item]')) {
      expect(item.findAll('[data-notif-action]').length).toBeLessThanOrEqual(1)
    }
  })

  it('hides the tone tile from assistive tech', () => {
    for (const t of mountC().findAll('[data-notif-tile]')) {
      expect(t.attributes('aria-hidden')).toBe('true')
    }
  })
})

describe('ActivityFeed', () => {
  const EVENTS = [
    {
      id: '1',
      initials: 'RV',
      actor: 'R. Villaflor',
      body: 'signed the licence.',
      time: 'Today',
      detail: 'LTO.pdf',
    },
    { id: '2', tone: 'error', glyph: '!', body: 'Returned — illegible.', time: '02 Jun' },
  ]
  const mountF = () => mount(ActivityFeed, { props: { events: EVENTS, label: 'Licence history' } })

  it('is an ordered list, because the order is the content', () => {
    const wrapper = mountF()
    expect(wrapper.element.tagName).toBe('OL')
    expect(wrapper.attributes('aria-label')).toBe('Licence history')
  })

  it('has nothing to dismiss and nothing to mark read', () => {
    // Redline "Feed rules · append-only — corrections are new entries, the
    // wrong one stays visible". A dismiss control would contradict that.
    const html = mountF().html()
    expect(html).not.toMatch(/dismiss|mark.?all|unread/i)
  })

  it('renders a detail inside its own event, not floating free', () => {
    // Redline "Feed detail · renders INSIDE its own event".
    const first = mountF().findAll('[data-feed-event]')[0]
    expect(first.find('[data-feed-detail]').exists()).toBe(true)
    expect(mountF().findAll('[data-feed-event]')[1].find('[data-feed-detail]').exists()).toBe(false)
  })

  it('drops the spine after the last event', () => {
    const source = readFileSync(
      'src/design-system/components/notifications/ActivityFeed.vue',
      'utf8',
    )
    expect(source).toMatch(/:last-child \.feed__spine\s*\{\s*display:\s*none/)
  })
})
